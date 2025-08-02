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
} from '@/ai/schemas';
import {toAD} from '@/lib/nepali-date-converter';

export async function getCalendarEvents(
  input: CalendarEventsRequest
): Promise<CalendarEventsResponse> {
  return calendarEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calendarEventsPrompt',
  input: {schema: CalendarEventsRequestSchema},
  output: {schema: CalendarEventsResponseSchema},
  prompt: `You are a Nepali calendar data expert. For the given Nepali calendar year ({{year}} BS) and month ({{month}}), generate a complete list of daily events. All text outputs should be in Nepali script.

For each day of the month, provide the following details:
1.  'day': The numeric day of the month.
2.  'tithi': The official lunar phase (Tithi) for that day, in Nepali script. Keep it short (e.g., "प्रतिपदा", "अष्टमी").
3.  'events': A list of all festivals, observances, or special events occurring on that day, in Nepali script. If there are no events, provide an empty list. Limit to max 2 events.
4.  'is_holiday': A boolean value indicating if the day is a public holiday in Nepal. Mark major festival days and Saturdays as holidays.

Example for a single day's output:
{
  "day": 1,
  "tithi": "प्रतिपदा",
  "events": ["साउने संक्रान्ति"],
  "is_holiday": true
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
            gregorian_day: adDate.getDate()
        }
    });

    return { month_events: enrichedEvents };
  }
);
