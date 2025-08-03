'use server';
/**
 * @fileOverview A flow for fetching recent news headlines with images based on location.
 *
 * - getNews - A function that fetches a list of news headlines with images.
 */

import {ai} from '@/ai/genkit';
import {NewsResponse, NewsResponseSchema, NewsItemSchema} from '@/ai/schemas';
import {z} from 'genkit';
import { getFromCache, setInCache } from '@/ai/cache';

const NewsApiRequestSchema = z.object({
  country: z.string().describe('The country for which to fetch news headlines (e.g., "Nepal").'),
});

// Mapping for country names to ISO 3166-1 alpha-2 codes used by the API
const countryCodeMapping: { [key: string]: string } = {
    "Nepal": "np",
    "India": "in",
    "United States": "us",
    "United Kingdom": "gb",
    // Add other relevant mappings here
};

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    inputSchema: NewsApiRequestSchema,
    outputSchema: NewsResponseSchema,
  },
  async ({ country }) => {
    const cacheKey = `news_v2_${country}`;
    const cachedNews = getFromCache<NewsResponse>(cacheKey);
    if (cachedNews) {
      console.log(`Returning cached news for ${country}.`);
      return cachedNews;
    }

    console.log(`Fetching new news response for ${country}.`);
    
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
        console.error("NewsData.io API key is not configured.");
        throw new Error("News API key is not configured.");
    }
    
    const countryCode = countryCodeMapping[country] || 'us'; // Default to US if not found
    const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=${countryCode}&size=10`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`News API request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Failed to fetch news from API. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'success' || !data.results) {
             throw new Error('News API did not return a successful response.');
        }

        const headlinesWithImages = data.results
            .filter((article: any) => article.title && article.link) // Ensure basic article data exists
            .map((article: any) => ({
                id: article.article_id || article.link,
                title: article.title,
                imageUrl: article.image_url || `https://placehold.co/192x128.png`,
            }));
        
        const apiResponse: NewsResponse = { headlines: headlinesWithImages };
        setInCache(cacheKey, apiResponse, 60 * 60 * 1000); // Cache for 1 hour

        return apiResponse;

    } catch (error) {
        console.error("Error fetching or processing news data:", error);
        // Fallback to empty response to prevent crashing the page
        return { headlines: [] };
    }
  }
);

export async function getNews(country: string): Promise<NewsResponse> {
  return newsFlow({ country });
}
