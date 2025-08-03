
"use client";

import { useState, useEffect, useCallback } from 'react';
import type NepaliDateType from 'nepali-date-converter';
import { dateConfigMap } from 'nepali-date-converter';
import { CalendarEvent } from '@/ai/schemas';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { getMonthEvents } from '@/ai/flows/month-events-flow';

interface CalendarDate {
    bsYear: number;
    bsMonth: number; // 0-11
    bsDay: number;
    adYear: number;
    adMonth: number; // 0-11
    adDay: number;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendarComponent() {
    const isMounted = useIsMounted();
    const [NepaliDate, setNepaliDate] = useState<typeof import('nepali-date-converter').default | null>(null);
    const [viewDate, setViewDate] = useState<NepaliDateType | null>(null);
    const [calendarData, setCalendarData] = useState<(CalendarDate | null)[]>([]);
    const [today, setToday] = useState<NepaliDateType | null>(null);
    const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        import('nepali-date-converter').then(mod => {
            setNepaliDate(() => mod.default);
        });
    }, []);

    const fetchEventsForMonth = useCallback(async (date: NepaliDateType) => {
        setIsLoading(true);
        try {
            const events = await getMonthEvents({ year: date.getYear(), month: date.getMonth() + 1 });
            setMonthEvents(events);
        } catch (error) {
            console.error("Failed to fetch month events:", error);
            setMonthEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isMounted && NepaliDate) {
            const now = new NepaliDate();
            setToday(now);
            setViewDate(now);
            fetchEventsForMonth(now);
        }
    }, [isMounted, fetchEventsForMonth, NepaliDate]);
    
    useEffect(() => {
        if (!isMounted || !viewDate || !NepaliDate) return;
        
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

        const nepaliMonths = Object.keys(yearData);
        const monthName = nepaliMonths[month];
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

    }, [viewDate, isMounted, NepaliDate]);

    const handleMonthChange = (newDate: NepaliDateType) => {
        setViewDate(newDate);
        fetchEventsForMonth(newDate);
    };

    const handlePrevMonth = () => {
        if (!viewDate || !NepaliDate) return;
        const newDate = new NepaliDate(viewDate.toJsDate());
        newDate.setMonth(newDate.getMonth() - 1);
        handleMonthChange(newDate);
    };

    const handleNextMonth = () => {
        if (!viewDate || !NepaliDate) return;
        const newDate = new NepaliDate(viewDate.toJsDate());
        newDate.setMonth(newDate.getMonth() + 1);
        handleMonthChange(newDate);
    };
    
    const renderCalendar = () => {
        if (!NepaliDate) return null;
        if (isLoading && !monthEvents.length) {
            return (
                 <div className="relative p-0 sm:p-2 bg-card rounded-lg w-full">
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

        return (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarData.map((dayData, index) => {
                    if (!dayData) {
                        return <div key={`empty-${index}`} className="border rounded-md bg-muted/40" />;
                    }
                    
                    const { bsYear, bsMonth, bsDay, adDay } = dayData;
                    const date = new NepaliDate(bsYear, bsMonth, bsDay);
                    const isToday = today && today.getYear() === bsYear && today.getMonth() === bsMonth && today.getDate() === bsDay;
                    const dayEvent = monthEvents?.find(e => e.day === bsDay);
                    const isSaturday = date.getDay() === 6;
                    const isHoliday = dayEvent?.is_holiday || isSaturday;

                    const cellContent = (
                         <div className={cn(
                            "relative flex flex-col p-1.5 border rounded-md min-h-[120px] sm:min-h-[100px] transition-colors duration-200 group cursor-pointer",
                            isHoliday && !isToday ? "bg-red-50 dark:bg-red-950/20" : "bg-card hover:bg-muted/50",
                            isToday && "ring-2 ring-offset-background ring-primary bg-primary/10"
                        )}>
                             {isToday && (
                                <div className="absolute top-1 right-1 text-xs font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full">
                                    आज
                                </div>
                            )}
                            <div className="flex-grow">
                                <span className={cn(
                                    "text-xs sm:text-sm font-semibold text-muted-foreground",
                                     isHoliday ? "text-destructive" : ""
                                )}>
                                    {adDay}
                                </span>
                                 <div className="text-center mt-1">
                                     {dayEvent?.tithi && (
                                         <p className="text-[10px] sm:text-xs text-foreground/80 truncate font-medium">{dayEvent.tithi}</p>
                                    )}
                                     {dayEvent && dayEvent.events.length > 0 && (
                                        <p className="text-[10px] sm:text-xs text-accent/90 font-semibold text-center truncate px-1">
                                            {dayEvent.events[0]}
                                        </p>
                                     )}
                                </div>
                            </div>
                             <span className={cn(
                                "text-lg sm:text-xl font-bold text-foreground text-center",
                                 isHoliday ? "text-destructive" : ""
                            )}>
                                {new NepaliDate(bsYear, bsMonth, bsDay).format('D', 'np')}
                            </span>
                        </div>
                    );
                    
                    return (
                        <Popover key={`${bsYear}-${bsMonth}-${bsDay}`}>
                            <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                            <PopoverContent className="w-60 p-4" align="start">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-primary">{new NepaliDate(bsYear, bsMonth, bsDay).format('DD MMMM', 'np')}</h4>
                                    {dayEvent?.tithi && <p className="text-sm text-muted-foreground font-semibold">{dayEvent.tithi}</p>}
                                    <hr />
                                    {isSaturday && !dayEvent?.events.length && <li className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-accent" />शनिबार (सार्वजनिक बिदा)</li>}
                                    {dayEvent && dayEvent.events.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {dayEvent.events.map((e, i) => <li key={i} className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-accent" />{e}</li>)}
                                        </ul>
                                    ): (
                                         !isSaturday && <p className="text-sm text-muted-foreground">कुनै कार्यक्रम छैन।</p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                })}
            </div>
        )
    }

    if (!isMounted || !viewDate || !NepaliDate) {
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
    
    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={isLoading}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary relative">
                    {viewDate.format('MMMM YYYY', 'np')}
                    {isLoading && <Loader className="h-5 w-5 animate-spin absolute -right-8 top-1/2 -translate-y-1/2" />}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isLoading}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-muted-foreground mb-2">
                {WEEK_DAYS_NP.map(day => <div key={day} className="py-2 font-bold">{day}</div>)}
            </div>
            
            {renderCalendar()}
        </div>
    );
}
