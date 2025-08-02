
"use client";

import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/ai/flows/upcoming-events-flow";
import { UpcomingEvent } from "@/ai/schemas";
import { getNepaliMonthName, getNepaliNumber } from "@/lib/nepali-date-converter";
import { Badge } from "./ui/badge";

// This is a simple helper and might not be perfectly accurate without a conversion library.
// It splits the YYYY-MM-DD string.
function getADDateParts(dateStr: string): { month: number, day: number, year: number } {
    try {
        const parts = dateStr.split('-').map(Number);
        return { year: parts[0], month: parts[1], day: parts[2] };
    } catch {
        return { month: 0, day: 0, year: 0 };
    }
}


export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFormatEvents = async () => {
      setLoading(true);
      try {
        const upcomingEventsData = await getUpcomingEvents();
        setEvents(upcomingEventsData.events);
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
    return <p className="text-center text-muted-foreground p-6">कुनै आउँदो कार्यक्रम छैन।</p>;
  }

  return (
    <div className="p-0">
        <ul className="space-y-1">
            {events.map((event, index) => {
                // Since the API now provides the date parts directly, we use them.
                const { day, month } = getADDateParts(event.startDate);
                
                return (
                    <li key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                           <span className="text-sm font-medium">{getNepaliMonthName(month) || '...'}</span>
                           <span className="text-2xl font-bold">{getNepaliNumber(day) || '...'}</span>
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-card-foreground">{event.summary}</p>
                             {event.isHoliday && <Badge variant="destructive" className="mt-1">Holiday</Badge>}
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
  );
}
