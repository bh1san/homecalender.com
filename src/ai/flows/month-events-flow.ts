
'use server';
/**
 * @fileOverview A flow for fetching calendar events for a specific Nepali month using the Sajjan.com.np API.
 *
 * - getMonthEvents - A function that fetches all calendar data for a given BS year and month.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  CalendarEvent,
  CalendarEventSchema,
  CalendarEventsRequestSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';
import NepaliDate from 'nepali-date-converter';


const NpCalendarSajjanApiResponseSchema = z.object({
    metadata: z.object({
        en: z.string(),
        np: z.string(),
    }),
    days: z.array(z.object({
        n: z.string(), // nepali date
        e: z.string(), // english date
        t: z.string(), // tithi
        f: z.string(), // festival
        h: z.boolean(), // holiday
        d: z.number(), // day of week
    })),
    holiFest: z.array(z.string()),
    marriage: z.array(z.string()),
    bratabandha: z.array(z.string()),
});

const fetchFromSajjanAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://nepalicalendar.sajjan.com.np/data';
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

const processMonthData = (data: z.infer<typeof NpCalendarSajjanApiResponseSchema>, year: number, month: number): CalendarEvent[] => {
    if (!data) return [];
    
    return data.days.map(dayData => {
        const bsDay = parseInt(new NepaliDate(0,0,0).convert(dayData.n, 'np', 'en'));
        const adDate = new NepaliDate(year, month - 1, bsDay).toJsDate();
        const events = [];
        if (dayData.f) {
            events.push(dayData.f);
        }

        return {
            day: bsDay,
            tithi: dayData.t,
            gregorian_date: adDate.toISOString().split('T')[0],
            events: events,
            is_holiday: dayData.h,
        };
    });
};

const monthEventsFlow = ai.defineFlow(
  {
    name: 'monthEventsFlow',
    inputSchema: CalendarEventsRequestSchema,
    outputSchema: z.array(CalendarEventSchema),
  },
  async ({ year, month }) => {
    const cacheKey = `sajjan_monthEvents_${year}_${month}`;
    const cachedData = getFromCache<CalendarEvent[]>(cacheKey);
    if (cachedData) {
        console.log(`Returning cached month events for ${year}-${month} from Sajjan API.`);
        return cachedData;
    }

    console.log(`Fetching new month events for ${year}-${month} from Sajjan API.`);

    const monthData = await fetchFromSajjanAPI(`${year}/${month}.json`, NpCalendarSajjanApiResponseSchema);
    
    const events = monthData ? processMonthData(monthData, year, month) : [];
    
    setInCache(cacheKey, events);
    return events;
  }
);

export async function getMonthEvents(input: z.infer<typeof CalendarEventsRequestSchema>): Promise<CalendarEvent[]> {
  return monthEventsFlow(input);
}
