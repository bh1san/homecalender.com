
'use server';
/**
 * @fileOverview A flow for fetching events for the Nepali calendar from the API.
 *
 * - getCalendarEvents - A function that fetches events, tithis, and holidays for a month.
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
import { getTodaysInfoFromApi, getEventsForMonthFromApi } from '@/services/nepali-date';

export async function getCalendarEvents(
  input: CalendarEventsRequest
): Promise<CalendarEventsResponse> {
  return calendarEventsFlow(input);
}

export async function getCurrentDateInfo(): Promise<CurrentDateInfoResponse> {
  return currentDateInfoFlow();
}

const calendarEventsFlow = ai.defineFlow(
  {
    name: 'calendarEventsFlow',
    inputSchema: CalendarEventsRequestSchema,
    outputSchema: CalendarEventsResponseSchema,
  },
  async ({ year, month }) => {
    const apiData = await getEventsForMonthFromApi(year, month);
    
    const mappedEvents = apiData.map(day => ({
      day: day.bs_day_en,
      gregorian_day: day.ad_day_en,
      tithi: day.tithi.tithi_name_np,
      events: day.events.map(e => e.event_title_np).filter((e): e is string => !!e),
      is_holiday: day.is_holiday,
      panchanga: day.panchanga.panchanga_np,
    }));

    return { month_events: mappedEvents };
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
    
    // The API returns the AD weekday, where Sunday is 1. JS Date is 0-indexed (Sun=0).
    const adWeekDay = apiData.ad_day_of_week_en - 1;

    return {
      bsYear: apiData.bs_year_en,
      bsMonth: apiData.bs_month_code_en,
      bsDay: apiData.bs_day_en,
      bsWeekDay: adWeekDay,
      adYear: apiData.ad_year_en,
      adMonth: apiData.ad_month_code_en - 1, // Their API is 1-12, JS is 0-11
      adDay: apiData.ad_day_en,
      day: apiData.bs_day_en,
      tithi: apiData.tithi.tithi_name_np,
      events: apiData.events.map(e => e.event_title_np).filter((e): e is string => !!e),
      is_holiday: apiData.is_holiday,
      panchanga: apiData.panchanga.panchanga_np,
    };
  }
);
