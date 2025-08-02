
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertDate } from '@/ai/flows/date-conversion-flow';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent } from '@/ai/schemas';

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

const years = Array.from({ length: 20 }, (_, i) => 2070 + i);

// Approximate days for client-side rendering, will be synced with server.
const daysInMonthBS = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 31]; 
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];

export default function NepaliCalendar() {
  const [currentDate, setCurrentDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [gregorianDate, setGregorianDate] = useState<Date | null>(null);
  const [displayDate, setDisplayDate] = useState<{ year: number, month: number}>({ year: 2081, month: 3 });
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentNepaliDate = useCallback(async () => {
    const now = new Date();
    try {
      const result = await convertDate({
        source: 'ad_to_bs',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      });
      const nepaliMonthIndex = nepaliMonths.indexOf(result.month);
      if (nepaliMonthIndex !== -1) {
          const today = { year: result.year, month: nepaliMonthIndex, day: result.day };
          setCurrentDate(today);
          setDisplayDate({ year: today.year, month: today.month });
          setSelectedDay(today.day);
      }
      setGregorianDate(now);
    } catch (error) {
      console.error("Failed to fetch current Nepali date", error);
      setGregorianDate(new Date());
    }
  }, []);

  const fetchMonthEvents = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
        const result = await getCalendarEvents({ year, month: month + 1 });
        setMonthEvents(result.month_events);
    } catch (error) {
        console.error("Failed to fetch month events", error);
        setMonthEvents([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentNepaliDate();
  }, [fetchCurrentNepaliDate]);

  useEffect(() => {
    if (currentDate) {
        fetchMonthEvents(displayDate.year, displayDate.month);
    }
  }, [displayDate, currentDate, fetchMonthEvents]);

  const currentMonthName = useMemo(() => nepaliMonths[displayDate.month], [displayDate.month]);
  
  // This is a mock starting day. Real-world Nepali calendar logic is far more complex.
  const startDayOfMonth = useMemo(() => {
    if (!gregorianDate) return 0;
    // This calculation is a placeholder for layout.
    // A proper implementation would need a library or a robust BS date algorithm.
    const pseudoStartDate = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), 1);
    return pseudoStartDate.getDay();
  }, [displayDate.year, displayDate.month, gregorianDate]);


  const handlePrevMonth = () => {
    setDisplayDate(prev => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
    setSelectedDay(null);
  };
  
  const handleDateChange = (type: 'year' | 'month', value: string) => {
      setDisplayDate(prev => ({...prev, [type]: Number(value)}));
      setSelectedDay(null);
  }

  const calendarGrid = useMemo(() => {
    const daysInMonth = monthEvents.length > 0 ? monthEvents.length : daysInMonthBS[displayDate.month];
    const blanks = Array(startDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [startDayOfMonth, monthEvents, displayDate.month]);

  const toNepaliNumber = (num: number) => {
    if (num === null || num === undefined) return '';
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
  }

  if (!currentDate) {
    return (
        <div className="w-full flex items-center justify-center p-8">
            <div className="animate-pulse">Loading Calendar...</div>
        </div>
    );
  }

  const getEventForDay = (day: number) => {
      return monthEvents.find(e => e.day === day);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-2 gap-4">
        <div className="flex items-center space-x-1">
           <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Previous month" className="transition-transform hover:scale-110">
            <ChevronLeft className="h-5 w-5" />
          </Button>
            <Select value={String(displayDate.month)} onValueChange={(value) => handleDateChange('month', value)}>
                <SelectTrigger className="w-[120px] font-bold">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {nepaliMonths.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(displayDate.year)} onValueChange={(value) => handleDateChange('year', value)}>
                <SelectTrigger className="w-[100px] font-bold">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
           <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Next month" className="transition-transform hover:scale-110">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="font-bold text-lg text-gray-700 text-right">
          {toNepaliNumber(displayDate.year)} {currentMonthName}
          {gregorianDate && <div className="text-sm font-normal text-muted-foreground">{gregorianDate.toLocaleString('en-US', { month: 'long' })} / {new Date(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, 0).toLocaleString('en-US', { month: 'long' })} {gregorianDate.getFullYear()}</div>}
        </div>
      </div>
      <div className="relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
        )}
        <div className={cn("animate-in fade-in duration-500", isLoading ? 'opacity-50' : 'opacity-100')}>
            <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map(day => (
                <div key={day} className="font-semibold text-gray-600 text-sm py-2">{day.substring(0,3)}</div>
            ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
            {calendarGrid.map((day, index) => {
                const eventInfo = day ? getEventForDay(day) : null;
                const isToday = day === currentDate.day && displayDate.month === currentDate.month && displayDate.year === currentDate.year;
                const isHoliday = eventInfo?.is_holiday || weekDays[index % 7] === 'शनिवार';

                return (
                <div key={index} className="flex flex-col items-start justify-start p-1 bg-white min-h-[100px] text-left">
                {day ? (
                    <div
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                        "flex flex-col items-start justify-start w-full h-full rounded-md transition-all duration-200",
                        isToday && "bg-primary/20",
                    )}
                    >
                        <div className="flex justify-between w-full">
                            <span className="text-xs text-gray-500">{eventInfo?.tithi?.split(' ').pop()}</span>
                            {gregorianDate && <span className="text-xs text-gray-500">{new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), day - currentDate.day + gregorianDate.getDate()).getDate()}</span>}
                        </div>
                        <span className={cn(
                            "text-xl font-bold w-full text-center",
                            isHoliday && "text-red-600",
                            day === selectedDay && "bg-primary text-white rounded-full p-1"
                        )}>
                            {toNepaliNumber(day)}
                        </span>
                        <div className="text-[10px] leading-tight text-center w-full mt-1 h-10 overflow-hidden">
                           {eventInfo?.events.map(e => <div key={e} className="truncate">{e}</div>)}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full" />
                )}
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
}
