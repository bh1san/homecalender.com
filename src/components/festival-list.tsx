
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PartyPopper } from "lucide-react";
import { UpcomingEvent } from "@/ai/schemas";
import { useState, useEffect } from 'react';
import type NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';


interface FestivalListProps {
  festivals: UpcomingEvent[];
}

export default function FestivalList({ festivals }: FestivalListProps) {
  const isMounted = useIsMounted();
  const [NepaliDate, setNepaliDate] = useState<typeof import('nepali-date-converter').default | null>(null);

  useEffect(() => {
    import('nepali-date-converter').then(mod => setNepaliDate(() => mod.default));
  }, []);

  if (!isMounted || !NepaliDate) {
    return (
      <div className="flex items-center justify-center p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
        Loading festivals...
      </div>
    );
  }

  if (!festivals || festivals.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
        No upcoming holidays found for the rest of the year.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {festivals.map((festival, index) => {
          const nepaliDate = new NepaliDate(new Date(festival.startDate));
          const displayDate = nepaliDate.format('MMMM DD, ddd', 'en');
          
          return (
            <AccordionItem value={`item-${index}`} key={index} className="rounded-lg border bg-card px-4 shadow">
              <AccordionTrigger className="font-headline text-lg hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <PartyPopper className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span>{festival.summary}</span>
                    <p className="text-sm font-light text-muted-foreground">{displayDate}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-base">
                {`This event, ${festival.summary}, will take place on ${displayDate}.`}
                {festival.isHoliday && <span className="font-bold"> This is a public holiday.</span>}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
}
