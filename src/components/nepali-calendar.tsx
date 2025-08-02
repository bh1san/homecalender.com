
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getNepaliMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendar({ today }: NepaliCalendarProps) {
    const [currentBSDate, setCurrentBSDate] = useState({
        year: today?.bsYear || new Date().getFullYear() + 57,
        month: today?.bsMonth || new Date().getMonth() + 1,
    });
    
    const [monthData, setMonthData] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    
    const firstDayOfWeek = useMemo(() => {
        if (!monthData || monthData.length === 0) return 0; // Default to Sunday if no data
        // Find the day of the week for the 1st of the month.
        // Assuming the API returns data for the 1st day.
        const firstDayOfMonthData = monthData.find(d => d.day === 1);
        if (!firstDayOfMonthData || firstDayOfMonthData.gregorian_day === undefined) {
             // As a fallback, calculate based on today's info if it's the current month
            if (today && today.bsYear === currentBSDate.year && today.bsMonth === currentBSDate.month) {
                const dayOfWeekOfFirst = (today.bsWeekDay - (today.bsDay - 1)) % 7;
                return dayOfWeekOfFirst < 0 ? dayOfWeekOfFirst + 7 : dayOfWeekOfFirst;
            }
            return 0; // Default fallback
        }
        // This is a rough calculation and might not be perfect without a proper library
        // It relies on having the gregorian day and a known weekday
        if (today) {
             const dayOfWeekOfFirst = (today.bsWeekDay - (today.bsDay - 1)) % 7;
             return dayOfWeekOfFirst < 0 ? dayOfWeekOfFirst + 7 : dayOfWeekOfFirst;
        }
        return 0;

    }, [monthData, today, currentBSDate]);

    const fetchMonthData = useCallback(async (year: number, month: number) => {
        setLoading(true);
        try {
            const data = await getCalendarEvents({ year, month });
            if (data.month_events && data.month_events.length > 0) {
                setMonthData(data.month_events);
            } else {
                setMonthData([]);
            }
        } catch (error) {
            console.error(`Failed to fetch data for ${year}-${month}`, error);
            setMonthData([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (today) {
            const newCurrentBSDate = { year: today.bsYear, month: today.bsMonth };
            setCurrentBSDate(newCurrentBSDate);
            fetchMonthData(newCurrentBSDate.year, newCurrentBSDate.month);
        } else {
            // Fallback to a default date if today's date is not available
            fetchMonthData(currentBSDate.year, currentBSDate.month);
        }
    }, [today, fetchMonthData]);
    
    const handlePrevMonth = () => {
        setCurrentBSDate(prev => {
            const newDate = { ...prev };
            newDate.month--;
            if (newDate.month < 1) {
                newDate.month = 12;
                newDate.year--;
            }
            fetchMonthData(newDate.year, newDate.month);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentBSDate(prev => {
            const newDate = { ...prev };
            newDate.month++;
            if (newDate.month > 12) {
                newDate.month = 1;
                newDate.year++;
            }
            fetchMonthData(newDate.year, newDate.month);
            return newDate;
        });
    };

    const calendarCells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="border rounded-md bg-muted/40" />);
    }

    monthData.forEach((eventData) => {
        const isToday = today ? (eventData.day === today.bsDay && currentBSDate.month === today.bsMonth && currentBSDate.year === today.bsYear) : false;
        
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
                        {getNepaliNumber(eventData.day)}
                    </span>
                </div>
                <div className="flex-grow flex flex-col justify-end text-center items-center">
                     {eventData?.tithi && (
                         <p className="text-xs text-foreground truncate">{eventData.tithi}</p>
                    )}
                </div>
                 {eventData && eventData.events.length > 0 && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                 )}
            </div>
        );
        
        const cell = (
            <div key={eventData.day}>
                {eventData ? (
                     <Popover>
                        <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-primary">{getNepaliNumber(eventData.day)} {getNepaliMonthName(currentBSDate.month)}</h4>
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
    })


    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={loading}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
                    {getNepaliMonthName(currentBSDate.month)} {getNepaliNumber(currentBSDate.year)}
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
