
"use client";

import { ArrowRightLeft, CalendarDays, PartyPopper, Search, Menu, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NepaliCalendar from "@/components/nepali-calendar";
import DateConverter from "@/components/date-converter";
import FestivalList from "@/components/festival-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNews } from "@/ai/flows/news-flow";
import { NewsItem, Festival } from "@/ai/schemas";
import CurrentDateTime from "@/components/current-date-time";
import { useEffect, useState, useMemo } from "react";
import { getFestivals } from "@/ai/flows/festival-flow";
import { Calendar } from "@/components/ui/calendar";
import LocationSelector from "@/components/location-selector";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MotivationalQuote from "@/components/motivational-quote";
import { format, differenceInDays, parseISO } from 'date-fns';
import { User } from "lucide-react";

type Settings = {
    logoUrl: string;
    navLinks: string[];
}

const parseFestivalDate = (dateString: string) => {
    try {
        // The date comes in YYYY-MM-DD format, so parseISO can handle it directly.
        const date = parseISO(dateString);
        if (isNaN(date.getTime())) return null;
        return date;
    } catch {
        return null;
    }
};

const formatUpcomingEventDate = (date: Date) => {
    return format(date, "do MMMM");
};

export default function Home() {
  const [location, setLocation] = useState<{ country: string | null }>({ country: null });
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
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

  const isNepal = useMemo(() => location.country === 'Nepal', [location.country]);
  
  const upcomingEvents = useMemo(() => {
    if (!festivals) return [];
    
    const now = new Date();
    
    return festivals
        .map(festival => ({
            ...festival,
            parsedDate: parseFestivalDate(festival.gregorianStartDate),
        }))
        .filter(event => event.parsedDate && differenceInDays(event.parsedDate, now) >= 0)
        .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime())
        .slice(0, 5)
        .map(event => ({
            day: format(event.parsedDate!, 'dd'),
            month: format(event.parsedDate!, 'MMM'),
            title: event.name,
            fullDate: formatUpcomingEventDate(event.parsedDate!),
        }));

  }, [festivals]);


  useEffect(() => {
    const fetchNewsAndFestivals = async (country: string) => {
      setLoadingNews(true);
      setLoadingFestivals(true);
      setNewsItems([]);
      setFestivals([]);

      try {
        const newsPromise = getNews(country);
        const festivalPromise = getFestivals(country);

        const newsData = await newsPromise;
        setNewsItems(newsData.headlines);
        setLoadingNews(false);

        const festivalData = await festivalPromise;
        setFestivals(festivalData.festivals);
        setLoadingFestivals(false);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingNews(false);
        setLoadingFestivals(false);
      }
    };

    if (location.country) {
      fetchNewsAndFestivals(location.country);
    }
  }, [location.country]);

  return (
    <div className="min-h-screen">
      <Header navLinks={settings.navLinks} logoUrl={settings.logoUrl} isLoading={loadingSettings} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-accent/90 text-white p-4 rounded-lg shadow-md items-center">
            <CurrentDateTime country={location.country} />
            <div className="hidden sm:flex justify-end">
                <MotivationalQuote />
            </div>
        </div>

        <div className="flex items-center justify-between mb-4">
            <LocationSelector onLocationChange={(country) => setLocation({ country })} />
            <div className="relative w-full max-w-xs">
                <Input type="search" placeholder="Search events" className="pl-10 bg-white/80"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            </div>
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-white dark:text-gray-200 bg-black/50 p-2 rounded">
            News Bulletin {location.country ? `from ${location.country}` : 'Headlines'}
          </h3>
            {loadingNews ? (
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
                                <Image src={item.imageDataUri} alt={item.title} width={192} height={128} className="w-full h-32 object-cover" />
                                <div className="p-3">
                                    <p className="text-sm font-medium text-card-foreground leading-tight">{item.title}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                )
            )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-2 sm:p-4">
                  <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/60">
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
                        {isNepal ? <NepaliCalendar /> : <Calendar mode="single" className="w-full rounded-md bg-card/90" />}
                    </TabsContent>
                    <TabsContent value="converter" className="mt-6">
                      <DateConverter />
                    </TabsContent>
                    <TabsContent value="festivals" className="mt-6">
                      {loadingFestivals ? (
                         <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                               <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                            ))}
                         </div>
                      ) : (
                         festivals.length > 0 ? <FestivalList festivals={festivals} /> : <p className="text-center text-muted-foreground p-4 bg-background/80 rounded">Select a country to see its festivals.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-card-foreground">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                     {loadingFestivals ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-2">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-8 bg-muted rounded-t-md animate-pulse" />
                                        <div className="w-12 h-4 bg-muted/50 rounded-b-md animate-pulse" />
                                    </div>
                                    <div className="w-full">
                                        <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-muted/50 rounded w-1/2 mt-1 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.title} className="flex items-start gap-4 p-2 rounded-lg transition-colors hover:bg-primary/10">
                                    <div className="flex-shrink-0 text-center">
                                        <div className="bg-primary text-primary-foreground font-bold p-2 rounded-t-md text-sm">{event.day}</div>
                                        <div className="bg-secondary text-secondary-foreground p-1 rounded-b-md text-xs">{event.month}</div>
                                     </div>
                                    <div>
                                        <p className="font-medium text-card-foreground">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">{event.fullDate}</p>
                                    </div>
                                </div>
                            ))}
                            {upcomingEvents.length === 0 && !loadingFestivals && (
                                <p className="text-sm text-center text-muted-foreground">No upcoming events found for the selected country.</p>
                            )}
                        </div>
                     )}
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ navLinks, logoUrl, isLoading }: { navLinks: string[], logoUrl: string, isLoading: boolean }) {
    if (isLoading) {
        return (
             <header className="bg-accent/90 text-white shadow-md backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="h-8 w-48 bg-gray-300/20 animate-pulse rounded-md" />
                        <div className="hidden md:flex items-center space-x-4">
                           <div className="h-5 w-64 bg-gray-300/20 animate-pulse rounded-md" />
                        </div>
                    </div>
                </div>
            </header>
        )
    }
    
    return (
        <header className="bg-accent/90 text-white shadow-md backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/">
                        <Image src={logoUrl} alt="HomeCalender Logo" width={200} height={40} className="object-contain" priority />
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4">
                        {navLinks.map(link => (
                            <Link key={link} href="#" className="text-sm font-medium hover:underline transition-transform hover:scale-110">
                                {link}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white hover:text-accent-foreground">EN</Button>
                        <User className="h-6 w-6 cursor-pointer hover:text-primary-foreground/80"/>
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
