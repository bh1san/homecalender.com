
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates.
 * Today's date information for the banner is sourced locally for reliability.
 *
 * - getPatroData - A function that fetches all daily data for the app.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  PatroDataResponse, 
  PatroDataResponseSchema, 
  Horoscope,
  HoroscopeSchema,
  GoldSilverSchema,
  Forex,
  ForexSchema,
  UpcomingEvent,
  UpcomingEventSchema,
  CurrentDateInfoResponse,
  CurrentDateInfoResponseSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';
import customEventsData from '@/data/custom-events.json';
import { getMonthEvents } from './month-events-flow';
import { liveRate } from '@sapkotamadan/nrb-forex';

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const AIGeneratedDataSchema = z.object({
    horoscope: z.array(z.object({
      rashi: z.string().describe("The name of the rashi (zodiac sign) in Nepali, e.g., 'Mesh'"),
      text: z.string().describe("The horoscope prediction text.")
    })).describe("A list of 12 horoscopes for each rashi."),
    goldSilver: GoldSilverSchema.describe("A list of gold and silver prices."),
});

const scraperPrompt = ai.definePrompt({
    name: 'scraperPrompt',
    output: { schema: AIGeneratedDataSchema },
    prompt: `You are a data provider for a Nepali calendar application. Generate a complete and realistic set of data for today. Today's Gregorian date is ${new Date().toISOString().split('T')[0]}.
    
    1.  **Horoscope (Rashifal):** Generate a unique, plausible-sounding horoscope for all 12 rashi (zodiac signs: Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen). The 'rashi' field should contain the name of the sign.
    2.  **Gold/Silver Prices:** Provide realistic prices for Fine Gold (99.9%), Tejabi Gold, and Silver in Nepalese Rupees (NPR) per Tola.
    `
});

const generateAIFallbackData = async (): Promise<Omit<PatroDataResponse, 'today' | 'upcomingEvents' | 'todaysEvent' | 'forex'>> => {
    console.log("Generating horoscope and gold/silver data using AI...");
    const aiResponse = await scraperPrompt().then(r => r.output).catch(e => {
        console.error("AI call to scraperPrompt failed:", e);
        return null;
    });

    if (aiResponse) {
        const fullHoroscope: Horoscope[] = aiResponse.horoscope.map((h) => ({
            rashi: h.rashi,
            name: h.rashi,
            text: h.text,
        }));
         return {
            horoscope: fullHoroscope,
            goldSilver: aiResponse.goldSilver,
        };
    }
    // If AI also fails, return an empty but valid response shape to prevent crashes
    return {
        horoscope: [], goldSilver: null
    };
};

const getForexData = async (): Promise<Forex[]> => {
    try {
        const data = await liveRate();
        const forexRates = data.rates.map(rate => ({
            name: rate.currency.name,
            unit: String(rate.currency.unit),
            buy: rate.buy,
            sell: rate.sell,
            iso3: rate.currency.iso3,
            flag: `https://flagsapi.com/${rate.currency.iso3.substring(0,2)}/shiny/64.png`
        }));
        return forexRates;
    } catch (error) {
        console.error("Failed to fetch forex data from @sapkotamadan/nrb-forex:", error);
        return []; // Return empty array on error
    }
};

const getLocalTodayData = async (): Promise<{ todayInfo: CurrentDateInfoResponse, todaysEvent?: string }> => {
    const NepaliDate = (await import('nepali-date-converter')).default;
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
    const cacheKey = `patro_data_v26_nrb_forex`;
    const cachedData = getFromCache<PatroDataResponse>(cacheKey, CACHE_DURATION_MS);
    if (cachedData) {
        console.log("Returning cached patro data.");
        return cachedData;
    }

    console.log("Fetching new Patro data from sources...");
    const NepaliDate = (await import('nepali-date-converter')).default;
    const { todayInfo, todaysEvent } = await getLocalTodayData();
    
    // Fetch AI data (horoscope, gold/silver) and real forex data in parallel
    const [aiData, forexData, monthEvents] = await Promise.all([
        generateAIFallbackData(),
        getForexData(),
        getMonthEvents({ year: todayInfo.bsYear, month: todayInfo.bsMonth })
    ]);

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

    const uniqueEventsMap = new Map<string, UpcomingEvent>();

    upcomingEvents.forEach(event => {
        const key = `${event.startDate}-${event.summary}`;
        if (!uniqueEventsMap.has(key)) {
            uniqueEventsMap.set(key, event);
        }
    });

    const finalEvents = Array.from(uniqueEventsMap.values());
    finalEvents.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const response: PatroDataResponse = {
        ...aiData,
        forex: forexData,
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
