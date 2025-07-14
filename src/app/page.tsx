import { ArrowRightLeft, CalendarDays, PartyPopper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NepaliCalendar from "@/components/nepali-calendar";
import DateConverter from "@/components/date-converter";
import FestivalList from "@/components/festival-list";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline font-bold text-primary">
            Nepali Patro
          </CardTitle>
          <CardDescription className="text-lg font-body">
            Your daily cultural companion for dates and festivals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary/10">
              <TabsTrigger value="calendar">
                <CalendarDays className="mr-2 h-4 w-4" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="converter">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Converter
              </TabsTrigger>
              <TabsTrigger value="festivals">
                <PartyPopper className="mr-2 h-4 w-4" /> Festivals
              </TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-6">
              <NepaliCalendar />
            </TabsContent>
            <TabsContent value="converter" className="mt-6">
              <DateConverter />
            </TabsContent>
            <TabsContent value="festivals" className="mt-6">
              <FestivalList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
