
'use server';
/**
 * @fileOverview A flow for fetching calendar events for a specific Nepali month using the Sajjan.com.np API and local custom events.
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
import customEventsData from '@/data/custom-events.json';

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

const processMonthData = async (data: z.infer<typeof NpCalendarSajjanApiResponseSchema>, year: number, month: number): Promise<CalendarEvent[]> => {
    if (!data) return [];
    const NepaliDate = (await import('nepali-date-converter')).default;
    
    return data.days.map(dayData => {
        const nepaliDateConverter = new NepaliDate(0,0,0);
        const bsDay = parseInt(nepaliDateConverter.convert(dayData.n, 'np', 'en'));
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
    const cacheKey = `sajjan_monthEvents_v3_${year}_${month}`;
    const cachedData = getFromCache<CalendarEvent[]>(cacheKey, 24 * 60 * 60 * 1000); // Cache for 24 hours
    if (cachedData) {
        console.log(`Returning cached month events for ${year}-${month} from Sajjan API + Custom.`);
        return cachedData;
    }

    console.log(`Fetching new month events for ${year}-${month} from Sajjan API + Custom.`);
    const NepaliDate = (await import('nepali-date-converter')).default;

    // 1. Fetch events from Sajjan API
    const monthData = await fetchFromSajjanAPI(`${year}/${month}.json`, NpCalendarSajjanApiResponseSchema);
    const apiEvents = monthData ? await processMonthData(monthData, year, month) : [];

    // 2. Filter custom events for the given year and month
    const customEventsForMonth = customEventsData
        .map(event => {
            try {
                const eventDate = new Date(event.startDate);
                const nepaliEventDate = new NepaliDate(eventDate);
                return {
                    ...event,
                    bsYear: nepaliEventDate.getYear(),
                    bsMonth: nepaliEventDate.getMonth() + 1,
                    bsDay: nepaliEventDate.getDate()
                };
            } catch (e) {
                return null;
            }
        })
        .filter(event => event && event.bsYear === year && event.bsMonth === month);

    // 3. Merge API events and custom events
    const eventsMap = new Map<number, CalendarEvent>();

    // Add API events to the map first
    apiEvents.forEach(event => {
        eventsMap.set(event.day, event);
    });

    // Add or merge custom events
    customEventsForMonth.forEach(customEvent => {
        if (!customEvent) return;

        const day = customEvent.bsDay;
        const existingEvent = eventsMap.get(day);

        if (existingEvent) {
            // If event for this day already exists, add custom event summary if not already present
            if (!existingEvent.events.includes(customEvent.summary)) {
                existingEvent.events.push(customEvent.summary);
            }
        } else {
            // If no event for this day, create a new one
            const adDate = new NepaliDate(year, month - 1, day).toJsDate();
            eventsMap.set(day, {
                day: day,
                tithi: '', // Tithi info comes from API, not available for custom-only dates
                gregorian_date: adDate.toISOString().split('T')[0],
                events: [customEvent.summary],
                is_holiday: false, // Assume custom events aren't holidays unless specified
            });
        }
    });

    const mergedEvents = Array.from(eventsMap.values()).sort((a, b) => a.day - b.day);
    
    setInCache(cacheKey, mergedEvents);
    return mergedEvents;
  }
);

export async function getMonthEvents(input: z.infer<typeof CalendarEventsRequestSchema>): Promise<CalendarEvent[]> {
  try {
    const events = await monthEventsFlow(input);
    return events;
  } catch (error) {
    console.error("Error in getMonthEvents, returning empty array", error);
    return []; // Ensure it always returns a valid array
  }
}
