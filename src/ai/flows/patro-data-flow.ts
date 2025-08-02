
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates using hamro-patro-scraper.
 * It also fetches today's date info and upcoming events.
 *
 * - getPatroData - A function that fetches all daily data for the app.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  PatroDataResponse, 
  PatroDataResponseSchema, 
  Horoscope,
  GoldSilver,
  Forex,
  UpcomingEventSchema,
  CurrentDateInfoResponse
} from '@/ai/schemas';
import { getTodaysInfoFromApi } from '@/services/nepali-date';
import { getHoroscope, getGoldPrices, getExchangeRates } from 'hamro-patro-scraper';

const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    console.log("Fetching data from APIs and scraper...");
    
    // Fetch from API and Scraper in parallel
    const [apiData, horoscopeData, goldSilverData, forexData] = await Promise.all([
      getTodaysInfoFromApi().catch(e => {
        console.error("API call to getTodaysInfoFromApi failed:", e);
        return null;
      }),
      getHoroscope().catch(e => {
        console.error("Scraper call to getHoroscope failed:", e);
        return [];
      }),
      getGoldPrices().catch(e => {
        console.error("Scraper call to getGoldPrices failed:", e);
        return null;
      }),
      getExchangeRates().catch(e => {
        console.error("Scraper call to getExchangeRates failed:", e);
        return [];
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
    
    let mappedGoldSilver: GoldSilver | null = null;
    if (goldSilverData) {
        const findPrice = (item: string) => goldSilverData.find(p => p.item.toLowerCase().includes(item.toLowerCase())) || { item, price: 'N/A', unit: 'Tola' };
        mappedGoldSilver = {
            fineGold: findPrice('fine gold'),
            tejabiGold: findPrice('tejabi gold'),
            silver: findPrice('silver'),
        }
    }

    return {
        horoscope: horoscopeData,
        goldSilver: mappedGoldSilver,
        forex: forexData,
        today: today,
        upcomingEvents: upcomingEvents,
    };
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}