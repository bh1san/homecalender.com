
'use server';
/**
 * @fileOverview A flow for fetching calendar events for a specific Nepali month.
 *
 * - getMonthEvents - A function that fetches all calendar data for a given BS year and month.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  CalendarEvent,
  CalendarEventSchema,
  NpEventsApiResponseSchema,
  CalendarEventsRequestSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';

const processMonthData = (data: z.infer<typeof NpEventsApiResponseSchema>): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    if (!data) return events;
    for (const year in data) {
        for (const month in data[year]) {
            for (const day in data[year][month]) {
                const dayData = data[year][month][day];
                events.push({
                    day: dayData.date.bs.day,
                    tithi: dayData.tithi,
                    gregorian_date: `${dayData.date.ad.year}-${String(dayData.date.ad.month).padStart(2, '0')}-${String(dayData.date.ad.day).padStart(2, '0')}`,
                    events: [...dayData.event, ...dayData.panchangam],
                    is_holiday: dayData.public_holiday,
                });
            }
        }
    }
    return events;
};


const fetchFromNpEventsAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://npclapi.casualsnek.eu.org';
    try {
        const response = await fetch(`${baseUrl}/${endpoint}`);

        if (!response.ok) {
            console.error(`API request to ${endpoint} failed with status ${response.status}: ${await response.text()}`);
            return null;
        }

        const data = await response.json();
        const parsed = schema.safeParse(data);

        if (!parsed.success) {
            console.error(`Failed to parse API response from ${endpoint}:`, parsed.error);
            return null;
        }
        return parsed.data;
    } catch (error) {
        console.error(`Error fetching from API endpoint ${endpoint}:`, error);
        return null;
    }
};


const monthEventsFlow = ai.defineFlow(
  {
    name: 'monthEventsFlow',
    inputSchema: CalendarEventsRequestSchema,
    outputSchema: z.array(CalendarEventSchema),
  },
  async ({ year, month }) => {
    const cacheKey = `monthEvents_${year}_${month}`;
    const cachedData = getFromCache<CalendarEvent[]>(cacheKey);
    if (cachedData) {
        console.log(`Returning cached month events for ${year}-${month}.`);
        return cachedData;
    }

    console.log(`Fetching new month events for ${year}-${month}.`);

    const monthData = await fetchFromNpEventsAPI(`v2/date/bs/${year}-${month}-0?bs_as_key=1`, NpEventsApiResponseSchema);
    
    const events = monthData ? processMonthData(monthData) : [];
    
    setInCache(cacheKey, events);
    return events;
  }
);

export async function getMonthEvents(input: z.infer<typeof CalendarEventsRequestSchema>): Promise<CalendarEvent[]> {
  return monthEventsFlow(input);
}
