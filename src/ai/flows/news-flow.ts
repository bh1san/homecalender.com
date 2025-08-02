
'use server';
/**
 * @fileOverview A flow for fetching recent news headlines with generated images based on location.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 * - getNewsArticle - A function that fetches the full content of a news article.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema, NewsArticle, NewsArticleSchema} from '@/ai/schemas';
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
  prompt: `You are a news aggregator. Generate a list of 8 diverse and recent-sounding news headlines from {{country}}. Cover topics like politics, society, sports, and current events. For each headline, provide a unique id, and a two-word hint for a relevant placeholder image.`,
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
                prompt: `Generate a photorealistic image for a news headline about: ${headline.title}. Hint: ${headline.imageHint}`,
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
        id: headline.id,
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


// Flow for getting a single news article
const articlePrompt = ai.definePrompt({
    name: 'newsArticlePrompt',
    input: { schema: z.object({ articleId: z.string(), articleTitle: z.string() }) },
    output: { schema: NewsArticleSchema },
    prompt: `You are a journalist. Based on the headline "{{articleTitle}}", write a full news article.
    
    The article should:
    1. Have a compelling title.
    2. Be at least 5 paragraphs long.
    3. Be well-structured and engaging.
    4. Have a relevant category and a plausible publication date.
    5. Be formatted as Markdown.
    6. Include a prompt for a photorealistic image that captures the essence of the story.
    `,
});

const articleFlow = ai.defineFlow({
    name: 'articleFlow',
    inputSchema: z.object({ articleId: z.string(), articleTitle: z.string() }),
    outputSchema: NewsArticleSchema,
}, async ({ articleId, articleTitle }) => {
    console.log(`Generating article for ID: ${articleId}`);
    
    const { output } = await articlePrompt({ articleId, articleTitle });
    if (!output) {
        throw new Error('Could not generate news article.');
    }
    
    // Generate an image for the article
    let imageDataUri = 'https://placehold.co/600x400.png';
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a photorealistic image for a news article about: ${output.title}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        imageDataUri = media.url;
    } catch (error) {
        console.error(`Failed to generate image for article "${output.title}", using placeholder.`, error);
    }

    return { ...output, imageDataUri };
});


export async function getNewsArticle(articleId: string, articleTitle: string): Promise<NewsArticle> {
    return articleFlow({ articleId, articleTitle });
}
