
"use client";

import { ArrowRightLeft, CalendarDays, PartyPopper, Search, Gift, History, Heart, User, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNews } from "@/ai/flows/news-flow";
import { NewsItem, Festival } from "@/ai/schemas";
import CurrentDateTime from "@/components/current-date-time";
import { useEffect, useState, useMemo } from "react";
import { getFestivals } from "@/ai/flows/festival-flow";
import { Calendar } from "@/components/ui/calendar";
import LocationSelector from "@/components/location-selector";

const upcomingEvents = [
    { day: "15", month: "Jul", title: "World Youth Skills Day", relativeTime: "Today" },
    { day: "17", month: "Jul", title: "First day of Shrawan", relativeTime: "2 days later" },
]

export default function Home() {
  const [location, setLocation] = useState<{ country: string | null }>({ country: null });
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  const isNepal = useMemo(() => location.country === 'Nepal', [location.country]);

  useEffect(() => {
    const fetchData = async (country: string) => {
      setLoading(true);
      try {
        const [newsData, festivalData] = await Promise.all([
          getNews(country),
          getFestivals(country)
        ]);
        setNewsItems(newsData.headlines);
        setFestivals(festivalData.festivals);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (location.country) {
      fetchData(location.country);
    } else {
        setLoading(false);
    }
  }, [location.country]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
            {loading && !newsItems.length ? (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-48 bg-card/80 rounded-lg shadow-md overflow-hidden">
                             <div className="w-full h-32 bg-muted animate-pulse" />
                            <div className="p-3">
                                 <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2 animate-pulse" />
                                 <div className="h-4 bg-muted-foreground/20 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                newsItems.length > 0 && (
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {newsItems.map((item, index) => (
                            <div key={index} className="flex-shrink-0 w-48 bg-card/80 rounded-lg shadow-md overflow-hidden">
                                <Image src={item.imageDataUri} alt={item.title} width={192} height={128} className="w-full h-32 object-cover" />
                                <div className="p-3">
                                    <p className="text-sm font-medium text-card-foreground leading-tight">{item.title}</p>
                                </div>
                            </div>
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
                      {loading ? (
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
                    <div className="space-y-4">
                        {upcomingEvents.map(event => (
                            <div key={event.title} className="flex items-start gap-4">
                                <div className="flex-shrink-0 text-center">
                                    <div className="bg-primary text-primary-foreground font-bold p-2 rounded-t-md text-sm">{event.day}</div>
                                    <div className="bg-secondary text-secondary-foreground p-1 rounded-b-md text-xs">{event.month}</div>
                                </div>
                                <div>
                                    <p className="font-medium text-card-foreground">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">{event.relativeTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start bg-card/80 backdrop-blur-sm"><Gift className="mr-2 text-pink-500"/> Remit</Button>
                <Button variant="outline" className="justify-start bg-card/80 backdrop-blur-sm"><History className="mr-2 text-green-500"/> Recharge</Button>
                <Button variant="outline" className="justify-start bg-card/80 backdrop-blur-sm"><Heart className="mr-2 text-blue-500"/> Gifts</Button>
                <Button variant="outline" className="justify-start bg-card/80 backdrop-blur-sm"><CalendarDays className="mr-2 text-red-500"/> Holidays</Button>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-card-foreground">Our Doctors</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Image src="https://placehold.co/60x60.png" alt="Dr. Babita Sharma" width={60} height={60} className="rounded-full" data-ai-hint="woman doctor"/>
                    <div>
                        <p className="font-bold text-red-600">Dr. Babita Sharma</p>
                        <p className="text-sm text-muted-foreground">MBBS, MD Psychiatry and Psychotherapy</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
    const navLinks = [
        "Remit", "Mart", "Gifts", "Recharge", "Health", "Bank Rates", "Jyotish", 
        "Rashifal", "Podcasts", "News", "Blog", "Gold/Silver", "Forex", "Converter"
    ];

    return (
        <header className="bg-accent/90 text-white shadow-md backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <span className="text-2xl font-bold">#</span>
                            <span className="font-bold text-xl">HOMECALENDER.COM</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-4">
                            {navLinks.map(link => (
                                <Link key={link} href="#" className="text-sm font-medium hover:underline">
                                    {link}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white hover:text-accent-foreground">EN</Button>
                        <User className="h-6 w-6"/>
                    </div>
                </div>
            </div>
            <div className="bg-accent/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <CurrentDateTime />
                    <div className="hidden sm:block">
                        <Image src="https://placehold.co/400x100.png" alt="Ad Banner" width={400} height={100} data-ai-hint="game banner"/>
                    </div>
                </div>
            </div>
        </header>
    )
}
