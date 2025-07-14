/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 *
 * - NewsItemSchema - Zod schema for a single news item.
 * - NewsItem - TypeScript type for a single news item.
 * - NewsResponseSchema - Zod schema for a list of news items.
 * - NewsResponse - TypeScript type for a list of news items.
 * - DateConversionInputSchema - Zod schema for date conversion input.
 * - DateConversionInput - TypeScript type for date conversion input.
 * - DateConversionOutputSchema - Zod schema for date conversion output.
 * - DateConversionOutput - TypeScript type for date conversion output.
 */

import {z} from 'genkit';

// News Schemas
export const NewsItemSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  imageDataUri: z
    .string()
    .describe(
      "A generated image for the news article, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsResponseSchema = z.object({
  headlines: z
    .array(NewsItemSchema)
    .describe('A list of 8 recent news headlines from Nepal with generated images.'),
});
export type NewsResponse = z.infer<typeof NewsResponseSchema>;

// Date Conversion Schemas
export const DateConversionInputSchema = z.object({
  source: z.enum(['ad_to_bs', 'bs_to_ad']),
  year: z.number(),
  month: z.number(),
  day: z.number(),
});
export type DateConversionInput = z.infer<typeof DateConversionInputSchema>;

export const DateConversionOutputSchema = z.object({
  year: z.number(),
  month: z.string(),
  day: z.number(),
  fullDate: z.string().describe("The full converted date in 'Month Day, Year' format."),
});
export type DateConversionOutput = z.infer<typeof DateConversionOutputSchema>;
