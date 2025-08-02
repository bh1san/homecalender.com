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

export async function getCalendarEvents(
  input: CalendarEventsRequest
): Promise<CalendarEventsResponse> {
  return calendarEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calendarEventsPrompt',
  input: {schema: CalendarEventsRequestSchema},
  output: {schema: CalendarEventsResponseSchema},
  prompt: `You are a Nepali calendar data expert. For the given Nepali calendar year ({{year}} BS) and month ({{month}}), generate a complete list of daily events.

For each day of the month, provide the following details:
1.  'day': The numeric day of the month.
2.  'tithi': The official lunar phase (Tithi) for that day.
3.  'events': A list of all festivals, observances, or special events occurring on that day. If there are no events, provide an empty list.
4.  'is_holiday': A boolean value indicating if the day is a public holiday in Nepal. Mark major festival days and Saturdays as holidays.

Example for a single day's output:
{
  "day": 1,
  "tithi": "Shrawan Krishna Pratipada",
  "events": ["Saune Sankranti", "Luto Phalne Din"],
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
    return output!;
  }
);
