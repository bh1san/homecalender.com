
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * It also fetches today's date info and all calendar event data for the current month from the Nepali Calendar API.
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
  CalendarEventSchema
} from '@/ai/schemas';
import { getTodaysInfoFromApi, getEventsForMonthFromApi } from '@/services/nepali-date';

// In-memory cache for patro data, specific to Nepal
let patroDataCache: PatroDataResponse | null = null;
let lastFetchTime: number | null = null;

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ScraperDataSchema = z.object({
    horoscope: z.array(HoroscopeSchema).describe("A list of 12 horoscopes for each rashi."),
    goldSilver: GoldSilverSchema.describe("A list of gold and silver prices."),
    forex: z.array(ForexSchema).describe("A list of foreign exchange rates against NPR."),
});

const scraperPrompt = ai.definePrompt({
    name: 'scraperPrompt',
    output: { schema: ScraperDataSchema },
    prompt: `You are a data provider for a Nepali calendar application. Generate a complete and realistic set of data for today.
    
    1.  **Horoscope (Rashifal):** Generate a unique, plausible-sounding horoscope for all 12 rashi (zodiac signs: Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen).
    2.  **Gold/Silver Prices:** Provide realistic prices for Fine Gold (99.9%), Tejabi Gold, and Silver in Nepalese Rupees (NPR) per Tola.
    3.  **Foreign Exchange (Forex):** Provide a list of buy and sell rates for at least 15 major currencies against NPR. Include the currency name, ISO3 code, unit, and a flag image URL (use a valid flag provider URL).
    `
});

const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const now = Date.now();
    if (patroDataCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION_MS)) {
        console.log("Returning cached patro data.");
        return patroDataCache;
    }

    console.log("Fetching data from APIs and AI...");
    
    let today: CurrentDateInfoResponse | null = null;
    let monthEvents: z.infer<typeof CalendarEventSchema>[] = [];
    
    // Fetch today's info first to determine the current month
    const todayApiData = await getTodaysInfoFromApi().catch(e => {
        console.error("API call to getTodaysInfoFromApi failed:", e);
        return null;
    });

    if (todayApiData) {
        const adWeekDay = todayApiData.ad_day_of_week_en - 1;
        today = {
            bsYear: todayApiData.bs_year_en,
            bsMonth: todayApiData.bs_month_code_en,
            bsDay: todayApiData.bs_day_en,
            bsWeekDay: adWeekDay < 0 ? 6 : adWeekDay,
            adYear: todayApiData.ad_year_en,
            adMonth: todayApiData.ad_month_code_en - 1, // Their API is 1-12, JS is 0-11
            adDay: todayApiData.ad_day_en,
            day: todayApiData.bs_day_en,
            tithi: todayApiData.tithi.tithi_name_np,
            events: todayApiData.events.map(e => e.event_title_np).filter((e): e is string => !!e),
            is_holiday: todayApiData.is_holiday,
            panchanga: todayApiData.panchanga.panchanga_np,
        };

        // Now fetch the entire month's data
        const monthApiData = await getEventsForMonthFromApi(today.bsYear, today.bsMonth).catch(e => {
            console.error(`API call to getEventsForMonthFromApi for ${today?.bsYear}-${today?.bsMonth} failed:`, e);
            return []; // Return empty array on failure
        });
        
        if (monthApiData.length > 0) {
           monthEvents = monthApiData.map(day => ({
              day: day.bs_day_en,
              gregorian_day: day.ad_day_en,
              tithi: day.tithi.tithi_name_np,
              events: day.events.map(e => e.event_title_np).filter((e): e is string => !!e),
              is_holiday: day.is_holiday,
              panchanga: day.panchanga.panchanga_np,
          }));
        }
    }

    const scraperResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });
    
    const response: PatroDataResponse = {
        horoscope: scraperResponse?.horoscope || [],
        goldSilver: scraperResponse?.goldSilver || null,
        forex: scraperResponse?.forex || [],
        today: today,
        monthEvents: monthEvents, // Add month events to the response
        upcomingEvents: today ? today.events.map(event => ({
            summary: event,
            startDate: `${today?.adYear}-${String(today?.adMonth + 1).padStart(2, '0')}-${String(today?.adDay).padStart(2, '0')}`,
            isHoliday: false // This info might not be directly available for all events here
        })).slice(0, 8) : [],
    };

    patroDataCache = response;
    lastFetchTime = now;

    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
