
import { ArrowRightLeft, PartyPopper, Search, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NepaliCalendarComponent from "@/components/nepali-calendar";
import DateConverter from "@/components/date-converter";
import FestivalList from "@/components/festival-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrentDateTime from "@/components/current-date-time";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MotivationalQuote from "@/components/motivational-quote";
import { User } from "lucide-react";
import UpcomingEventsWidget from "@/components/upcoming-events-widget";
import Rashifal from "@/components/rashifal";
import GoldSilver from "@/components/gold-silver";
import Forex from "@/components/forex";
import { getPageData } from "@/app/actions";

function Header({ navLinks, logoUrl }: { navLinks: string[], logoUrl: string }) {
    return (
        <header className="bg-white text-foreground shadow-md backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/">
                        <Image src={logoUrl} alt="HomeCalender Logo" width={200} height={40} className="object-contain" priority data-ai-hint="logo" />
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4">
                        {navLinks.map(link => (
                            <Link key={link} href="#" className="text-sm font-medium hover:text-primary hover:underline transition-colors">
                                {link}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="outline" size="sm">EN</Button>
                        <User className="h-6 w-6 cursor-pointer hover:text-primary"/>
                    </div>
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <nav className="flex flex-col space-y-4 mt-8">
                                    {navLinks.map(link => (
                                        <Link key={link} href="#" className="text-lg font-medium hover:underline">
                                            {link}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}


export default async function Home() {
  const { patroData, newsItems, settings } = await getPageData();
  const loading = false; // Data is pre-fetched on the server

  return (
    <>
      <Header navLinks={settings.navLinks} logoUrl={settings.logoUrl} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-md items-center">
            <CurrentDateTime today={patroData?.today} todaysEvent={patroData?.todaysEvent} />
            <div className="hidden sm:flex justify-end">
                <MotivationalQuote />
            </div>
        </div>

        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Nepal</h2>
            <div className="relative w-full max-w-xs">
                <Input type="search" placeholder="Search events" className="pl-10 bg-white/80"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            </div>
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-accent-foreground dark:text-gray-200 bg-accent/20 p-2 rounded">
            News Bulletin from Nepal
          </h3>
            {newsItems.length > 0 ? (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {newsItems.map((item) => (
                         <a 
                            key={item.id} 
                            href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-48 bg-card/80 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
                        >
                            <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                width={192} 
                                height={128} 
                                className="w-full h-32 object-cover" 
                                loading="lazy"
                            />
                            <div className="p-3">
                                <p className="text-sm font-medium text-card-foreground leading-tight">{item.title}</p>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    Could not load news headlines. Please ensure the NewsData.io API key is set in the environment variables.
                </div>
            )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-8">
             <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-card-foreground">आउँदा दिनहरु</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <UpcomingEventsWidget loading={loading} events={patroData?.upcomingEvents} />
                </CardContent>
            </Card>

             <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-card-foreground">राशीफल</CardTitle>
                </CardHeader>
                <CardContent>
                     <Rashifal loading={loading} horoscope={patroData?.horoscope} />
                </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-2 sm:p-4">
                     <NepaliCalendarComponent />
                </CardContent>
              </Card>

              <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Foreign Exchange Rates</CardTitle>
                  <CardDescription>Rates are against NPR and provided by Nepal Rastra Bank.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Forex loading={loading} rates={patroData?.forex} />
                </CardContent>
              </Card>

              <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="converter" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                      <TabsTrigger value="converter">
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Converter
                      </TabsTrigger>
                      <TabsTrigger value="festivals">
                        <PartyPopper className="mr-2 h-4 w-4" /> Festivals
                      </TabsTrigger>
                       <TabsTrigger value="gold">
                        Gold/Silver
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="converter" className="mt-6">
                      <DateConverter />
                    </TabsContent>
                    <TabsContent value="festivals" className="mt-6">
                      {patroData?.upcomingEvents && patroData.upcomingEvents.length > 0 ? (
                           <FestivalList festivals={patroData.upcomingEvents} />
                         ) : (
                           <p className="text-center text-muted-foreground p-4 bg-background/80 rounded">No upcoming festivals found for the current month.</p>
                         )
                      }
                    </TabsContent>
                     <TabsContent value="gold" className="mt-6">
                         <GoldSilver loading={loading} prices={patroData?.goldSilver} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

          </div>
        </div>
      </main>
    </>
  );
}
