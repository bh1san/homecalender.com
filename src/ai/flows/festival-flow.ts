'use server';
/**
 * @fileOverview A flow for fetching major festivals for a given country.
 *
 * - getFestivals - A function that fetches a list of festivals.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FestivalResponse, FestivalResponseSchema } from '@/ai/schemas';

const FestivalGenerationInputSchema = z.object({
  country: z.string().describe('The country for which to generate the festival list.'),
});

const festivalPrompt = ai.definePrompt({
  name: 'festivalPrompt',
  input: {schema: FestivalGenerationInputSchema},
  output: {schema: FestivalResponseSchema},
  prompt: `You are a cultural expert. Generate a list of the 7 most important or popular festivals for {{country}}. Include festivals that are current or upcoming in the next few months. For each festival, provide its name, typical date or date range, and a brief, engaging description.`,
});

const festivalFlow = ai.defineFlow(
  {
    name: 'festivalFlow',
    inputSchema: FestivalGenerationInputSchema,
    outputSchema: FestivalResponseSchema,
  },
  async ({ country }) => {
    console.log(`Generating festival list for ${country}.`);
    const {output} = await festivalPrompt({ country });
    if (!output) {
      throw new Error('Could not generate festivals.');
    }
    return output;
  }
);

export async function getFestivals(country: string): Promise<FestivalResponse> {
  return festivalFlow({ country });
}
