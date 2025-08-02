
'use server';
/**
 * @fileOverview A flow for fetching data like horoscopes, gold/silver prices, and forex rates.
 *
 * - getPatroData - A function that fetches horoscopes, gold/silver prices, and forex rates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PatroDataResponse, PatroDataResponseSchema, HoroscopeSchema, GoldSilverSchema, ForexSchema } from '@/ai/schemas';


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
    console.log("Generating patro data from AI prompt...");
    try {
        const {output} = await patroDataPrompt({ country: "Nepal" });
        if (!output) {
          throw new Error('Could not generate patro data.');
        }
        return output;
    } catch (error) {
        console.error("Error generating data from AI:", error);
        throw new Error("Failed to fetch data from AI service.");
    }
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
