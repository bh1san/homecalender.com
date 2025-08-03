import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PartyPopper } from "lucide-react";
import { UpcomingEvent } from "@/ai/schemas";
import NepaliDate from "nepali-date-converter";

interface FestivalListProps {
  festivals: UpcomingEvent[];
}

export default function FestivalList({ festivals }: FestivalListProps) {
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
