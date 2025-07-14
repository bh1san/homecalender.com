/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 *
 * - NewsItemSchema - Zod schema for a single news item.
 * - NewsItem - TypeScript type for a single news item.
 * - NewsResponseSchema - Zod schema for a list of news items.
 * - NewsResponse - TypeScript type for a list of news items.
 */

import {z} from 'genkit';

export const NewsItemSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  imageHint: z.string().describe('A two-word hint for generating a relevant placeholder image (e.g., "political protest", "sports victory").'),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsResponseSchema = z.object({
  headlines: z.array(NewsItemSchema).describe('A list of 8 recent news headlines from Nepal.'),
});
export type NewsResponse = z.infer<typeof NewsResponseSchema>;
