
"use client";

import { useState, useEffect } from 'react';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getNepaliMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useIsMounted } from '@/hooks/use-is-mounted';
import ADBS from "@/lib/ad-bs-converter";

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null | undefined;
    monthEvents: CalendarEvent[] | null | undefined;
    isLoading: boolean;
}

interface CalendarDate {
    bsYear: number;
    bsMonth: number;
    bsDate: number;
    adYear: number;
    adMonth: number;
    adDate: number;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendarComponent({ today: initialToday, monthEvents, isLoading: initialIsLoading }: NepaliCalendarProps) {
    const isMounted = useIsMounted();
    const [currentDate, setCurrentDate] = useState(new Date()); // Represents AD date for navigation
    const [calendarData, setCalendarData] = useState<(CalendarDate | null)[]>([]);
    const [bsMonth, setBsMonth] = useState(0);
    const [bsYear, setBsYear] = useState(0);
    const [clientToday, setClientToday] = useState<{bsYear: number, bsMonth: number, bsDate: number} | null>(null);

    useEffect(() => {
        if (!isMounted) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed for calculations
        
        try {
            // Determine BS month/year for the start of the currently viewed AD month
            const firstDayOfMonthAD = new Date(year, month, 1);
            const firstDayBS = ADBS.ad2bs(`${firstDayOfMonthAD.getFullYear()}/${firstDayOfMonthAD.getMonth() + 1}/${firstDayOfMonthAD.getDate()}`);
            
            const startBsYear = parseInt(firstDayBS.en.year);
            const startBsMonth = parseInt(firstDayBS.en.month); // 1-indexed from library
            
            setBsYear(startBsYear);
            setBsMonth(startBsMonth -1); // 0-indexed for display

            const daysInBsMonth = ADBS.getBsMonthDays(startBsYear, startBsMonth);

            // Determine the day of the week the BS month starts on
            const firstDayOfBsMonthAd = ADBS.bs2ad(`${startBsYear}/${startBsMonth}/1`);
            const firstDayOfWeek = new Date(parseInt(firstDayOfBsMonthAd.en.year), parseInt(firstDayOfBsMonthAd.en.month) - 1, parseInt(firstDayOfBsMonthAd.en.day)).getDay();

            const cells: (CalendarDate | null)[] = [];
            for (let i = 0; i < firstDayOfWeek; i++) {
                cells.push(null);
            }

            for (let day = 1; day <= daysInBsMonth; day++) {
                try {
                    const adDate = ADBS.bs2ad(`${startBsYear}/${startBsMonth}/${day}`);
                    cells.push({
                        bsYear: startBsYear,
                        bsMonth: startBsMonth - 1,
                        bsDate: day,
                        adYear: parseInt(adDate.en.year),
                        adMonth: parseInt(adDate.en.month) - 1,
                        adDate: parseInt(adDate.en.day),
                    });
                } catch(e) {
                    console.error(`Could not convert BS date ${startBsYear}/${startBsMonth}/${day}`);
                    continue;
                }
            }
            setCalendarData(cells);

             // Set today's date for highlighting
            const todayAD = new Date();
            const todayBS = ADBS.ad2bs(`${todayAD.getFullYear()}/${todayAD.getMonth() + 1}/${todayAD.getDate()}`);
            setClientToday({
                bsYear: parseInt(todayBS.en.year),
                bsMonth: parseInt(todayBS.en.month) - 1,
                bsDate: parseInt(todayBS.en.day)
            });

        } catch(e) {
            console.error("Error generating calendar data", e);
        }

    }, [currentDate, isMounted]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 15));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 15));
    };
    
    if (!isMounted || initialIsLoading) {
        return (
             <div className="relative p-0 sm:p-2 bg-card rounded-lg w-full">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" disabled><ChevronLeft className="h-5 w-5" /></Button>
                    <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
                    <Button variant="outline" size="icon" disabled><ChevronRight className="h-5 w-5" /></Button>
                </div>
                 <div className="grid grid-cols-7 gap-2 min-h-[600px]">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="rounded-md bg-muted/50 animate-pulse min-h-[100px]" />
                    ))}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                    <Loader className="animate-spin text-primary h-8 w-8" />
                 </div>
             </div>
        );
    }
    
    const calendarCells = calendarData.map((dayData, index) => {
        if (!dayData) {
            return <div key={`empty-${index}`} className="border rounded-md bg-muted/40" />;
        }
        
        const isToday = clientToday &&
                        dayData.bsYear === clientToday.bsYear &&
                        dayData.bsMonth === clientToday.bsMonth &&
                        dayData.bsDate === clientToday.bsDate;
        
        const serverEvent = monthEvents?.find(e => e.day === dayData.bsDate);

        const cellContent = (
             <div className={cn(
                "relative flex flex-col p-1.5 border rounded-md min-h-[100px] transition-colors duration-200 group",
                serverEvent?.is_holiday && !isToday ? "bg-red-50 dark:bg-red-950/20" : "bg-card hover:bg-muted/50",
                isToday && "ring-2 ring-offset-background ring-primary bg-primary/10"
            )}>
                 {isToday && (
                    <div className="absolute top-1 right-1 text-xs font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full">
                        आज
                    </div>
                )}
                <div className="flex justify-between items-start">
                    <span className={cn(
                        "text-xs sm:text-sm font-semibold text-muted-foreground",
                         serverEvent?.is_holiday ? "text-destructive" : ""
                    )}>
                        {dayData.adDate}
                    </span>
                    <span className={cn(
                        "text-lg sm:text-xl font-bold text-foreground",
                         serverEvent?.is_holiday ? "text-destructive" : ""
                    )}>
                        {getNepaliNumber(dayData.bsDate)}
                    </span>
                </div>
                <div className="flex-grow flex flex-col justify-end text-center items-center">
                     {serverEvent?.tithi && (
                         <p className="text-xs text-foreground truncate">{serverEvent.tithi}</p>
                    )}
                </div>
                 {serverEvent && serverEvent.events.length > 0 && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                 )}
            </div>
        );
        
        return (
            <div key={`${dayData.bsYear}-${dayData.bsMonth}-${dayData.bsDate}`}>
                {serverEvent ? (
                     <Popover>
                        <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-primary">{getNepaliNumber(dayData.bsDate)} {getNepaliMonthName(dayData.bsMonth)}</h4>
                                {serverEvent.tithi && <p className="text-sm text-muted-foreground font-semibold">{serverEvent.tithi}</p>}
                                <hr />
                                {serverEvent.events.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {serverEvent.events.map((e, i) => <li key={i} className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-accent" />{e}</li>)}
                                    </ul>
                                ): (
                                     <p className="text-sm text-muted-foreground">कुनै कार्यक्रम छैन।</p>
                                )}
                                {serverEvent.panchanga && <p className="text-xs text-muted-foreground pt-2 border-t mt-2">{serverEvent.panchanga}</p>}
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    cellContent
                )}
            </div>
        );
    });

    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
                    {getNepaliMonthName(bsMonth)} {getNepaliNumber(bsYear)}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-muted-foreground mb-2">
                {WEEK_DAYS_NP.map(day => <div key={day} className="py-2 font-bold">{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarCells}
            </div>
        </div>
    );
}
