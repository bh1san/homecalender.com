
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getNepaliMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useIsMounted } from '@/hooks/use-is-mounted';
import NepaliCalendarLib from 'nepali-calendar-js';

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null | undefined;
    monthEvents: CalendarEvent[] | null | undefined;
    isLoading: boolean;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendar({ today: initialToday, monthEvents: initialMonthEvents, isLoading: initialIsLoading }: NepaliCalendarProps) {
    const isMounted = useIsMounted();
    const [currentDate, setCurrentDate] = useState({ year: 0, month: 0 });
    const [monthData, setMonthData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isMounted) {
            const cal = new NepaliCalendarLib();
            const todayBS = cal.toBS(new Date());
            setCurrentDate({ year: todayBS.bs_year, month: todayBS.bs_month });
        }
    }, [isMounted]);

    useEffect(() => {
        if (currentDate.year > 0) {
            setIsLoading(true);
            try {
                const cal = new NepaliCalendarLib();
                const data = cal.getMonthData(currentDate.year, currentDate.month);
                setMonthData(data);
            } catch (e) {
                console.error("Failed to get month data", e);
                setMonthData(null);
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            let newYear = prev.year;
            let newMonth = prev.month - 1;
            if (newMonth < 1) {
                newMonth = 12;
                newYear -= 1;
            }
            return { year: newYear, month: newMonth };
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            let newYear = prev.year;
            let newMonth = prev.month + 1;
            if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            }
            return { year: newYear, month: newMonth };
        });
    };
    
    if (!isMounted || isLoading) {
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
    
    if (!monthData) {
        return (
             <div className="flex items-center justify-center min-h-[600px] bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Could not load calendar data.</p>
            </div>
        );
    }
    
    const todayBS = new NepaliCalendarLib().toBS(new Date());
    const firstDayOfWeek = monthData.first_day; // 1 for Sunday, 2 for Monday..
    const calendarCells = [];
    for (let i = 1; i < firstDayOfWeek; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="border rounded-md bg-muted/40" />);
    }

    monthData.days.forEach((dayData: any) => {
        if (!dayData) {
            calendarCells.push(<div key={`empty-day-${Math.random()}`} className="border rounded-md bg-muted/40" />);
            return;
        }

        const isToday = dayData.bs_year === todayBS.bs_year &&
                        dayData.bs_month === todayBS.bs_month &&
                        dayData.bs_date === todayBS.bs_date;
        
        // Find matching event from initial fetch if available
        const serverEvent = initialMonthEvents?.find(e => e.day === dayData.bs_date);

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
                        {dayData.ad_date}
                    </span>
                    <span className={cn(
                        "text-lg sm:text-xl font-bold text-foreground",
                         serverEvent?.is_holiday ? "text-destructive" : ""
                    )}>
                        {getNepaliNumber(dayData.bs_date)}
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
        
        const cell = (
            <div key={dayData.bs_date}>
                {serverEvent ? (
                     <Popover>
                        <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-primary">{getNepaliNumber(dayData.bs_date)} {getNepaliMonthName(dayData.bs_month)}</h4>
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

        calendarCells.push(cell);
    })


    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
                    {getNepaliMonthName(currentDate.month)} {getNepaliNumber(currentDate.year)}
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
