
'use server';
/**
 * @fileOverview A flow for fetching data from the hamro-patro-scraper library.
 *
 * - getPatroData - A function that fetches horoscopes, gold/silver prices, and forex rates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
    getHoroscope,
    getGoldPrices,
    getExchangeRates,
} from "hamro-patro-scraper";
import { PatroDataResponse, PatroDataResponseSchema } from '@/ai/schemas';

const patroDataFlow = ai.defineFlow(
  {
    name: 'patroDataFlow',
    inputSchema: z.void(),
    outputSchema: PatroDataResponseSchema,
  },
  async () => {
    console.log("Fetching data from Hamro Patro scraper...");
    try {
        const [horoscope, goldSilver, forex] = await Promise.all([
            getHoroscope(),
            getGoldPrices(),
            getExchangeRates(),
        ]);
        
        // The scraper returns objects that match our schemas, so we can return them directly.
        // We might want to add more robust error handling or data transformation here in the future.
        return { horoscope, goldSilver, forex };

    } catch (error) {
        console.error("Error fetching data from hamro-patro-scraper:", error);
        throw new Error("Failed to fetch data from Hamro Patro services.");
    }
  }
);

export async function getPatroData(): Promise<PatroDataResponse> {
  return patroDataFlow();
}
