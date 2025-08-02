
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getDaysInMonthBS, getFirstDayOfMonthBS, getNepaliMonthName, getNepaliNumber, toBS } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendar({ today }: NepaliCalendarProps) {
    const [currentYear, setCurrentYear] = useState(today?.bsYear || new Date().getFullYear() + 57);
    const [currentMonth, setCurrentMonth] = useState(today?.bsMonth || 1);
    const [monthData, setMonthData] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMonthData = useCallback(async (year: number, month: number) => {
        setLoading(true);
        try {
            const data = await getCalendarEvents({ year, month });
            setMonthData(data.month_events);
        } catch (error) {
            console.error(`Failed to fetch data for ${year}-${month}`, error);
            setMonthData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (today) {
            setCurrentYear(today.bsYear);
            setCurrentMonth(today.bsMonth);
            fetchMonthData(today.bsYear, today.bsMonth);
        } else {
             // Fallback if today's date isn't available yet
            const fallbackDate = toBS(new Date());
            setCurrentYear(fallbackDate.year);
            setCurrentMonth(fallbackDate.month);
            fetchMonthData(fallbackDate.year, fallbackDate.month);
        }
    }, [today, fetchMonthData]);

    const handlePrevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchMonthData(newYear, newMonth);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchMonthData(newYear, newMonth);
    };

    const firstDay = getFirstDayOfMonthBS(currentYear, currentMonth);
    const daysInMonth = getDaysInMonthBS(currentYear, currentMonth);

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="border rounded-md bg-muted/40" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const eventData = monthData.find(e => e.day === day);
        const isToday = today && day === today.bsDay && currentMonth === today.bsMonth && currentYear === today.bsYear;
        
        const cell = (
             <div key={day} className={cn(
                "relative flex flex-col justify-between p-1.5 border rounded-md min-h-[100px] transition-colors duration-200",
                isToday ? "bg-primary/20 border-primary shadow-lg" : "bg-card hover:bg-muted/50",
                eventData?.is_holiday ? "bg-destructive-foreground" : ""
            )}>
                <div className="flex justify-between items-start">
                    <span className={cn(
                        "text-xs sm:text-sm font-semibold",
                        isToday ? "text-primary" : "text-muted-foreground",
                        eventData?.is_holiday ? "text-destructive" : ""
                    )}>
                        {eventData?.gregorian_day}
                    </span>
                    <span className={cn(
                        "text-lg sm:text-xl font-bold",
                         isToday ? "text-primary" : "text-foreground",
                         eventData?.is_holiday ? "text-destructive" : ""
                    )}>
                        {getNepaliNumber(day)}
                    </span>
                </div>
                <div className="flex-grow flex flex-col justify-end">
                    {eventData && (
                        <div className="text-center">
                            <p className="text-xs text-foreground truncate">{eventData.tithi}</p>
                            {eventData.events.length > 0 && (
                                <Badge 
                                    variant={eventData.is_holiday ? "destructive" : "secondary"}
                                    className="mt-1 w-full justify-center text-xs truncate"
                                >
                                    {eventData.events[0]}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );

        if (eventData && (eventData.events.length > 0 || eventData.panchanga)) {
            calendarCells.push(
                <Popover key={`popover-${day}`}>
                    <PopoverTrigger asChild>{cell}</PopoverTrigger>
                    <PopoverContent className="w-60 p-4" align="start">
                        <div className="space-y-2">
                             <h4 className="font-medium leading-none">{getNepaliNumber(day)} {getNepaliMonthName(currentMonth)}</h4>
                             <p className="text-sm text-muted-foreground">{eventData.tithi}</p>
                             <hr />
                             {eventData.events.map((e, i) => <p key={i} className="text-sm">{e}</p>)}
                             {eventData.panchanga && <p className="text-xs text-muted-foreground pt-2">{eventData.panchanga}</p>}
                        </div>
                    </PopoverContent>
                </Popover>
            );
        } else {
             calendarCells.push(cell);
        }
    }

    return (
        <div className="p-0 sm:p-2 bg-card rounded-lg w-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={loading}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
                    {getNepaliMonthName(currentMonth)} {getNepaliNumber(currentYear)}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={loading}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-muted-foreground mb-2">
                {WEEK_DAYS_NP.map(day => <div key={day}>{day}</div>)}
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
