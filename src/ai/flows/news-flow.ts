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
  prompt: `You are a news aggregator. Generate a list of 8 diverse and recent-sounding news headlines from {{country}}. Cover topics like politics, society, sports, and current events. For each headline, provide a two-word hint for a relevant placeholder image.`,
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

    const headlinesWithImages = [];
    const placeholderImage = 'https://placehold.co/192x128.png';
    let generatedImageCount = 0;

    for (const headline of output.headlines) {
      let imageDataUri = placeholderImage;
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

    return {headlines: headlinesWithImages};
  }
);

export async function getNews(country: string): Promise<NewsResponse> {
  return newsFlow({ country });
}
