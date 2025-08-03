
"use client";

import { useState, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import { UpcomingEvent } from "@/ai/schemas";
import { Badge } from "./ui/badge";
import { useIsMounted } from '@/hooks/use-is-mounted';

interface UpcomingEventsWidgetProps {
    loading: boolean;
}

const getClientSideUpcomingEvents = (): UpcomingEvent[] => {
    const today = new Date();
    const events: UpcomingEvent[] = [];

    for (let i = 0; i < 8; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + (i * 4) + 5); 
        
        const event: UpcomingEvent = {
            summary: `Sample Event ${i + 1}`,
            startDate: futureDate.toISOString().split('T')[0],
            isHoliday: Math.random() > 0.8 
        };
        events.push(event);
    }
    return events;
}

export default function UpcomingEventsWidget({ loading: initialLoading }: UpcomingEventsWidgetProps) {
  const isMounted = useIsMounted();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    if (isMounted) {
      setEvents(getClientSideUpcomingEvents());
    }
  }, [isMounted]);

  if (!isMounted || initialLoading) {
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

  if (!events || events.length === 0) {
    return <p className="text-center text-muted-foreground p-6">कुनै आउँदो कार्यक्रम छैन।</p>;
  }

  return (
    <div className="p-0">
        <ul className="space-y-1">
            {events.map((event, index) => {
                const nepaliDate = new NepaliDate(new Date(event.startDate));
                
                return (
                    <li key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                           <span className="text-sm font-medium">{nepaliDate.format('MMM', 'np')}</span>
                           <span className="text-2xl font-bold">{nepaliDate.format('D', 'np')}</span>
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
