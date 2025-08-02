
'use server';
/**
 * @fileOverview A flow for parsing iCalendar data to get upcoming Nepali holidays.
 *
 * - getUpcomingEvents - A function that fetches and parses events from an iCalendar file.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  UpcomingEventsResponse,
  UpcomingEventsResponseSchema,
} from '@/ai/schemas';
import fs from 'fs/promises';
import path from 'path';

const UpcomingEventsInputSchema = z.object({
  icalData: z.string().describe('The raw iCalendar data as a string.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
});

const upcomingEventsPrompt = ai.definePrompt({
  name: 'upcomingEventsPrompt',
  input: {schema: UpcomingEventsInputSchema},
  output: {schema: UpcomingEventsResponseSchema},
  prompt: `You are an expert iCalendar parser. Parse the provided iCalendar data and extract all events that occur on or after the specified current date.

Return a list of the next 8 upcoming events, sorted by date.

For each event, provide:
1.  'summary': The event's summary or title.
2.  'startDate': The event's start date in strict YYYY-MM-DD format.

iCalendar Data:
{{{icalData}}}

Current Date: {{currentDate}}`,
});

const upcomingEventsFlow = ai.defineFlow(
  {
    name: 'upcomingEventsFlow',
    inputSchema: z.void(),
    outputSchema: UpcomingEventsResponseSchema,
  },
  async () => {
    const icalFilePath = path.join(process.cwd(), 'data', 'nepal-holidays.ics');
    const icalData = await fs.readFile(icalFilePath, 'utf-8');

    const currentDate = new Date().toISOString().split('T')[0];

    console.log(`Getting upcoming events from ${currentDate}`);

    const {output} = await upcomingEventsPrompt({
      icalData,
      currentDate,
    });

    if (!output) {
      throw new Error('Failed to parse upcoming events.');
    }

    return output;
  }
);

export async function getUpcomingEvents(): Promise<UpcomingEventsResponse> {
  return upcomingEventsFlow();
}
