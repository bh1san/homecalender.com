import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PartyPopper } from "lucide-react";
import { Festival } from "@/ai/schemas";

interface FestivalListProps {
  festivals: Festival[];
}

export default function FestivalList({ festivals }: FestivalListProps) {
  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {festivals.map((festival, index) => (
          <AccordionItem value={`item-${index}`} key={index} className="rounded-lg border bg-card px-4 shadow">
            <AccordionTrigger className="font-headline text-lg hover:no-underline">
              <div className="flex items-center gap-4">
                <PartyPopper className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <span>{festival.name}</span>
                  <p className="text-sm font-light text-muted-foreground">{festival.displayDate}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 text-base">
              {festival.description}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
