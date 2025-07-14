'use server';
/**
 * @fileOverview A flow for fetching recent Nepali news headlines with generated images.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema} from '@/ai/schemas';
import {z} from 'genkit';

// Cache for the news response
let cachedNewsResponse: NewsResponse | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const NewsGenerationItemSchema = z.object({
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
    .describe('A list of 8 recent news headlines from Nepal.'),
});

const newsPrompt = ai.definePrompt({
  name: 'newsPrompt',
  output: {schema: NewsGenerationResponseSchema},
  prompt: `You are a news aggregator for a Nepali news portal. Generate a list of 8 diverse and recent-sounding news headlines from Nepal. Cover topics like politics, society, sports, and current events. For each headline, provide a two-word hint for a relevant placeholder image.`,
});

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    outputSchema: NewsResponseSchema,
  },
  async () => {
    // Check if we have a valid cache
    if (cachedNewsResponse && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
      console.log('Returning cached news response.');
      return cachedNewsResponse;
    }
    console.log('Generating new news response.');

    const {output} = await newsPrompt();
    if (!output) {
      throw new Error('Could not generate news headlines.');
    }

    const headlinesWithImages = [];
    const placeholderImage = 'https://placehold.co/192x128.png';
    let generatedImageCount = 0;

    for (const headline of output.headlines) {
      let imageDataUri = placeholderImage;
      // Only generate images for the first 3 headlines
      if (generatedImageCount < 3) {
        try {
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: `Generate an image for a news headline about: ${headline.title}. The style should be photorealistic. Hint: ${headline.imageHint}`,
                config: {
                responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            imageDataUri = media.url;
            generatedImageCount++;
        } catch (error) {
            console.error(`Failed to generate image for "${headline.title}", using placeholder.`, error);
        }
      }

      headlinesWithImages.push({
        title: headline.title,
        imageDataUri: imageDataUri,
      });
    }

    const response = {headlines: headlinesWithImages};
    
    // Update cache
    cachedNewsResponse = response;
    cacheTimestamp = Date.now();
    
    return response;
  }
);

export async function getNews(): Promise<NewsResponse> {
  return newsFlow();
}
