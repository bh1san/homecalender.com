'use server';
/**
 * @fileOverview A flow for fetching events for a specific month of the Nepali calendar.
 *
 * - getCalendarEvents - A function that fetches events, tithis, and holidays.
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
    const {output} = await prompt(input);
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

// New flow to get only the current day's information
const currentDateInfoFlow = ai.defineFlow(
  {
    name: 'currentDateInfoFlow',
    outputSchema: CurrentDateInfoResponseSchema,
  },
  async () => {
    // 1. Get current time in Nepal
    const nowInKathmandu = new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Kathmandu'}));

    // 2. Convert to BS date
    const bsDate = toBS(nowInKathmandu);

    // 3. Prepare prompt input
    const request = {
      year: bsDate.year,
      month: bsDate.month,
    };

    // 4. Call the existing prompt to get events for the whole month
    const {output: monthOutput} = await calendarEventsPrompt(request);
    if (!monthOutput) {
      throw new Error('Failed to get calendar events for current month.');
    }

    // 5. Find today's event from the list
    const todayEvent = monthOutput.month_events.find(e => e.day === bsDate.day);
    if (!todayEvent) {
      throw new Error('Could not find event info for the current date.');
    }
    
    // 6. Return today's complete information
    return {
      bsYear: bsDate.year,
      bsMonth: bsDate.month,
      bsDay: bsDate.day,
      bsWeekDay: bsDate.weekDay,
      adYear: nowInKathmandu.getFullYear(),
      adMonth: nowInKathmandu.getMonth(),
      adDay: nowInKathmandu.getDate(),
      ...todayEvent,
    };
  }
);
