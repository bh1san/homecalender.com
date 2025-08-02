
'use server';
/**
 * @fileOverview A flow for fetching events for a specific month of the Nepali calendar.
 *
 * - getCalendarEvents - A function that fetches events, tithis, and holidays.
 * - getCurrentDateInfo - A function that fetches the current date's full information.
 */

import {ai} from '@/ai/genkit';
import {
  CalendarEventsRequest,
  CalendarEventsRequestSchema,
  CalendarEventsResponse,
  CalendarEventsResponseSchema,
  CurrentDateInfoResponse,
  CurrentDateInfoResponseSchema,
} from '@/ai/schemas';
import {toAD, toBS} from '@/lib/nepali-date-converter';
import { getTodaysInfoFromApi } from '@/services/nepali-date';
import {z} from 'zod';

export async function getCalendarEvents(
  input: CalendarEventsRequest
): Promise<CalendarEventsResponse> {
  return calendarEventsFlow(input);
}

export async function getCurrentDateInfo(): Promise<CurrentDateInfoResponse> {
  return currentDateInfoFlow();
}

const calendarEventsPrompt = ai.definePrompt({
  name: 'calendarEventsPrompt',
  input: {schema: CalendarEventsRequestSchema},
  output: {schema: CalendarEventsResponseSchema},
  prompt: `You are a Nepali calendar data expert. For the given Nepali calendar year ({{year}} BS) and month ({{month}}), generate a complete list of daily events. All text outputs should be in Nepali script.

For each day of the month, provide the following details:
1.  'day': The numeric day of the month.
2.  'tithi': The official lunar phase (Tithi) for that day, in Nepali script. Keep it short (e.g., "प्रतिपदा", "अष्टमी").
3.  'events': A list of all festivals, observances, or special events occurring on that day, in Nepali script. If there are no events, provide an empty list. Limit to max 2 events.
4.  'is_holiday': A boolean value indicating if the day is a public holiday in Nepal. Mark major festival days and Saturdays as holidays.
5.  'panchanga': Provide other astrological details for the day, such as 'nakshatra', 'yoga', 'karana', in Nepali script, if available.

Example for a single day's output:
{
  "day": 1,
  "tithi": "प्रतिपदा",
  "events": ["साउने संक्रान्ति"],
  "is_holiday": true,
  "panchanga": "नक्षत्र: श्रवण, योग: आयुष्मान, करण: बव"
}

Provide this information for every single day of the specified month. The month is 1-indexed (1 = Baisakh, 4 = Shrawan, etc.).`,
});

const calendarEventsFlow = ai.defineFlow(
  {
    name: 'calendarEventsFlow',
    inputSchema: CalendarEventsRequestSchema,
    outputSchema: CalendarEventsResponseSchema,
  },
  async input => {
    const {output} = await calendarEventsPrompt(input);
    if (!output) {
      throw new Error('Failed to get calendar events');
    }
    // Add gregorian day to each event
    const enrichedEvents = output.month_events.map(event => {
      const adDate = toAD({year: input.year, month: input.month, day: event.day});
      return {
        ...event,
        gregorian_day: adDate.getDate(),
      };
    });

    return {month_events: enrichedEvents};
  }
);

// This flow now uses the dedicated RapidAPI service for accuracy
const currentDateInfoFlow = ai.defineFlow(
  {
    name: 'currentDateInfoFlow',
    outputSchema: CurrentDateInfoResponseSchema,
  },
  async () => {
    const apiData = await getTodaysInfoFromApi();
    
    // The API provides most of what we need. We can augment it if necessary.
    // For now, we map it directly to our schema.
    return {
      bsYear: apiData.bs_year_en,
      bsMonth: apiData.bs_month_code_en,
      bsDay: apiData.bs_day_en,
      bsWeekDay: apiData.ad_day_of_week_en - 1, // Their API is 1-7, JS is 0-6
      adYear: apiData.ad_year_en,
      adMonth: apiData.ad_month_code_en -1, // Their API is 1-12, JS is 0-11
      adDay: apiData.ad_day_en,
      day: apiData.bs_day_en,
      tithi: apiData.tithi.tithi_name_np,
      events: apiData.events.map(e => e.event_title_np).filter(e => e), // Filter out nulls/empty
      is_holiday: apiData.is_holiday,
      panchanga: apiData.panchanga.panchanga_np,
    };
  }
);
