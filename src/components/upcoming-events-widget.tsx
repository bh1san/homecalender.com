
"use client";

import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/ai/flows/upcoming-events-flow";
import { UpcomingEvent } from "@/ai/schemas";
import { toBS, getNepaliMonthName, getNepaliNumber } from "@/lib/nepali-date-converter";
import { Calendar } from "lucide-react";

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const upcomingEvents = await getUpcomingEvents();
        setEvents(upcomingEvents.events);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    // The date from iCal is in YYYYMMDD format, but JS needs separators.
    const date = new Date(dateStr);
    const bsDate = toBS(date);
    const monthName = getNepaliMonthName(bsDate.month);
    const day = getNepaliNumber(bsDate.day);
    return `${monthName} ${day}`;
  }

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
                       <span className="text-sm font-medium">{formatDate(event.startDate).split(' ')[0]}</span>
                       <span className="text-2xl font-bold">{formatDate(event.startDate).split(' ')[1]}</span>
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
