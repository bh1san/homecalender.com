/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
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
    .describe('A list of 8 recent news headlines from a country with generated images.'),
});
export type NewsResponse = z.infer<typeof NewsResponseSchema>;

// Festival Schemas
export const FestivalSchema = z.object({
  name: z.string().describe("The name of the festival."),
  date: z.string().describe("The date or date range of the festival."),
  description: z.string().describe("A brief description of the festival."),
});
export type Festival = z.infer<typeof FestivalSchema>;

export const FestivalResponseSchema = z.object({
  festivals: z.array(FestivalSchema).describe("A list of major festivals for the country."),
});
export type FestivalResponse = z.infer<typeof FestivalResponseSchema>;


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

// Calendar Events Schemas
export const CalendarEventSchema = z.object({
    day: z.number().describe("The day of the month."),
    tithi: z.string().describe("The lunar phase (Tithi) of the day."),
    events: z.array(z.string()).describe("A list of events or festivals on this day."),
    is_holiday: z.boolean().describe("Whether the day is a public holiday."),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventsRequestSchema = z.object({
    year: z.number().describe("The Nepali year (Bikram Sambat)."),
    month: z.number().describe("The Nepali month (1-12)."),
});
export type CalendarEventsRequest = z.infer<typeof CalendarEventsRequestSchema>;

export const CalendarEventsResponseSchema = z.object({
    month_events: z.array(CalendarEventSchema).describe("A list of all events for the given month."),
});
export type CalendarEventsResponse = z.infer<typeof CalendarEventsResponseSchema>;
