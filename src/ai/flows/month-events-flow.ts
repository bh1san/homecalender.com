
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
  CalendarEventsRequestSchema
} from '@/ai/schemas';
import { getFromCache, setInCache } from '@/ai/cache';

const NpCalendarApiResponseSchema = z.array(z.object({
    day: z.number(),
    day_np: z.string(),
    day_en: z.string(),
    month_np: z.string(),
    month_en: z.string(),
    year_np: z.number(),
    year_en: z.number(),
    ad_month_en: z.string(),
    ad_date_en: z.string(),
    ad_year_en: z.string(),
    events: z.array(z.string()),
    tithi: z.string(),
    is_holiday: z.boolean(),
}));

const fetchFromRapidAPI = async (endpoint: string, schema: z.ZodType) => {
    const baseUrl = 'https://nepali-calendar-api.p.rapidapi.com/api/v1';
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
        console.error("RapidAPI key is not configured. Please add RAPIDAPI_KEY to your .env file.");
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'nepali-calendar-api.p.rapidapi.com'
            }
        });

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

const processMonthData = (data: z.infer<typeof NpCalendarApiResponseSchema>): CalendarEvent[] => {
    if (!data) return [];
    return data.map(dayData => ({
        day: dayData.day,
        tithi: dayData.tithi,
        gregorian_date: `${dayData.ad_year_en}-${dayData.ad_month_en.padStart(2, '0')}-${dayData.ad_date_en.padStart(2, '0')}`,
        events: dayData.events,
        is_holiday: dayData.is_holiday,
    }));
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

    const monthData = await fetchFromRapidAPI(`month?year=${year}&month=${month}`, NpCalendarApiResponseSchema);
    
    const events = monthData ? processMonthData(monthData) : [];
    
    setInCache(cacheKey, events);
    return events;
  }
);

export async function getMonthEvents(input: z.infer<typeof CalendarEventsRequestSchema>): Promise<CalendarEvent[]> {
  return monthEventsFlow(input);
}
