import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PartyPopper } from "lucide-react";

const festivals = [
  {
    name: "Dashain (Bijaya Dashami)",
    date: "Ashwin Shukla Dashami",
    description: "The longest and most auspicious festival in the Bikram Sambat calendar, celebrated by Nepali people of all castes and creeds throughout the globe. It symbolizes the victory of good over evil.",
  },
  {
    name: "Tihar (Deepawali)",
    date: "Kartik Krishna Trayodashi to Kartik Shukla Dwitiya",
    description: "A five-day-long festival of lights, second only to Dashain in importance. It is celebrated by worshipping Laxmi, the goddess of wealth, and features diyas, firecrackers, and family gatherings.",
  },
  {
    name: "Holi (Fagu Purnima)",
    date: "Falgun Shukla Purnima",
    description: "The festival of colors, celebrating the victory of good over evil and the arrival of spring. People playfully throw colored powders and water at each other.",
  },
  {
    name: "Maha Shivaratri",
    date: "Falgun Krishna Chaturdashi",
    description: "A major festival in Hinduism, this festival marks a remembrance of 'overcoming darkness and ignorance' in life and the world. It is observed by remembering Shiva and chanting prayers, fasting, and meditating.",
  },
  {
    name: "Chhath Parva",
    date: "Kartik Shukla Shashthi",
    description: "An ancient Hindu festival dedicated to the solar deity, Surya, and his sister, Chhathi Maiya. The rituals are rigorous and are observed over a period of four days.",
  },
  {
    name: "Gai Jatra",
    date: "Bhadra Krishna Pratipada",
    description: "The festival of cows, one of the most popular festivals in Nepal. It is a time to commemorate the death of loved ones, with a tradition of humor, satire, and comedy.",
  },
  {
    name: "Indra Jatra",
    date: "Bhadra Shukla Chaturdashi",
    description: "The biggest street festival in Nepal, dedicated to Indra, the king of heaven and god of rain. It features masked dances, chariot processions, and the display of the living goddess, Kumari.",
  },
];

export default function FestivalList() {
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
                  <p className="text-sm font-light text-muted-foreground">{festival.date}</p>
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
