
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getDaysInMonthBS, getFirstDayOfMonthBS, getNepaliMonthName, getNepaliNumber, toBS } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendar({ today }: NepaliCalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => {
        const initialDate = today ? { year: today.bsYear, month: today.bsMonth } : toBS(new Date());
        return { year: initialDate.year, month: initialDate.month };
    });
    
    const [monthData, setMonthData] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMonthData = useCallback(async (year: number, month: number) => {
        setLoading(true);
        try {
            const data = await getCalendarEvents({ year, month });
            setMonthData(data.month_events);
        } catch (error) {
            console.error(`Failed to fetch data for ${year}-${month}`, error);
            setMonthData([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchMonthData(currentDate.year, currentDate.month);
    }, [currentDate, fetchMonthData]);
    
    useEffect(() => {
        if (today) {
             setCurrentDate({ year: today.bsYear, month: today.bsMonth });
        }
    }, [today]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            let newMonth = prev.month - 1;
            let newYear = prev.year;
            if (newMonth < 1) {
                newMonth = 12;
                newYear--;
            }
            return { year: newYear, month: newMonth };
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            let newMonth = prev.month + 1;
            let newYear = prev.year;
            if (newMonth > 12) {
                newMonth = 1;
                newYear++;
            }
            return { year: newYear, month: newMonth };
        });
    };

    const firstDay = useMemo(() => getFirstDayOfMonthBS(currentDate.year, currentDate.month), [currentDate.year, currentDate.month]);
    const daysInMonth = useMemo(() => getDaysInMonthBS(currentDate.year, currentDate.month), [currentDate.year, currentDate.month]);

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="border rounded-md bg-muted/40" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const eventData = monthData.find(e => e.day === day);
        const isToday = today ? (day === today.bsDay && currentDate.month === today.bsMonth && currentDate.year === today.bsYear) : false;
        
        const cellContent = (
             <div className={cn(
                "relative flex flex-col p-1.5 border rounded-md min-h-[100px] transition-colors duration-200 group",
                eventData?.is_holiday && !isToday ? "bg-red-50 dark:bg-red-950/20" : "bg-card hover:bg-muted/50",
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
                         eventData?.is_holiday ? "text-destructive" : ""
                    )}>
                        {eventData?.gregorian_day}
                    </span>
                    <span className={cn(
                        "text-lg sm:text-xl font-bold text-foreground",
                         eventData?.is_holiday ? "text-destructive" : ""
                    )}>
                        {getNepaliNumber(day)}
                    </span>
                </div>
                <div className="flex-grow flex flex-col justify-end text-center items-center">
                     {eventData?.tithi && (
                         <p className="text-xs text-foreground truncate">{eventData.tithi}</p>
                    )}
                </div>
                 {eventData && eventData.events.length > 0 && !isToday && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                 )}
            </div>
        );
        
        const cell = (
            <div key={day}>
                {eventData ? (
                     <Popover>
                        <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-primary">{getNepaliNumber(day)} {getNepaliMonthName(currentDate.month)}</h4>
                                {eventData.tithi && <p className="text-sm text-muted-foreground font-semibold">{eventData.tithi}</p>}
                                <hr />
                                {eventData.events.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {eventData.events.map((e, i) => <li key={i} className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-accent" />{e}</li>)}
                                    </ul>
                                ): (
                                     <p className="text-sm text-muted-foreground">कुनै कार्यक्रम छैन।</p>
                                )}
                                {eventData.panchanga && <p className="text-xs text-muted-foreground pt-2 border-t mt-2">{eventData.panchanga}</p>}
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    cellContent
                )}
            </div>
        );

        calendarCells.push(cell);
    }

    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={loading}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
                    {getNepaliMonthName(currentDate.month)} {getNepaliNumber(currentDate.year)}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={loading}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-muted-foreground mb-2">
                {WEEK_DAYS_NP.map(day => <div key={day} className="py-2 font-bold">{day}</div>)}
            </div>
            
            {loading ? (
                 <div className="relative grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="rounded-md bg-muted/50 animate-pulse min-h-[100px]" />
                    ))}
                     <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                        <Loader className="animate-spin text-primary h-8 w-8" />
                     </div>
                 </div>
            ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarCells}
                </div>
            )}
        </div>
    );
}
