/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 */

import {z} from 'genkit';

// News Schemas
export const NewsItemSchema = z.object({
  id: z.string().describe('A unique identifier for the news article.'),
  title: z.string().describe('The headline of the news article.'),
  imageUrl: z
    .string()
    .url()
    .describe(
      "A URL for the news article's image."
    ),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsResponseSchema = z.object({
  headlines: z
    .array(NewsItemSchema)
    .describe('A list of recent news headlines from a country.'),
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


export const CalendarEventSchema = z.object({
  day: z.number().describe('The day of the month.'),
  tithi: z.string().describe('The lunar phase (Tithi) of the day, in Nepali script.'),
  gregorian_date: z.string().optional(),
  events: z
    .array(z.string())
    .describe('A list of events or festivals on this day, in Nepali script.'),
  is_holiday: z.boolean().describe('Whether the day is a public holiday.'),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventsRequestSchema = z.object({
  year: z.number().describe('The Nepali year (Bikram Sambat).'),
  month: z.number().describe('The Nepali month (1-12).'),
});
export type CalendarEventsRequest = z.infer<typeof CalendarEventsRequestSchema>;


// Upcoming Events Schemas
export const UpcomingEventSchema = z.object({
  summary: z.string().describe('The name or summary of the event.'),
  startDate: z.string().describe('The start date of the event in YYYY-MM-DD format.'),
  isHoliday: z.boolean().optional().describe('Whether the event is a public holiday.')
});
export type UpcomingEvent = z.infer<typeof UpcomingEventSchema>;


// Hamro Patro Scraper Schemas
export const HoroscopeSchema = z.object({
    rashi: z.string(),
    name: z.string(),
    text: z.string(),
});
export type Horoscope = z.infer<typeof HoroscopeSchema>;

export const GoldPriceSchema = z.object({
    item: z.string(),
    unit: z.string(),
    price: z.string(),
});
export type GoldPrice = z.infer<typeof GoldPriceSchema>;

export const GoldSilverSchema = z.object({
    fineGold: GoldPriceSchema,
    tejabiGold: GoldPriceSchema,
    silver: GoldPriceSchema,
});
export type GoldSilver = z.infer<typeof GoldSilverSchema>;


export const ForexSchema = z.object({
    name: z.string(),
    unit: z.string(),
    buy: z.string(),
    sell: z.string(),
    iso3: z.string(),
    flag: z.string().url(),
});
export type Forex = z.infer<typeof ForexSchema>;

export const CurrentDateInfoResponseSchema = z.object({
    bsYear: z.number(),
    bsMonth: z.number(),
    bsDay: z.number(),
    adYear: z.number(),
    adMonth: z.number(),
    adDay: z.number(),
    tithi: z.string(),
});
export type CurrentDateInfoResponse = z.infer<typeof CurrentDateInfoResponseSchema>;


export const PatroDataResponseSchema = z.object({
    horoscope: z.array(HoroscopeSchema),
    goldSilver: GoldSilverSchema.nullable(),
    forex: z.array(ForexSchema),
    today: CurrentDateInfoResponseSchema.nullable(),
    upcomingEvents: z.array(UpcomingEventSchema).optional(),
});
export type PatroDataResponse = z.infer<typeof PatroDataResponseSchema>;
