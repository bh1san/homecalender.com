
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * It also fetches today's date info and upcoming events from the Nepali Calendar API.
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
  UpcomingEventSchema,
  CurrentDateInfoResponse
} from '@/ai/schemas';
import { getTodaysInfoFromApi } from '@/services/nepali-date';

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
    
    // Fetch from API and Scraper in parallel
    const [apiData, scraperResponse] = await Promise.all([
      getTodaysInfoFromApi().catch(e => {
        console.error("API call to getTodaysInfoFromApi failed:", e);
        return null;
      }),
      scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
      }),
    ]);

    let today: CurrentDateInfoResponse | null = null;
    let upcomingEvents: z.infer<typeof UpcomingEventSchema>[] = [];
    
    if (apiData) {
        const adWeekDay = apiData.ad_day_of_week_en - 1;
        today = {
            bsYear: apiData.bs_year_en,
            bsMonth: apiData.bs_month_code_en,
            bsDay: apiData.bs_day_en,
            bsWeekDay: adWeekDay,
            adYear: apiData.ad_year_en,
            adMonth: apiData.ad_month_code_en - 1,
            adDay: apiData.ad_day_en,
            day: apiData.bs_day_en,
            tithi: apiData.tithi.tithi_name_np,
            events: apiData.events.map(e => e.event_title_np).filter((e): e is string => !!e),
            is_holiday: apiData.is_holiday,
            panchanga: apiData.panchanga.panchanga_np,
        };

        upcomingEvents = apiData.events
            .filter((e): e is { event_title_np: string; event_title_en: string; is_public_holiday: boolean } => !!e.event_title_np && !!e.event_title_en)
            .map(e => ({
                summary: e.event_title_np,
                startDate: `${apiData.ad_year_en}-${String(apiData.ad_month_code_en).padStart(2, '0')}-${String(apiData.ad_day_en).padStart(2, '0')}`,
                isHoliday: e.is_public_holiday,
            }))
            .slice(0, 8);
    }
    
    const response: PatroDataResponse = {
        horoscope: scraperResponse?.horoscope || [],
        goldSilver: scraperResponse?.goldSilver || null,
        forex: scraperResponse?.forex || [],
        today: today,
        upcomingEvents: upcomingEvents,
    };

    patroDataCache = response;
    lastFetchTime = now;

    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
