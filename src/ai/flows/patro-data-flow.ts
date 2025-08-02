
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * It also fetches today's date info and all calendar event data for the current month.
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
  CurrentDateInfoResponseSchema,
  CalendarEventSchema,
  UpcomingEventSchema,
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
    today: CurrentDateInfoResponseSchema.describe("Full information for today's date."),
    monthEvents: z.array(CalendarEventSchema).describe("A list of all events for the current month."),
    upcomingEvents: z.array(UpcomingEventSchema).describe("A list of 8 upcoming events/holidays.")
});

const scraperPrompt = ai.definePrompt({
    name: 'scraperPrompt',
    output: { schema: ScraperDataSchema },
    prompt: `You are a data provider for a Nepali calendar application. Generate a complete and realistic set of data for today. Today's Gregorian date is ${new Date().toISOString().split('T')[0]}.
    
    1.  **Horoscope (Rashifal):** Generate a unique, plausible-sounding horoscope for all 12 rashi (zodiac signs: Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen).
    2.  **Gold/Silver Prices:** Provide realistic prices for Fine Gold (99.9%), Tejabi Gold, and Silver in Nepalese Rupees (NPR) per Tola.
    3.  **Foreign Exchange (Forex):** Provide a list of buy and sell rates for at least 15 major currencies against NPR. Include the currency name, ISO3 code, unit, and a valid flag image URL.
    4.  **Today's Date:** Generate the full date details for today. This includes BS and AD dates, day of the week, tithi, panchanga, and any events. The BS weekday should be a number from 0 (Sunday) to 6 (Saturday).
    5.  **Month Events:** Generate a complete list of events for the current Nepali month. Each day should have its day number, tithi, gregorian day, events list, holiday status, and panchanga.
    6.  **Upcoming Events:** Generate a list of 8 plausible upcoming events or holidays for Nepal, including their summary, start date (YYYY-MM-DD), and holiday status.
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

    console.log("Attempting to fetch data from RapidAPI...");
    
    let today: CurrentDateInfoResponse | null = null;
    let monthEvents: z.infer<typeof CalendarEventSchema>[] = [];
    
    try {
        const todayApiData = await getTodaysInfoFromApi();
        const adWeekDay = todayApiData.ad_day_of_week_en - 1; // API is 1-indexed, JS is 0-indexed
        today = {
            bsYear: todayApiData.bs_year_en,
            bsMonth: todayApiData.bs_month_code_en,
            bsDay: todayApiData.bs_day_en,
            bsWeekDay: adWeekDay < 0 ? 6 : adWeekDay, // handle Sunday case
            adYear: todayApiData.ad_year_en,
            adMonth: todayApiData.ad_month_code_en - 1,
            adDay: todayApiData.ad_day_en,
            day: todayApiData.bs_day_en,
            tithi: todayApiData.tithi.tithi_name_np,
            events: todayApiData.events.map(e => e.event_title_np).filter((e): e is string => !!e),
            is_holiday: todayApiData.is_holiday,
            panchanga: todayApiData.panchanga.panchanga_np,
        };

        const monthApiData = await getEventsForMonthFromApi(today.bsYear, today.bsMonth);
        monthEvents = monthApiData.map(day => ({
            day: day.bs_day_en,
            gregorian_day: day.ad_day_en,
            tithi: day.tithi.tithi_name_np,
            events: day.events.map(e => e.event_title_np).filter((e): e is string => !!e),
            is_holiday: day.is_holiday,
            panchanga: day.panchanga.panchanga_np,
        }));
        
        console.log("Successfully fetched data from RapidAPI.");

    } catch (apiError) {
        console.warn("RapidAPI call failed. Falling back to AI generation.", apiError instanceof Error ? apiError.message : apiError);
    }
    
    // If API fails or is not configured, AI generation is used as a fallback for all data.
    // This ensures the app is always functional.
    if (!today || monthEvents.length === 0) {
        console.log("Generating all patro data using AI fallback...");
        const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
            console.error("AI call to scraperPrompt failed:", e);
            return null;
        });

        if (aiResponse) {
             const response: PatroDataResponse = {
                horoscope: aiResponse.horoscope,
                goldSilver: aiResponse.goldSilver,
                forex: aiResponse.forex,
                today: aiResponse.today,
                monthEvents: aiResponse.monthEvents,
                upcomingEvents: aiResponse.upcomingEvents,
            };
            patroDataCache = response;
            lastFetchTime = now;
            console.log("AI data generation successful.");
            return response;
        } else {
             // If AI also fails, return an empty but valid response shape to prevent crashes
             const emptyResponse: PatroDataResponse = {
                horoscope: [], goldSilver: null, forex: [], today: null, monthEvents: [], upcomingEvents: []
             };
             patroDataCache = emptyResponse;
             lastFetchTime = now;
             return emptyResponse;
        }
    }
    
    // If API was successful, we still need to generate the rest of the data.
    console.log("API data successful, generating remaining data from AI...");
    const scraperResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null; // Return null on failure
    });
    
    const response: PatroDataResponse = {
        horoscope: scraperResponse?.horoscope || [],
        goldSilver: scraperResponse?.goldSilver || null,
        forex: scraperResponse?.forex || [],
        today: today, // From API
        monthEvents: monthEvents, // From API
        upcomingEvents: scraperResponse?.upcomingEvents || (today ? today.events.map(event => ({
            summary: event,
            startDate: `${today?.adYear}-${String(today?.adMonth + 1).padStart(2, '0')}-${String(today?.adDay).padStart(2, '0')}`,
            isHoliday: false
        })).slice(0, 8) : []),
    };

    patroDataCache = response;
    lastFetchTime = now;

    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}

    
