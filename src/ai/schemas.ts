/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 */

import {z} from 'genkit';

// News Schemas
export const NewsItemSchema = z.object({
  id: z.string().describe('A unique identifier for the news article.'),
  title: z.string().describe('The headline of the news article.'),
  imageDataUri: z
    .string()
    .describe(
      "A generated image for the news article, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imageHint: z.string().optional().describe('A hint for image generation.'),
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
  name: z.string().describe('The name of the festival.'),
  displayDate: z.string().describe('The human-readable date or date range of the festival.'),
  gregorianStartDate: z.string().describe('The Gregorian start date in YYYY-MM-DD format.'),
  description: z.string().describe('A brief description of the festival.'),
});
export type Festival = z.infer<typeof FestivalSchema>;

export const FestivalResponseSchema = z.object({
  festivals: z.array(FestivalSchema).describe('A list of major festivals for the country.'),
});
export type FestivalResponse = z.infer<typeof FestivalResponseSchema>;

// Calendar Events Schemas
export const CalendarEventSchema = z.object({
  day: z.number().describe('The day of the month.'),
  tithi: z.string().describe('The lunar phase (Tithi) of the day, in Nepali script.'),
  gregorian_day: z.number().optional().describe('The corresponding Gregorian day of the month.'),
  events: z
    .array(z.string())
    .describe('A list of events or festivals on this day, in Nepali script.'),
  is_holiday: z.boolean().describe('Whether the day is a public holiday.'),
  panchanga: z.string().optional().describe("Astrological details for the day, if available."),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventsRequestSchema = z.object({
  year: z.number().describe('The Nepali year (Bikram Sambat).'),
  month: z.number().describe('The Nepali month (1-12).'),
});
export type CalendarEventsRequest = z.infer<typeof CalendarEventsRequestSchema>;

export const CalendarEventsResponseSchema = z.object({
  month_events: z
    .array(CalendarEventSchema)
    .describe('A list of all events for the given month.'),
});
export type CalendarEventsResponse = z.infer<typeof CalendarEventsResponseSchema>;

// Current Date Info Schema
export const CurrentDateInfoResponseSchema = CalendarEventSchema.extend({
  bsYear: z.number(),
  bsMonth: z.number(),
  bsDay: z.number(),
  bsWeekDay: z.number(),
  adYear: z.number(),
  adMonth: z.number(), // 0-indexed
  adDay: z.number(),
});
export type CurrentDateInfoResponse = z.infer<typeof CurrentDateInfoResponseSchema>;
