
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using Genkit AI.
 * Today's date information for the banner is sourced locally for reliability.
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
  UpcomingEventSchema,
  CurrentDateInfoResponse,
  CurrentDateInfoResponseSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';
import customEventsData from '@/data/custom-events.json';
import { getMonthEvents } from './month-events-flow';

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

const generateAIFallbackData = async (): Promise<Omit<PatroDataResponse, 'today' | 'upcomingEvents' | 'todaysEvent'>> => {
    console.log("Generating patro data using AI fallback...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
        const fullHoroscope: Horoscope[] = aiResponse.horoscope.map((h, index) => ({
            rashi: h.rashi,
            name: h.rashi, // Ensure name is populated
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

const getLocalTodayData = (): { todayInfo: CurrentDateInfoResponse, todaysEvent?: string } => {
    const todayAD = new Date();
    todayAD.setHours(0, 0, 0, 0);

    const todayBS = new NepaliDate(todayAD);
    const npMonths = ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'];
    const npDays = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];

    const todayInfo: CurrentDateInfoResponse = {
        bsYear: todayBS.getYear(),
        bsMonth: todayBS.getMonth() + 1,
        bsDay: todayBS.getDate(),
        bsMonthName: npMonths[todayBS.getMonth()],
        dayOfWeek: npDays[todayBS.getDay()],
        adYear: todayAD.getFullYear(),
        adMonth: todayAD.getMonth() + 1,
        adDay: todayAD.getDate(),
    };
    
    // Find custom event for today
    const todayADString = todayAD.toISOString().split('T')[0];
    const todaysCustomEvent = customEventsData.find(event => event.startDate === todayADString);
    
    return { todayInfo, todaysEvent: todaysCustomEvent?.summary };
};


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    const cacheKey = `patro_data_v25_local_today`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data (local today).");
        return cachedData;
    }

    console.log("Fetching new Patro data from sources (local today)...");

    let aiData: Omit<PatroDataResponse, 'today' | 'upcomingEvents' | 'todaysEvent'> = { horoscope: [], goldSilver: null, forex: [] };

    const { todayInfo, todaysEvent } = getLocalTodayData();
    
    // Fetch AI data for horoscope, gold/silver, forex in parallel
    aiData = await generateAIFallbackData();

    // Fetch and process events for the upcoming events list
    // This will fetch from API and merge with local custom events
    const monthEvents = await getMonthEvents({ year: todayInfo.bsYear, month: todayInfo.bsMonth });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents: UpcomingEvent[] = monthEvents
      .map(event => {
        try {
          const eventDate = new Date(event.gregorian_date!);
          if (eventDate >= today) {
            return {
              summary: event.events[0] || 'Event',
              startDate: event.gregorian_date!,
              isHoliday: event.is_holiday,
            };
          }
          return null;
        } catch(e) {
          return null;
        }
      })
      .filter((e): e is UpcomingEvent => e !== null);

    // Merge and de-duplicate events from the month flow
    const uniqueEventsMap = new Map<string, UpcomingEvent>();

    upcomingEvents.forEach(event => {
        // Use a key of date + summary to identify unique events
        const key = `${event.startDate}-${event.summary}`;
        if (!uniqueEventsMap.has(key)) {
            uniqueEventsMap.set(key, event);
        }
    });

    const finalEvents = Array.from(uniqueEventsMap.values());

    // Sort all events by date
    finalEvents.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const response: PatroDataResponse = {
        ...aiData,
        today: todayInfo,
        todaysEvent: todaysEvent,
        upcomingEvents: finalEvents,
    };
    
    setInCache(cacheKey, response);
    return response;
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}

    