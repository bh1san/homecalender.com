
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

const NpCalendarSajjanApiResponseSchema = z.object({
    metadata: z.object({
        en: z.string(),
        np: z.string(),
    }),
    days: z.array(z.object({
        n: z.string(),
        e: z.string(),
        t: z.string(),
        f: z.string(),
        h: z.boolean(),
        d: z.number(),
    })),
    holiFest: z.array(z.string()),
    marriage: z.array(z.string()),
    bratabandha: z.array(z.string()),
});

const fetchFromSajjanAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://nepalicalendar.sajjan.com.np/data';
    try {
        const response = await fetch(`${baseUrl}/${endpoint}`, { next: { revalidate: 86400 } });

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
        const bsDay = dayData.d; // Use the correct numeric day 'd' from the API
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
    try {
        const NepaliDate = (await import('nepali-date-converter')).default;
        const customEventsData = (await import('@/data/custom-events.json')).default;

        const monthData = await fetchFromSajjanAPI(`${year}/${month}.json`, NpCalendarSajjanApiResponseSchema);
        const apiEvents = monthData ? await processMonthData(monthData, year, month) : [];

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

        const eventsMap = new Map<number, CalendarEvent>();

        apiEvents.forEach(event => {
            eventsMap.set(event.day, event);
        });

        customEventsForMonth.forEach(customEvent => {
            if (!customEvent) return;

            const day = customEvent.bsDay;
            const existingEvent = eventsMap.get(day);

            if (existingEvent) {
                if (!existingEvent.events.includes(customEvent.summary)) {
                    existingEvent.events.push(customEvent.summary);
                }
            } else {
                const adDate = new NepaliDate(year, month - 1, day).toJsDate();
                eventsMap.set(day, {
                    day: day,
                    tithi: '',
                    gregorian_date: adDate.toISOString().split('T')[0],
                    events: [customEvent.summary],
                    is_holiday: false,
                });
            }
        });

        const mergedEvents = Array.from(eventsMap.values()).sort((a, b) => a.day - b.day);
        
        return mergedEvents;
    } catch (error) {
        console.error("Error in monthEventsFlow, returning empty array", error);
        return [];
    }
  }
);

export async function getMonthEvents(input: z.infer<typeof CalendarEventsRequestSchema>): Promise<CalendarEvent[]> {
  try {
    const events = await monthEventsFlow(input);
    return events;
  } catch (error) {
    console.error("Error in getMonthEvents, returning empty array", error);
    return [];
  }
}
