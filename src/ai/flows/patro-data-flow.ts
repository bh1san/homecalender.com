
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates.
 * It also fetches today's date info and upcoming events.
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
  CurrentDateInfoResponseSchema
} from '@/ai/schemas';
import { getTodaysInfoFromApi } from '@/services/nepali-date';


const PatroDataGenerationInputSchema = z.object({
  country: z.string().describe('The country for which to generate the data. Should be Nepal.'),
});


const PatroDataGenerationSchema = z.object({
    horoscope: z.array(HoroscopeSchema).describe("A list of 12 horoscopes (Rashifal) for today in Nepali."),
    goldSilver: GoldSilverSchema.describe("Today's price for fine gold, tejabi gold, and silver in Nepal."),
    forex: z.array(ForexSchema).describe("A list of 10 major foreign exchange rates against the Nepalese Rupee (NPR), including USD, EUR, GBP, JPY, INR, etc."),
});


const patroDataPrompt = ai.definePrompt({
  name: 'patroDataPrompt',
  input: {schema: PatroDataGenerationInputSchema},
  output: {schema: PatroDataGenerationSchema},
  prompt: `You are a data provider for a Nepali calendar application. Generate the daily data for {{country}}.
- Horoscope (Rashifal): Provide a short, engaging, one-sentence horoscope for all 12 zodiac signs in Nepali.
- Gold/Silver Prices: Provide the prices for Fine Gold (छापावाल सुन), Tejabi Gold (तेजाबी सुन), and Silver (चाँदी) in NPR per Tola. The prices should be realistic for today.
- Forex: Provide the buy and sell rates for 10 major currencies against NPR. Include their flag emoji image URL from a reliable source. The unit should be 1 for most, but check standard units for currencies like JPY.`,
});


const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    console.log("Generating patro data...");
    
    // Fetch from API and AI in parallel
    const [apiData, aiData] = await Promise.all([
      getTodaysInfoFromApi().catch(e => {
        console.error("API call to getTodaysInfoFromApi failed:", e);
        return null; // Don't block everything if the API fails
      }),
      patroDataPrompt({ country: "Nepal" }).then(p => p.output).catch(e => {
        console.error("AI call to patroDataPrompt failed:", e);
        return null;
      })
    ]);

    if (!aiData) {
        throw new Error('Could not generate core data from AI.');
    }

    // Process API data if it's available
    let today: z.infer<typeof CurrentDateInfoResponseSchema> | null = null;
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
    
    return {
        ...aiData,
        today: today,
        upcomingEvents: upcomingEvents
    };
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
