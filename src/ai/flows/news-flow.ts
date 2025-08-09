
'use server';
/**
 * @fileOverview A flow for fetching recent news headlines with images based on a query.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema} from '@/ai/schemas';
import {z} from 'genkit';

const NewsApiRequestSchema = z.object({
  query: z.string().describe('The search query for which to fetch news headlines (e.g., "Nepal").'),
});

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    inputSchema: NewsApiRequestSchema,
    outputSchema: NewsResponseSchema,
  },
  async ({ query }) => {
    console.log(`Fetching new news response for query: ${query}.`);
    
    const apiKey = process.env.NEWSDATAIO_API_KEY;
    if (!apiKey) {
        console.error("NewsData.io API key is not configured in .env file (NEWSDATAIO_API_KEY).");
        return { headlines: [] };
    }
    
    const apiUrl = `https://newsdata.io/api/1/news?q=${encodeURIComponent(query)}&category=top&size=10&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { next: { revalidate: 86400 } }); 
        
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`News API request failed with status ${response.status}:`, errorBody);
            // Check for specific error messages from the API
             if (errorBody.results?.message) {
                console.error('NewsData.io API Message:', errorBody.results.message);
             }
            throw new Error(`Failed to fetch news. API returned: ${errorBody.results?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.status !== 'success' || !data.results) {
             console.error('News API did not return a successful response.', data);
             return { headlines: [] };
        }

        const headlinesWithImages = data.results
            .filter((article: any) => article.title && article.link)
            .map((article: any) => ({
                id: article.article_id || article.link,
                title: article.title,
                imageUrl: article.image_url || `https://placehold.co/192x128.png`,
            }));
        
        const apiResponse: NewsResponse = { headlines: headlinesWithImages };
        return apiResponse;

    } catch (error) {
        console.error("Error fetching or processing news data:", error);
        return { headlines: [] };
    }
  }
);

export async function getNews(query: string): Promise<NewsResponse> {
  return newsFlow({ query });
}
