
'use server';
/**
 * @fileOverview A flow for fetching major festivals for a given country.
 *
 * - getFestivals - A function that fetches a list of festivals.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FestivalResponse, FestivalResponseSchema } from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';


const FestivalGenerationInputSchema = z.object({
  country: z.string().describe('The country for which to generate the festival list.'),
});

const festivalPrompt = ai.definePrompt({
  name: 'festivalPrompt',
  input: {schema: FestivalGenerationInputSchema},
  output: {schema: FestivalResponseSchema},
  prompt: `You are a cultural expert. Generate a list of the 7 most important or popular festivals for {{country}}. Include festivals that are current or upcoming in the next few months.
For each festival, provide:
1.  'name': The name of the festival.
2.  'displayDate': A typical, human-readable date or date range (e.g., "October 31", "March", "Late September", "Kartik 5-15").
3.  'gregorianStartDate': The estimated Gregorian start date for the current or next upcoming instance of the festival, in a strict YYYY-MM-DD format.
4.  'description': A brief, engaging description.`,
});

const festivalFlow = ai.defineFlow(
  {
    name: 'festivalFlow',
    inputSchema: FestivalGenerationInputSchema,
    outputSchema: FestivalResponseSchema,
  },
  async ({ country }) => {
    const cacheKey = `festivals_${country}`;
    const cachedFestivals = getFromCache<FestivalResponse>(cacheKey);
    if (cachedFestivals) {
        console.log(`Returning cached festival list for ${country}.`);
        return cachedFestivals;
    }

    console.log(`Generating festival list for ${country}.`);
    const {output} = await festivalPrompt({ country });
    if (!output) {
      throw new Error('Could not generate festivals.');
    }

    setInCache(cacheKey, output);
    return output;
  }
);

export async function getFestivals(country: string): Promise<FestivalResponse> {
  return festivalFlow({ country });
}
