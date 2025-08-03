
"use client";

import { useState, useEffect } from 'react';
import NepaliDate, { dateConfigMap } from 'nepali-date-converter';
import { CalendarEvent } from '@/ai/schemas';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useIsMounted } from '@/hooks/use-is-mounted';

interface CalendarDate {
    bsYear: number;
    bsMonth: number; // 0-11
    bsDay: number;
    adYear: number;
    adMonth: number; // 0-11
    adDay: number;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
const NEPALI_MONTHS = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

interface NepaliCalendarComponentProps {
    isLoading: boolean;
    monthEvents?: CalendarEvent[];
}

export default function NepaliCalendarComponent({ isLoading: initialIsLoading, monthEvents }: NepaliCalendarComponentProps) {
    const isMounted = useIsMounted();
    const [viewDate, setViewDate] = useState<NepaliDate>(new NepaliDate());
    const [calendarData, setCalendarData] = useState<(CalendarDate | null)[]>([]);
    const [today, setToday] = useState<NepaliDate | null>(null);

    useEffect(() => {
        if (isMounted) {
            const now = new NepaliDate();
            setToday(now);
            setViewDate(now);
        }
    }, [isMounted]);
    
    useEffect(() => {
        if (!isMounted) return;
        
        const year = viewDate.getYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new NepaliDate(year, month, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        
        const yearData = dateConfigMap[year];
        if (!yearData) {
            console.error(`Calendar data for year ${year} not found.`);
            setCalendarData([]);
            return;
        }
        const monthName = NEPALI_MONTHS[month];
        const daysInMonth = yearData[monthName as keyof typeof yearData];

        const cells: (CalendarDate | null)[] = Array(firstDayOfWeek).fill(null);

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new NepaliDate(year, month, day);
            const ad = d.toJsDate();
            cells.push({
                bsYear: year,
                bsMonth: month,
                bsDay: day,
                adYear: ad.getFullYear(),
                adMonth: ad.getMonth(),
                adDay: ad.getDate(),
            });
        }
        setCalendarData(cells);

    }, [viewDate, isMounted]);

    const handlePrevMonth = () => {
        setViewDate(prev => {
            const newDate = new NepaliDate(prev.toJsDate());
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setViewDate(prev => {
            const newDate = new NepaliDate(prev.toJsDate());
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
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
        
        const { bsYear, bsMonth, bsDay, adDay } = dayData;
        
        const isToday = today && today.getYear() === bsYear && today.getMonth() === bsMonth && today.getDate() === bsDay;
        
        const serverEvent = monthEvents?.find(e => e.day === bsDay);

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
                        {adDay}
                    </span>
                    <span className={cn(
                        "text-lg sm:text-xl font-bold text-foreground",
                         serverEvent?.is_holiday ? "text-destructive" : ""
                    )}>
                        {new NepaliDate(bsYear, bsMonth, bsDay).format('D', 'np')}
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
            <div key={`${bsYear}-${bsMonth}-${bsDay}`}>
                {serverEvent ? (
                     <Popover>
                        <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-primary">{new NepaliDate(bsYear, bsMonth, bsDay).format('DD MMMM', 'np')}</h4>
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
                    {viewDate.format('MMMM YYYY', 'np')}
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
