'use server';
/**
 * @fileOverview A flow for fetching recent Nepali news headlines.
 *
 * - getNews - A function that fetches a list of news headlines.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema} from '@/ai/schemas';

const newsPrompt = ai.definePrompt({
  name: 'newsPrompt',
  output: {schema: NewsResponseSchema},
  prompt: `You are a news aggregator for a Nepali news portal. Generate a list of 8 diverse and recent-sounding news headlines from Nepal. Cover topics like politics, society, sports, and current events. For each headline, provide a two-word hint for a relevant placeholder image.`,
});

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    outputSchema: NewsResponseSchema,
  },
  async () => {
    const {output} = await newsPrompt();
    return output!;
  }
);

export async function getNews(): Promise<NewsResponse> {
  return newsFlow();
}
