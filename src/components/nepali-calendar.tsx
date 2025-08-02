
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent } from '@/ai/schemas';
import { toBS, toAD, getDaysInMonthBS, getFirstDayOfMonthBS } from '@/lib/nepali-date-converter';
import FlagLoader from './flag-loader';

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];
const years = Array.from({ length: 20 }, (_, i) => 2070 + i);
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];
const gregorianMonths = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

type NepaliDate = {
  year: number;
  month: number; // 0-indexed
  day: number;
}

type CalendarData = {
  currentDate: NepaliDate;
  monthEvents: CalendarEvent[];
}

export default function NepaliCalendar() {
  const [currentDate, setCurrentDate] = useState<NepaliDate | null>(null);
  const [displayDate, setDisplayDate] = useState<{ year: number; month: number } | null>(null);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(0);

  useEffect(() => {
    // This effect runs once on mount to determine the current Nepali date.
    const now = new Date();
    const bsDate = toBS(now);
    const today: NepaliDate = { year: bsDate.year, month: bsDate.month - 1, day: bsDate.day };
    
    setCurrentDate(today);
    setDisplayDate({ year: today.year, month: today.month });
    setSelectedDay(today.day);
  }, []);

  const fetchMonthData = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      // Month is 1-indexed for the API
      const eventsPromise = getCalendarEvents({ year, month: month + 1 });
      const firstDayPromise = getFirstDayOfMonthBS(year, month + 1);
      
      const [monthEventsData, firstDay] = await Promise.all([eventsPromise, firstDayPromise]);
      
      setMonthEvents(monthEventsData.month_events);
      setFirstDayOfMonth(firstDay);

    } catch (error) {
      console.error("Failed to fetch month data", error);
      setMonthEvents([]); // Clear events on error
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    // This effect fetches data whenever the displayDate changes.
    if (displayDate) {
      fetchMonthData(displayDate.year, displayDate.month);
    }
  }, [displayDate, fetchMonthData]);
  
  const changeDisplayedMonth = (year: number, month: number) => {
      setSelectedDay(null);
      setDisplayDate({ year, month });
  };
  
  const handlePrevMonth = () => {
    if (!displayDate) return;
    const newMonth = displayDate.month === 0 ? 11 : displayDate.month - 1;
    const newYear = displayDate.month === 0 ? displayDate.year - 1 : displayDate.year;
    changeDisplayedMonth(newYear, newMonth);
  };

  const handleNextMonth = () => {
    if (!displayDate) return;
    const newMonth = displayDate.month === 11 ? 0 : displayDate.month + 1;
    const newYear = displayDate.month === 11 ? displayDate.year + 1 : displayDate.year;
    changeDisplayedMonth(newYear, newMonth);
  };

  const handleDateChange = (type: 'year' | 'month', value: string) => {
      if (!displayDate) return;
      const newDisplayDate = {...displayDate, [type]: Number(value)};
      changeDisplayedMonth(newDisplayDate.year, newDisplayDate.month);
  }

  const calendarGrid = useMemo(() => {
    if (!displayDate) return [];
    
    const daysInMonth = getDaysInMonthBS(displayDate.year, displayDate.month + 1);
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [displayDate, firstDayOfMonth]);

  const toNepaliNumber = (num: number) => {
    if (num === null || num === undefined) return '';
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
  }

  const initialLoading = !displayDate || !currentDate;
  
  if (initialLoading) {
    return (
        <div className="w-full flex items-center justify-center p-8">
            <FlagLoader />
            <span className="ml-2">Loading Calendar...</span>
        </div>
    );
  }
  
  const getEventForDay = (day: number) => monthEvents.find(e => e.day === day);
  const currentMonthName = nepaliMonths[displayDate.month];
  const correspondingADDate = toAD({year: displayDate.year, month: displayDate.month + 1, day: 1});

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
          <div className="text-sm font-normal text-muted-foreground">{gregorianMonths[correspondingADDate.getMonth()]} / {gregorianMonths[(correspondingADDate.getMonth() + 1) % 12]} {correspondingADDate.getFullYear()}</div>
        </div>
      </div>
      <div className="relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <FlagLoader />
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
                if (!day) return <div key={index} className="bg-white"></div>;

                const eventInfo = getEventForDay(day);
                const isToday = day === currentDate.day && displayDate.month === currentDate.month && displayDate.year === currentDate.year;
                const isHoliday = eventInfo?.is_holiday || weekDays[index % 7] === 'शनिवार';
                
                const approxGregorianDay = toAD({year: displayDate.year, month: displayDate.month + 1, day}).getDate();

                return (
                <div key={index} className="flex flex-col items-start justify-start p-1 bg-white min-h-[100px] text-left">
                    <div
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                        "flex flex-col items-start justify-start w-full h-full rounded-md transition-all duration-200 cursor-pointer hover:bg-gray-100",
                         selectedDay === day && "ring-2 ring-primary",
                         isToday && "bg-primary/10",
                    )}
                    >
                        <div className="flex justify-between w-full">
                            <span className="text-xs text-gray-500">{eventInfo?.tithi?.split(' ').pop()}</span>
                            <span className="text-xs text-gray-500">{approxGregorianDay}</span>
                        </div>
                         <div className={cn("w-full text-center")}>
                            <span className={cn(
                                "text-xl font-bold ",
                                isHoliday && "text-red-600",
                                isToday ? "bg-primary text-white rounded-full px-2 py-1" : "p-1"
                            )}>
                                {toNepaliNumber(day)}
                            </span>
                        </div>
                        <div className="text-[10px] leading-tight text-center w-full mt-1 h-10 overflow-hidden">
                           {eventInfo?.events.map(e => <div key={e} className="truncate">{e}</div>)}
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
}

    