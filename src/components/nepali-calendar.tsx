
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Rows, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent, CurrentDateInfoResponse } from '@/ai/schemas';
import { toAD, getDaysInMonthBS, getFirstDayOfMonthBS } from '@/lib/nepali-date-converter';
import FlagLoader from './flag-loader';

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];
const years = Array.from({ length: 20 }, (_, i) => 2070 + i);
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];
const weekDaysEnglish = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const gregorianMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface NepaliCalendarProps {
    today: CurrentDateInfoResponse | null;
}

export default function NepaliCalendar({ today }: NepaliCalendarProps) {
  const [displayDate, setDisplayDate] = useState<{ year: number; month: number } | null>(null);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(0);

  const fetchMonthData = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const eventsPromise = getCalendarEvents({ year, month: month + 1 });
      const firstDayPromise = getFirstDayOfMonthBS(year, month + 1);
      
      const [monthEventsData, firstDay] = await Promise.all([eventsPromise, firstDayPromise]);
      
      setMonthEvents(monthEventsData.month_events);
      setFirstDayOfMonth(firstDay);

    } catch (error) {
      console.error("Failed to fetch month data", error);
      setMonthEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (today) {
      const initialDate = { year: today.bsYear, month: today.bsMonth - 1 };
      setDisplayDate(initialDate);
      setSelectedDay(today.bsDay);
      fetchMonthData(initialDate.year, initialDate.month);
    }
  }, [today, fetchMonthData]);

  useEffect(() => {
    if (displayDate && !today) { // if today is cleared, but we still have a display date
       fetchMonthData(displayDate.year, displayDate.month);
    }
  }, [displayDate, today, fetchMonthData]);

  const changeDisplayedMonth = (year: number, month: number) => {
      setSelectedDay(null);
      const newDisplayDate = { year, month };
      setDisplayDate(newDisplayDate);
      fetchMonthData(newDisplayDate.year, newDisplayDate.month);
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
  
  const goToToday = () => {
    if (today) {
        changeDisplayedMonth(today.bsYear, today.bsMonth - 1);
        setSelectedDay(today.bsDay);
    }
  }

  const handleDateChange = (type: 'year' | 'month', value: string) => {
      if (!displayDate) return;
      const newDisplayDate = {...displayDate, [type]: Number(value)};
      changeDisplayedMonth(newDisplayDate.year, type === 'month' ? Number(value) : newDisplayDate.month);
  }

  const calendarGrid = useMemo(() => {
    if (!displayDate) return [];
    const daysInMonth = monthEvents.length > 0 ? monthEvents.length : getDaysInMonthBS(displayDate.year, displayDate.month + 1);
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [displayDate, firstDayOfMonth, monthEvents]);

  const toNepaliNumber = (num: number | string) => {
    if (num === null || num === undefined) return '';
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(char => {
        if (!isNaN(parseInt(char))) {
            return nepaliDigits[parseInt(char)];
        }
        return char;
    }).join("");
  }

  const getGregorianMonths = (bsYear: number, bsMonth: number) => {
    const firstDayAd = toAD({ year: bsYear, month: bsMonth + 1, day: 1 });
    const lastDayAd = toAD({ year: bsYear, month: bsMonth + 1, day: getDaysInMonthBS(bsYear, bsMonth + 1) });
    
    const startMonth = gregorianMonths[firstDayAd.getMonth()];
    const endMonth = gregorianMonths[lastDayAd.getMonth()];
    
    const startYear = firstDayAd.getFullYear();
    const endYear = lastDayAd.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${startYear} / ${endMonth} ${endYear}`;
    }
    if (startMonth === endMonth) {
        return `${startMonth} ${startYear}`;
    }
    return `${startMonth}/${endMonth} ${startYear}`;
};

  const initialLoading = !displayDate;
  
  if (initialLoading) {
    return (
        <div className="w-full flex items-center justify-center p-8 min-h-[500px]">
            <FlagLoader />
            <span className="ml-2">Loading Calendar...</span>
        </div>
    );
  }
  
  const getEventForDay = (day: number) => monthEvents.find(e => e.day === day);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-2 gap-4">
        <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={goToToday} disabled={!today}>आज</Button>
             <div className="flex items-center rounded-md border">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none"><Grid className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none text-muted-foreground"><Rows className="h-4 w-4"/></Button>
            </div>
        </div>
        <div className="flex items-center space-x-1">
           <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronsLeft className="h-5 w-5" />
          </Button>
            <Select value={String(displayDate.year)} onValueChange={(value) => handleDateChange('year', value)}>
                <SelectTrigger className="w-[100px] font-bold">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{toNepaliNumber(y)}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(displayDate.month)} onValueChange={(value) => handleDateChange('month', value)}>
                <SelectTrigger className="w-[120px] font-bold">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {nepaliMonths.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
           <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="font-bold text-lg text-gray-700 text-right">
          {toNepaliNumber(displayDate.year)} {nepaliMonths[displayDate.month]}
          <div className="text-sm font-normal text-muted-foreground">{getGregorianMonths(displayDate.year, displayDate.month)}</div>
        </div>
      </div>
      <div className="relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <FlagLoader />
            </div>
        )}
        <div className={cn("animate-in fade-in duration-500", isLoading ? 'opacity-50' : 'opacity-100')}>
            <div className="grid grid-cols-7 gap-px text-center bg-gray-200 border border-gray-200">
            {weekDays.map((day, i) => (
                <div key={day} className="font-semibold text-gray-600 text-xs sm:text-sm py-2 bg-white">
                    <div>{day}</div>
                    <div className="text-muted-foreground font-normal hidden sm:block">{weekDaysEnglish[i]}</div>
                </div>
            ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border-l border-r border-b border-gray-200">
            {calendarGrid.map((day, index) => {
                if (!day) return <div key={`blank-${index}`} className="bg-gray-50"></div>;

                const eventInfo = getEventForDay(day);
                const isToday = today ? (day === today.bsDay && displayDate.month === (today.bsMonth - 1) && displayDate.year === today.bsYear) : false;
                const isHoliday = eventInfo?.is_holiday || weekDays[index % 7] === 'शनिवार';
                
                return (
                <div key={day} 
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                        "flex flex-col items-start justify-start p-1 sm:p-2 bg-white min-h-[100px] text-left cursor-pointer transition-colors hover:bg-primary/5",
                        selectedDay === day && "ring-2 ring-primary z-10 relative",
                        isToday && "bg-primary/10 font-bold",
                    )}
                >
                    <div className="flex justify-between w-full text-xs text-muted-foreground">
                        <span>{eventInfo?.tithi}</span>
                        <span>{eventInfo?.gregorian_day}</span>
                    </div>
                     <div className="flex-grow w-full text-center my-1">
                        <span className={cn(
                            "text-2xl sm:text-3xl font-bold",
                            isHoliday && "text-red-600",
                        )}>
                            {toNepaliNumber(day)}
                        </span>
                    </div>
                    <div className="text-[10px] leading-tight text-center w-full h-8 overflow-hidden text-gray-700">
                       {eventInfo?.events.map((e, i) => <div key={i} className="truncate">{e}</div>)}
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

    