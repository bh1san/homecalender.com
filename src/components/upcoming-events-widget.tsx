
"use client";

import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/ai/flows/upcoming-events-flow";
import { UpcomingEvent } from "@/ai/schemas";
import { getNepaliMonthName, getNepaliNumber } from "@/lib/nepali-date-converter";

// A placeholder for converting AD date string to BS parts
// In a real scenario without a stable library, this would need a robust implementation
// or an AI flow call.
async function getBSDateParts(dateStr: string): Promise<{ monthName: string, day: string }> {
    try {
        const date = new Date(dateStr);
        // This is a rough, placeholder conversion.
        const bsYear = date.getFullYear() + 57;
        const bsMonth = date.getMonth() + 1; // Not accurate
        const bsDay = date.getDate(); // Not accurate
        
        return {
            monthName: getNepaliMonthName(bsMonth),
            day: getNepaliNumber(bsDay)
        };
    } catch {
        return { monthName: "...", day: "..." };
    }
}


export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formattedDates, setFormattedDates] = useState<Record<string, { monthName: string, day: string }>>({});

  useEffect(() => {
    const fetchAndFormatEvents = async () => {
      setLoading(true);
      try {
        const upcomingEventsData = await getUpcomingEvents();
        const upcomingEvents = upcomingEventsData.events;
        setEvents(upcomingEvents);
        
        const dates: Record<string, { monthName: string, day: string }> = {};
        for (const event of upcomingEvents) {
            if (!dates[event.startDate]) {
                dates[event.startDate] = await getBSDateParts(event.startDate);
            }
        }
        setFormattedDates(dates);

      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFormatEvents();
  }, []);


  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-md bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
            </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-center text-muted-foreground p-6">No upcoming events found.</p>;
  }

  return (
    <div className="p-0">
        <ul className="space-y-1">
            {events.map((event, index) => (
                <li key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                       <span className="text-sm font-medium">{formattedDates[event.startDate]?.monthName || '...'}</span>
                       <span className="text-2xl font-bold">{formattedDates[event.startDate]?.day || '...'}</span>
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-card-foreground">{event.summary}</p>
                         <p className="text-xs text-muted-foreground">{event.startDate}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
  );
}
