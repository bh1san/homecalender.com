
'use server';
/**
 * @fileOverview A flow for fetching recent news headlines with images based on location.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema} from '@/ai/schemas';
import {z} from 'genkit';

const NewsApiRequestSchema = z.object({
  country: z.string().describe('The country for which to fetch news headlines (e.g., "Nepal").'),
});

const countryCodeMapping: { [key: string]: string } = {
    "Nepal": "np",
    "India": "in",
    "United States": "us",
    "United Kingdom": "gb",
};

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    inputSchema: NewsApiRequestSchema,
    outputSchema: NewsResponseSchema,
  },
  async ({ country }) => {
    console.log(`Fetching new news response for ${country}.`);
    
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
        console.error("NewsData.io API key is not configured in .env file (NEWSDATA_API_KEY).");
        return { headlines: [] };
    }
    
    const countryCode = countryCodeMapping[country] || 'us';
    const apiUrl = `https://newsdata.io/api/1/news?country=${countryCode}&size=10&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { next: { revalidate: 86400 } }); 
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`News API request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Failed to fetch news from API. Status: ${response.status}`);
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

export async function getNews(country: string): Promise<NewsResponse> {
  return newsFlow({ country });
}
