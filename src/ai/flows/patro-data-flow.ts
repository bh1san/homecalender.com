
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * It intelligently falls back to AI generation if the Nepali Calendar API is unavailable.
 *
 * - getPatroData - A function that fetches all daily data for the app.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  PatroDataResponse, 
  PatroDataResponseSchema, 
  HoroscopeSchema,
  GoldSilverSchema,
  ForexSchema,
  UpcomingEvent,
  UpcomingEventSchema,
  CurrentDateInfoResponse,
  CurrentDateInfoResponseSchema,
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

const rashiNames = ["Mesh", "Brish", "Mithun", "Karkat", "Simha", "Kanya", "Tula", "Brishchik", "Dhanu", "Makar", "Kumbha", "Meen"];

const generateAIFallbackData = async (): Promise<Omit<PatroDataResponse, 'today' | 'upcomingEvents'>> => {
    console.log("Generating patro data using AI fallback...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
        const fullHoroscope: Horoscope[] = aiResponse.horoscope.map((h, index) => ({
            name: h.rashi,
            rashi: h.rashi, // Ensure this matches schema, name is more descriptive
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

const TodayApiResponseSchema = z.object({
    year: z.number(),
    month: z.number(),
    day: z.number(),
    ad_year: z.number(),
    ad_month: z.number(),
    ad_day: z.number(),
    tithi: z.string(),
});

const HolidaysApiResponseSchema = z.array(z.object({
    event_title: z.string(),
    event_date: z.string(),
}));


const fetchFromRapidAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://nepali-calendar-api.p.rapidapi.com/api/v1';
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
        console.error("RapidAPI key is not configured. Please add RAPIDAPI_KEY to your .env file.");
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'nepali-calendar-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            console.error(`API request to ${endpoint} failed with status ${response.status}: ${await response.text()}`);
            return null;
        }

        const data = await response.json();
        const parsed = schema.safeParse(data);

        if (!parsed.success) {
            console.error(`Failed to parse API response from ${endpoint}:`, parsed.error);
            return null;
        }
        return parsed.data;
    } catch (error) {
        console.error(`Error fetching from API endpoint ${endpoint}:`, error);
        return null;
    }
};

const processTodayData = (data: z.infer<typeof TodayApiResponseSchema>): CurrentDateInfoResponse | null => {
    if (!data) return null;
    return {
        bsYear: data.year,
        bsMonth: data.month,
        bsDay: data.day,
        adYear: data.ad_year,
        adMonth: data.ad_month,
        adDay: data.ad_day,
        tithi: data.tithi,
    };
};

const processHolidays = (data: z.infer<typeof HolidaysApiResponseSchema>): UpcomingEvent[] => {
    if (!data) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data
        .map(event => {
            const eventDate = new Date(event.event_date);
            return {
                summary: event.event_title,
                startDate: event.event_date,
                isHoliday: true,
                eventDate: eventDate
            };
        })
        .filter(event => event.eventDate >= today)
        .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
        .map(({ eventDate, ...rest }) => rest);
};


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = `patro_data_v15_rapidapi`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data.");
        return cachedData;
    }

    console.log("Fetching new Patro data from sources...");

    const apiKey = process.env.RAPIDAPI_KEY;

    let todayInfo: CurrentDateInfoResponse | null = null;
    let upcomingEvents: UpcomingEvent[] = [];
    let aiData: Omit<PatroDataResponse, 'today' | 'upcomingEvents'> = { horoscope: [], goldSilver: null, forex: [] };


    if (apiKey) {
      const [todayRawData, holidaysRawData] = await Promise.all([
          fetchFromRapidAPI(`date`, TodayApiResponseSchema),
          fetchFromRapidAPI(`holidays`, HolidaysApiResponseSchema)
      ]);
      
      todayInfo = todayRawData ? processTodayData(todayRawData) : null;
      upcomingEvents = holidaysRawData ? processHolidays(holidaysRawData) : [];
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
