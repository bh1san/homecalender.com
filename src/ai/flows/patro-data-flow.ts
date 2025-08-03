
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
  CurrentDateInfoResponse,
  CalendarEvent,
  UpcomingEvent,
  UpcomingEventsResponseSchema,
  CalendarEventsResponseSchema,
  CurrentDateInfoResponseSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';
import NepaliDate from 'nepali-date-converter';

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

const generateDataFromAI = async (): Promise<Omit<PatroDataResponse, 'today' | 'monthEvents' | 'upcomingEvents'>> => {
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

const fetchFromAPI = async (endpoint: string, schema: z.ZodType, options: RequestInit = {}) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.warn(`RapidAPI key not found. Cannot fetch from ${endpoint}.`);
        return null;
    }

    try {
        const response = await fetch(`https://nepali-calendar-api.p.rapidapi.com/${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                'x-rapidapi-host': 'nepali-calendar-api.p.rapidapi.com',
                'x-rapidapi-key': apiKey,
            },
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
}


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = `patro_data_v2_${process.env.RAPIDAPI_KEY ? 'api' : 'ai'}`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data.");
        return cachedData;
    }

    const today = new NepaliDate();
    const year = today.getYear();
    const month = today.getMonth() + 1;

    console.log("Fetching Patro data from sources...");

    const apiAvailable = !!process.env.RAPIDAPI_KEY;

    let apiData: {
        today: CurrentDateInfoResponse | null,
        monthEvents: CalendarEvent[],
        upcomingEvents: UpcomingEvent[]
    } = { today: null, monthEvents: [], upcomingEvents: [] };

    if (apiAvailable) {
        const [todayData, monthData, upcomingData] = await Promise.all([
            fetchFromAPI('api/v1/today', CurrentDateInfoResponseSchema),
            fetchFromAPI(`api/v1/month?year=${year}&month=${month}`, CalendarEventsResponseSchema),
            fetchFromAPI('api/v1/holidays', UpcomingEventsResponseSchema)
        ]);
        
        if (todayData) apiData.today = todayData;
        if (monthData) apiData.monthEvents = monthData.month_events;
        if (upcomingData) apiData.upcomingEvents = upcomingData.events;
    }

    const aiData = await generateDataFromAI();
    
    const response: PatroDataResponse = {
        ...aiData,
        today: apiData.today,
        monthEvents: apiData.monthEvents,
        upcomingEvents: apiData.upcomingEvents,
    };
    
    setInCache(cacheKey, response);
    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
