
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
import { getFromCache, setInCache } from '@/ai/cache';
import NepaliCalendar from 'nepali-calendar-js';

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
    4.  **Today's Date:** Generate the full date details for today. This includes BS and AD dates, day of the week, tithi, panchanga, and any events. The BS weekday should be a number from 0 (Sunday) to 6 (Saturday). The adMonth should be 0-indexed.
    5.  **Month Events:** Generate a complete list of events for the current Nepali month. Each day should have its day number, tithi, gregorian day, events list, holiday status, and panchanga.
    6.  **Upcoming Events:** Generate a list of 8 plausible upcoming events or holidays for Nepal, including their summary, start date (YYYY-MM-DD), and holiday status.
    `
});

const generateAllDataFromAI = async (): Promise<PatroDataResponse> => {
    console.log("Generating all patro data using AI fallback...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
         return {
            horoscope: aiResponse.horoscope,
            goldSilver: aiResponse.goldSilver,
            forex: aiResponse.forex,
            today: aiResponse.today,
            monthEvents: aiResponse.monthEvents,
            upcomingEvents: aiResponse.upcomingEvents,
        };
    }
    // If AI also fails, return an empty but valid response shape to prevent crashes
    return {
        horoscope: [], goldSilver: null, forex: [], today: null, monthEvents: [], upcomingEvents: []
    };
};


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = "patro_data_nepal";
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data.");
        return cachedData;
    }

    console.log("Generating data using nepali-calendar-js and AI...");
    
    let todayData: CurrentDateInfoResponse | null = null;
    
    try {
        const cal = new NepaliCalendar();
        const bsDate = cal.toBS(new Date());

        todayData = {
            bsYear: bsDate.bs_year,
            bsMonth: bsDate.bs_month,
            bsDay: bsDate.bs_date,
            bsWeekDay: bsDate.bs_day_of_week - 1, // Theirs is 1-7, we use 0-6
            adYear: bsDate.ad_year,
            adMonth: bsDate.ad_month - 1, // Theirs is 1-12, we use 0-11
            adDay: bsDate.ad_date,
            day: bsDate.bs_date,
            tithi: 'N/A', // Library does not provide this
            events: [], // Library does not provide this
            is_holiday: false, // Library does not provide this
            panchanga: '', // Library does not provide this
        };
    } catch (error) {
         console.warn("nepali-calendar-js failed. Full AI fallback will be used.", error instanceof Error ? error.message : error);
    }
    
    // If local calendar failed, or we need other data, use AI.
    if (!todayData) {
        const aiData = await generateAllDataFromAI();
        setInCache(cacheKey, aiData);
        return aiData;
    }
    
    // Generate only the remaining data from AI.
    console.log("Local calendar data successful, generating remaining data from AI...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });
    
    const response: PatroDataResponse = {
        horoscope: aiResponse?.horoscope || [],
        goldSilver: aiResponse?.goldSilver || null,
        forex: aiResponse?.forex || [],
        today: { // Mix local and AI data for today
            ...todayData,
            tithi: aiResponse?.today?.tithi ?? 'N/A',
            events: aiResponse?.today?.events ?? [],
            is_holiday: aiResponse?.today?.is_holiday ?? false,
            panchanga: aiResponse?.today?.panchanga ?? '',
        },
        monthEvents: aiResponse?.monthEvents || [], // AI still needed for full month events
        upcomingEvents: aiResponse?.upcomingEvents || [],
    };

    setInCache(cacheKey, response);

    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
