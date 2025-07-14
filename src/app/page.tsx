import { ArrowRightLeft, CalendarDays, PartyPopper, Search, Gift, History, Heart, User } from "lucide-react";
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

const newsItems = [
    { title: "ओखलढुङ्गाको मानेभन्ज्याङ क्षेत्रमा भारी", image: "https://placehold.co/150x100.png", hint: "building news" },
    { title: "पाकिस्तानमा मनसुनको प्रकोप : १९१ जनाको मृत्यु", image: "https://placehold.co/150x100.png", hint: "flood disaster" },
    { title: "दोस्रो बुढासुब्बा कप को उपाधि भिजन स्पोर्टस", image: "https://placehold.co/150x100.png", hint: "soccer goal" },
    { title: "पछिल्लो २४ घण्टामा ७ जनामा कोरोना सङ्क्रमण", image: "https://placehold.co/150x100.png", hint: "virus molecule" },
    { title: "एक अस्ट्रेलियन जसलाई दाजुको मृत्युले इटाली", image: "https://placehold.co/150x100.png", hint: "T20 cricket" },
    { title: "तीनपटक प्लेन उठाएर आएँ, चौथोपटक चढेर", image: "https://placehold.co/150x100.png", hint: "man suit" },
    { title: "मन्त्रीको छोराले चलाएको कार दुर्घटना, एक जना", image: "https://placehold.co/150x100.png", hint: "car accident" },
    { title: "आर्मी फ्रेन्ड्ससँग ३-० ले पराजित", image: "https://placehold.co/150x100.png", hint: "soccer match" },
];

const upcomingEvents = [
    { day: "३१", month: "असार", title: "विश्व युवा दक्षता दिवस/बीतक कथा प्रारम्भ", relativeTime: "आज" },
    { day: "१", month: "साउन", title: "साउने स‌ङ्क्रान्ति/लुतो फाल्ने दिन/दक्षिणायन आरम्भ", relativeTime: "२ दिन पछि" },
]

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Nepali Calendar 2082</h2>
            <div className="relative w-full max-w-xs">
                <Input type="search" placeholder="Search events" className="pl-10"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            </div>
        </div>

        <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">समाचार बुलेटिन</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {newsItems.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden">
                        <Image src={item.image} alt={item.title} width={192} height={128} className="w-full h-32 object-cover" data-ai-hint={item.hint}/>
                        <div className="p-3">
                            <p className="text-sm font-medium text-gray-800 leading-tight">{item.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="w-full shadow-lg">
                <CardContent className="p-2 sm:p-4">
                  <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
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
          </div>

          <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">आउँदा दिनहरु</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingEvents.map(event => (
                            <div key={event.title} className="flex items-start gap-4">
                                <div className="flex-shrink-0 text-center">
                                    <div className="bg-blue-600 text-white font-bold p-2 rounded-t-md text-sm">{event.day}</div>
                                    <div className="bg-gray-200 text-gray-700 p-1 rounded-b-md text-xs">{event.month}</div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{event.title}</p>
                                    <p className="text-sm text-gray-500">{event.relativeTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start bg-white"><Gift className="mr-2 text-pink-500"/> Remit</Button>
                <Button variant="outline" className="justify-start bg-white"><History className="mr-2 text-green-500"/> Recharge</Button>
                <Button variant="outline" className="justify-start bg-white"><Heart className="mr-2 text-blue-500"/> Gifts</Button>
                <Button variant="outline" className="justify-start bg-white"><CalendarDays className="mr-2 text-red-500"/> Holidays</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">हाम्रा डाक्टरहरू</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Image src="https://placehold.co/60x60.png" alt="Dr. Babita Sharma" width={60} height={60} className="rounded-full" data-ai-hint="woman doctor"/>
                    <div>
                        <p className="font-bold text-red-600">Dr. Babita Sharma</p>
                        <p className="text-sm text-gray-600">MBBS, MD Psychiatry and Psychotherapy</p>
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
        <header className="bg-[#BA181B] text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <span className="text-2xl font-bold">#</span>
                            <span className="font-bold text-xl">HAMRO PATRO</span>
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
                        <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">EN</Button>
                        <User className="h-6 w-6"/>
                    </div>
                </div>
            </div>
            <div className="bg-[#A4161A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">३१ असार २०८२, मंगलवार</h1>
                        <p className="text-sm">साउन कृष्ण पञ्चमी</p>
                        <p className="text-sm">पञ्चाङ्गः सौभाग्य कौलव शतभिषा</p>
                        <p className="text-sm">बिहानको १२ : ३५</p>
                        <p className="text-sm mt-1">Jul 15, 2025</p>
                    </div>
                    <div className="hidden sm:block">
                        <Image src="https://placehold.co/400x100.png" alt="Ad Banner" width={400} height={100} data-ai-hint="game banner"/>
                    </div>
                </div>
            </div>
        </header>
    )
}
