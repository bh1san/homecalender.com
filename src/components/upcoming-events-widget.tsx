
"use client";

import NepaliDate from 'nepali-date-converter';
import { UpcomingEvent } from "@/ai/schemas";
import { Badge } from "./ui/badge";
import { useIsMounted } from '@/hooks/use-is-mounted';
import { ScrollArea } from './ui/scroll-area';

interface UpcomingEventsWidgetProps {
    loading: boolean;
    events?: UpcomingEvent[];
}

export default function UpcomingEventsWidget({ loading: initialLoading, events }: UpcomingEventsWidgetProps) {
  const isMounted = useIsMounted();

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
    <ScrollArea className="h-96 p-1">
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
    </ScrollArea>
  );
}
