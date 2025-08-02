
"use client";

import { ArrowRightLeft, CalendarDays, PartyPopper, Search, Menu, Plus, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NepaliCalendar from "@/components/nepali-calendar";
import DateConverter from "@/components/date-converter";
import FestivalList from "@/components/festival-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNews } from "@/ai/flows/news-flow";
import { NewsItem, Festival, PatroDataResponse } from "@/ai/schemas";
import CurrentDateTime from "@/components/current-date-time";
import { useEffect, useState } from "react";
import { getFestivals } from "@/ai/flows/festival-flow";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MotivationalQuote from "@/components/motivational-quote";
import { User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import UpcomingEventsWidget from "@/components/upcoming-events-widget";
import { getPatroData } from "@/ai/flows/patro-data-flow";
import Rashifal from "@/components/rashifal";
import GoldSilver from "@/components/gold-silver";
import Forex from "@/components/forex";
import { useIsMounted } from "@/hooks/use-is-mounted";


type Settings = {
    logoUrl: string;
    navLinks: string[];
}

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [patroData, setPatroData] = useState<PatroDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({ logoUrl: "https://placehold.co/200x50.png", navLinks: [] });
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings, using defaults.", error);
        } finally {
            setLoadingSettings(false);
        }
    }
    fetchSettings();
  }, []);
  

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const country = "Nepal";
        
        const patroPromise = getPatroData();
        const newsPromise = getNews(country);
        const festivalPromise = getFestivals(country);

        const [patroData, newsData, festivalData] = await Promise.all([patroPromise, newsPromise, festivalPromise]);

        setPatroData(patroData);
        setNewsItems(newsData.headlines);
        setFestivals(festivalData.festivals);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  return (
    <>
      <Header navLinks={settings.navLinks} logoUrl={settings.logoUrl} isLoading={loadingSettings} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-md items-center">
            <CurrentDateTime today={patroData?.today} />
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
            {loading ? (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-48 bg-card/80 rounded-lg shadow-md overflow-hidden animate-pulse">
                             <div className="w-full h-32 bg-muted" />
                            <div className="p-3">
                                 <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                                 <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                newsItems.length > 0 && (
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {newsItems.map((item) => (
                             <a 
                                key={item.id} 
                                href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-48 bg-card/80 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
                            >
                                <Image 
                                    src={item.imageDataUri} 
                                    alt={item.title} 
                                    width={192} 
                                    height={128} 
                                    className="w-full h-32 object-cover" 
                                    data-ai-hint={item.imageHint}
                                />
                                <div className="p-3">
                                    <p className="text-sm font-medium text-card-foreground leading-tight">{item.title}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                )
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-card-foreground">मेरो नोट</CardTitle>
                     <Button size="sm" variant="outline"><Plus className="mr-1" /> Add Note</Button>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="You can add your notes here." className="bg-background/50"/>
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

             <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
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
                      {loading ? (
                         <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                               <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                            ))}
                         </div>
                      ) : (
                         festivals.length > 0 ? <FestivalList festivals={festivals} /> : <p className="text-center text-muted-foreground p-4 bg-background/80 rounded">No festivals found for Nepal.</p>
                      )}
                    </TabsContent>
                     <TabsContent value="gold" className="mt-6">
                         <GoldSilver loading={loading} prices={patroData?.goldSilver} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

          </aside>

          <div className="lg:col-span-3 space-y-8">
            <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-2 sm:p-4">
                     <NepaliCalendar 
                        today={patroData?.today} 
                        monthEvents={patroData?.monthEvents} 
                        isLoading={loading} 
                    />
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
          </div>

        </div>
      </main>
    </>
  );
}

function Header({ navLinks, logoUrl, isLoading }: { navLinks: string[], logoUrl: string, isLoading: boolean }) {
    const isMounted = useIsMounted();

    if (!isMounted || isLoading) {
        return (
             <header className="bg-white text-primary-foreground shadow-md backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="h-8 w-48 bg-gray-300/20 animate-pulse rounded-md" />
                        <div className="hidden md:flex items-center space-x-4">
                           <div className="h-5 w-64 bg-gray-300/20 animate-pulse rounded-md" />
                           <div className="h-8 w-10 bg-gray-300/20 animate-pulse rounded-md" />
                           <div className="h-8 w-8 bg-gray-300/20 animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            </header>
        )
    }
    
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
                    <div className="flex items-center space-x-4">
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
