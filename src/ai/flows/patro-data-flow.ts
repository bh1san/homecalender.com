
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
  NpEventsApiResponseSchema,
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ScraperDataSchema = z.object({
    horoscope: z.array(HoroscopeSchema).describe("A list of 12 horoscopes for each rashi."),
    goldSilver: GoldSilverSchema.describe("A list of gold and silver prices."),
    forex: z.array(ForexSchema).describe("A list of foreign exchange rates against NPR."),
});

const scraperPrompt = ai.definePrompt({
    name: 'scraperPrompt',
    output: { schema: ScraperDataSchema },
    prompt: `You are a data provider for a Nepali calendar application. Generate a complete and realistic set of data for today. Today's Gregorian date is ${new Date().toISOString().split('T')[0]}.
    
    1.  **Horoscope (Rashifal):** Generate a unique, plausible-sounding horoscope for all 12 rashi (zodiac signs: Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen).
    2.  **Gold/Silver Prices:** Provide realistic prices for Fine Gold (99.9%), Tejabi Gold, and Silver in Nepalese Rupees (NPR) per Tola.
    3.  **Foreign Exchange (Forex):** Provide a list of buy and sell rates for at least 15 major currencies against NPR. Include the currency name, ISO3 code, unit, and a valid flag image URL.
    `
});

const generateAIFallbackData = async (): Promise<Omit<PatroDataResponse, 'monthEvents' | 'upcomingEvents'>> => {
    console.log("Generating patro data using AI fallback...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
         return {
            horoscope: aiResponse.horoscope,
            goldSilver: aiResponse.goldSilver,
            forex: aiResponse.forex,
        };
    }
    // If AI also fails, return an empty but valid response shape to prevent crashes
    return {
        horoscope: [], goldSilver: null, forex: []
    };
};

const fetchFromNpEventsAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://npclapi.casualsnek.eu.org';
    try {
        const response = await fetch(`${baseUrl}/${endpoint}`);

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

const processRangeData = (data: z.infer<typeof NpEventsApiResponseSchema>): UpcomingEvent[] => {
    const events: UpcomingEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (!data) return events;

    Object.values(data).forEach(yearData => {
        Object.values(yearData).forEach(monthData => {
            Object.values(monthData).forEach(dayData => {
                const eventDate = new Date(dayData.date.ad.year, dayData.date.ad.month - 1, dayData.date.ad.day);

                // Only include events that are today or in the future
                if (eventDate >= today && dayData.public_holiday) {
                    const allEvents = dayData.event.join(', ');
                    events.push({
                        summary: allEvents || "Public Holiday",
                        startDate: `${dayData.date.ad.year}-${String(dayData.date.ad.month).padStart(2, '0')}-${String(dayData.date.ad.day).padStart(2, '0')}`,
                        isHoliday: dayData.public_holiday
                    });
                }
            });
        });
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return events;
};


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = `patro_data_v5_npclapi_holidays`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data.");
        return cachedData;
    }

    console.log("Fetching Patro data from sources...");

    // Fetch all public holidays for the current Nepali year.
    const upcomingData = await fetchFromNpEventsAPI(`v2/date/bs/@cur_year?only_holidays=1`, NpEventsApiResponseSchema);
    
    const upcomingEvents = upcomingData ? processRangeData(upcomingData) : [];
    
    const aiData = await generateAIFallbackData();
    
    const response: PatroDataResponse = {
        ...aiData,
        monthEvents: [], // monthEvents are now fetched on demand in the calendar component
        upcomingEvents: upcomingEvents,
    };
    
    setInCache(cacheKey, response);
    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
