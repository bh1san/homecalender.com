
'use server';
/**
 * @fileOverview A flow for getting upcoming Nepali holidays from the API.
 *
 * - getUpcomingEvents - A function that fetches events from the API.
 */

import {ai} from '@/ai/genkit';
import {
  UpcomingEventsResponse,
  UpcomingEventsResponseSchema,
} from '@/ai/schemas';
import { getTodaysInfoFromApi } from '@/services/nepali-date';
import { z } from 'zod';


const upcomingEventsFlow = ai.defineFlow(
  {
    name: 'upcomingEventsFlow',
    inputSchema: z.void(),
    outputSchema: UpcomingEventsResponseSchema,
  },
  async () => {
    const apiData = await getTodaysInfoFromApi();

    const upcomingEvents = apiData.events
      .filter((e): e is { event_title_np: string; event_title_en: string; is_public_holiday: boolean } => !!e.event_title_np && !!e.event_title_en)
      .map(e => ({
        summary: e.event_title_np,
        // The API provides the full date info, so we can use it directly
        startDate: `${apiData.ad_year_en}-${String(apiData.ad_month_code_en).padStart(2, '0')}-${String(apiData.ad_day_en).padStart(2, '0')}`,
        isHoliday: e.is_public_holiday,
      }));

    return { events: upcomingEvents.slice(0, 8) }; // Return up to 8 events
  }
);

export async function getUpcomingEvents(): Promise<UpcomingEventsResponse> {
  return upcomingEventsFlow();
}
