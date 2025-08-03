
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * It now uses the nepalicalendar.sajjan.com.np public API for calendar data.
 *
 * - getPatroData - A function that fetches all daily data for the app.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import NepaliDate from 'nepali-date-converter';
import { 
  PatroDataResponse, 
  PatroDataResponseSchema, 
  Horoscope,
  HoroscopeSchema,
  GoldSilverSchema,
  ForexSchema,
  UpcomingEvent,
  CurrentDateInfoResponse,
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ScraperDataSchema = z.object({
    horoscope: z.array(z.object({
      rashi: z.string().describe("The name of the rashi (zodiac sign) in Nepali, e.g., 'Mesh'"),
      text: z.string().describe("The horoscope prediction text.")
    })).describe("A list of 12 horoscopes for each rashi."),
    goldSilver: GoldSilverSchema.describe("A list of gold and silver prices."),
    forex: z.array(ForexSchema).describe("A list of foreign exchange rates against NPR."),
});

const scraperPrompt = ai.definePrompt({
    name: 'scraperPrompt',
    output: { schema: ScraperDataSchema },
    prompt: `You are a data provider for a Nepali calendar application. Generate a complete and realistic set of data for today. Today's Gregorian date is ${new Date().toISOString().split('T')[0]}.
    
    1.  **Horoscope (Rashifal):** Generate a unique, plausible-sounding horoscope for all 12 rashi (zodiac signs: Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen). The 'rashi' field should contain the name of the sign.
    2.  **Gold/Silver Prices:** Provide realistic prices for Fine Gold (99.9%), Tejabi Gold, and Silver in Nepalese Rupees (NPR) per Tola.
    3.  **Foreign Exchange (Forex):** Provide a list of buy and sell rates for at least 15 major currencies against NPR. Include the currency name, ISO3 code, unit, and a valid flag image URL.
    `
});

const generateAIFallbackData = async (): Promise<Omit<PatroDataResponse, 'today' | 'upcomingEvents'>> => {
    console.log("Generating patro data using AI fallback...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
        const fullHoroscope: Horoscope[] = aiResponse.horoscope.map((h, index) => ({
            name: h.rashi,
            rashi: h.rashi,
            text: h.text,
        }));
         return {
            horoscope: fullHoroscope,
            goldSilver: aiResponse.goldSilver,
            forex: aiResponse.forex,
        };
    }
    // If AI also fails, return an empty but valid response shape to prevent crashes
    return {
        horoscope: [], goldSilver: null, forex: []
    };
};

const SajjanApiMonthSchema = z.object({
    days: z.array(z.object({
        n: z.string(),
        e: z.string(),
        t: z.string(),
        f: z.string(),
        h: z.boolean(),
        d: z.number(),
    })),
    holiFest: z.array(z.string()),
});

const fetchFromSajjanAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://nepalicalendar.sajjan.com.np/data';
    try {
        const response = await fetch(`${baseUrl}/${endpoint}`);
        if (!response.ok) {
            console.error(`Sajjan API request to ${endpoint} failed with status ${response.status}: ${await response.text()}`);
            return null;
        }
        const data = await response.json();
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            console.error(`Failed to parse Sajjan API response from ${endpoint}:`, parsed.error);
            return null;
        }
        return parsed.data;
    } catch (error) {
        console.error(`Error fetching from Sajjan API endpoint ${endpoint}:`, error);
        return null;
    }
};

const processTodayData = (bsDate: NepaliDate, monthData: z.infer<typeof SajjanApiMonthSchema>): CurrentDateInfoResponse | null => {
    if (!monthData) return null;
    
    const bsDay = bsDate.getDate();
    const bsDayString = new NepaliDate(0,0,0).convert(String(bsDay), 'en', 'np');
    
    const todayData = monthData.days.find(d => d.n === bsDayString);
    if (!todayData) return null;

    const adDate = bsDate.toJsDate();

    return {
        bsYear: bsDate.getYear(),
        bsMonth: bsDate.getMonth() + 1,
        bsDay: bsDay,
        adYear: adDate.getFullYear(),
        adMonth: adDate.getMonth() + 1,
        adDay: adDate.getDate(),
        tithi: todayData.t,
    };
};

const processHolidays = (monthData: z.infer<typeof SajjanApiMonthSchema>, bsYear: number, bsMonth: number): UpcomingEvent[] => {
    if (!monthData) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events: UpcomingEvent[] = [];
    const addedSummaries = new Set<string>();

    const tempDateConverter = new NepaliDate(0,0,0);

    // Process holiFest
    if (monthData.holiFest) {
        monthData.holiFest.forEach(eventStr => {
            const match = eventStr.match(/^(\S+)\s*गते\s*(.*)/);
            if (match) {
                try {
                    const dayNp = match[1];
                    const dayEn = tempDateConverter.convert(dayNp, 'np', 'en');
                    const day = parseInt(dayEn);
                    const summary = match[2];

                    if (!isNaN(day) && !addedSummaries.has(summary)) {
                        const eventDate = new NepaliDate(bsYear, bsMonth -1, day).toJsDate();
                        if (eventDate >= today) {
                            events.push({
                                summary: summary,
                                startDate: eventDate.toISOString().split('T')[0],
                                isHoliday: true // Assuming holiFest items are holidays
                            });
                            addedSummaries.add(summary);
                        }
                    }
                } catch (e) {
                    console.error("Could not parse holiFest date:", eventStr, e);
                }
            }
        });
    }

    // Add day-specific festivals
     monthData.days.forEach(day => {
        if (day.f) {
             try {
                const dayNum = parseInt(tempDateConverter.convert(day.n, 'np', 'en'));
                if (isNaN(dayNum)) return;
                
                const eventDate = new NepaliDate(bsYear, bsMonth - 1, dayNum).toJsDate();

                if (eventDate >= today && !addedSummaries.has(day.f)) {
                     events.push({
                        summary: day.f,
                        startDate: eventDate.toISOString().split('T')[0],
                        isHoliday: day.h
                    });
                    addedSummaries.add(day.f);
                }
             } catch (e) {
                console.error("Could not parse day-specific festival date:", day, e);
             }
        }
    });
    
    return events.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = `patro_data_v17_sajjan`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data (Sajjan API).");
        return cachedData;
    }

    console.log("Fetching new Patro data from sources (Sajjan API)...");

    let todayInfo: CurrentDateInfoResponse | null = null;
    let upcomingEvents: UpcomingEvent[] = [];
    let aiData: Omit<PatroDataResponse, 'today' | 'upcomingEvents'> = { horoscope: [], goldSilver: null, forex: [] };

    const todayBS = new NepaliDate();
    const bsYear = todayBS.getYear();
    const bsMonth = todayBS.getMonth() + 1; // 1-indexed
    
    const monthData = await fetchFromSajjanAPI(`${bsYear}/${bsMonth}.json`, SajjanApiMonthSchema);

    if (monthData) {
        todayInfo = processTodayData(todayBS, monthData);
        upcomingEvents = processHolidays(monthData, bsYear, bsMonth);
    }
    
    // Always fetch AI data for horoscope, gold/silver, forex
    aiData = await generateAIFallbackData();
    
    const response: PatroDataResponse = {
        ...aiData,
        today: todayInfo,
        upcomingEvents: upcomingEvents,
    };
    
    setInCache(cacheKey, response);
    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
