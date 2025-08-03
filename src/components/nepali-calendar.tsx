
"use client";

import { useState, useEffect } from 'react';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { getNepaliMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { adToBs, bsToAd, getMonthDays } from '@/lib/ad-bs-converter';
import { useToast } from '@/hooks/use-toast';

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null | undefined;
    monthEvents: CalendarEvent[] | null | undefined;
    isLoading: boolean;
}

interface CalendarDate {
    bsYear: number;
    bsMonth: number;
    bsDay: number;
    adYear: number;
    adMonth: number;
    adDay: number;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

export default function NepaliCalendarComponent({ monthEvents, isLoading: initialIsLoading }: NepaliCalendarProps) {
    const isMounted = useIsMounted();
    const { toast } = useToast();
    // Start with a fixed default date on the server
    const [currentBS, setCurrentBS] = useState({ year: 2081, month: 4 });
    const [calendarData, setCalendarData] = useState<(CalendarDate | null)[]>([]);
    const [clientToday, setClientToday] = useState<{ year: number, month: number, day: number} | null>(null);

    useEffect(() => {
        // Only run this effect on the client after mounting
        if (isMounted) {
            try {
                const today = new Date();
                const todayBS = adToBs(today.getFullYear(), today.getMonth() + 1, today.getDate());
                // Set the current view to today's month and store today's date
                setCurrentBS({ year: todayBS.year, month: todayBS.month });
                setClientToday({ year: todayBS.year, month: todayBS.month, day: todayBS.day });
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
                toast({ variant: "destructive", title: "Date Error", description: errorMessage });
                console.error("Failed to initialize calendar to today's date", e);
            }
        }
    }, [isMounted, toast]);

    useEffect(() => {
        // This effect regenerates the calendar grid whenever currentBS changes.
        // It's safe to run on both server and client, as it depends on state.
        try {
            const { year, month } = currentBS;
            
            const firstDayAd = bsToAd(year, month, 1);
            const firstDayOfWeek = new Date(firstDayAd.year, firstDayAd.month - 1, firstDayAd.day).getDay();
            const daysInMonth = getMonthDays(year, month);

            const cells: (CalendarDate | null)[] = Array(firstDayOfWeek).fill(null);

            for (let day = 1; day <= daysInMonth; day++) {
                const adDate = bsToAd(year, month, day);
                cells.push({
                    bsYear: year,
                    bsMonth: month,
                    bsDay: day,
                    adYear: adDate.year,
                    adMonth: adDate.month,
                    adDay: adDate.day,
                });
            }
            setCalendarData(cells);

        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
            toast({ variant: "destructive", title: "Calendar Error", description: errorMessage });
            console.error("Error generating calendar data", e);
        }

    }, [currentBS, toast]);

    const handlePrevMonth = () => {
        setCurrentBS(prev => {
            const newMonth = prev.month === 1 ? 12 : prev.month - 1;
            const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
            return { year: newYear, month: newMonth };
        });
    };

    const handleNextMonth = () => {
        setCurrentBS(prev => {
            const newMonth = prev.month === 12 ? 1 : prev.month + 1;
            const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
            return { year: newYear, month: newMonth };
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
        
        // clientToday is only set on the client, so this is safe.
        const isToday = clientToday && clientToday.year === bsYear && clientToday.month === bsMonth && clientToday.day === bsDay;
        
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
                        {getNepaliNumber(bsDay)}
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
                                <h4 className="font-bold text-lg text-primary">{getNepaliNumber(bsDay)} {getNepaliMonthName(bsMonth)}</h4>
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
                    {getNepaliMonthName(currentBS.month)} {getNepaliNumber(currentBS.year)}
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
