
'use server';
/**
 * @fileOverview A flow for fetching recent news headlines with generated images based on location.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema} from '@/ai/schemas';
import {z} from 'genkit';

const NewsGenerationInputSchema = z.object({
  country: z.string().describe('The country for which to generate news headlines.'),
});

const NewsGenerationItemSchema = z.object({
  id: z.string().describe('A unique identifier for the news article.'),
  title: z.string().describe('The headline of the news article.'),
  imageHint: z
    .string()
    .describe(
      'A two-word hint for generating a relevant placeholder image (e.g., "political protest", "sports victory").'
    ),
});

const NewsGenerationResponseSchema = z.object({
  headlines: z
    .array(NewsGenerationItemSchema)
    .describe('A list of 8 recent news headlines from the specified country.'),
});

const newsPrompt = ai.definePrompt({
  name: 'newsPrompt',
  input: {schema: NewsGenerationInputSchema},
  output: {schema: NewsGenerationResponseSchema},
  prompt: `You are a news aggregator pulling from major global and local sources. Generate a list of 8 diverse and urgent-sounding "hot news" headlines from {{country}}. The headlines should sound like they are from today's news cycle. Cover topics like politics, international relations, finance, technology, sports, and major current events. For each headline, provide a unique id, and a two-word hint for a relevant photorealistic image.`,
});

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    inputSchema: NewsGenerationInputSchema,
    outputSchema: NewsResponseSchema,
  },
  async ({ country }) => {
    console.log(`Generating new news response for ${country}.`);

    const {output} = await newsPrompt({ country });
    if (!output) {
      throw new Error('Could not generate news headlines.');
    }

    const headlinesWithImages = output.headlines.map(headline => ({
        id: headline.id,
        title: headline.title,
        imageDataUri: `https://placehold.co/192x128.png`,
        imageHint: headline.imageHint,
    }));

    return {headlines: headlinesWithImages};
  }
);

export async function getNews(country: string): Promise<NewsResponse> {
  return newsFlow({ country });
}
