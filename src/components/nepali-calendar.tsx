
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertDate } from '@/ai/flows/date-conversion-flow';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent, DateConversionOutput } from '@/ai/schemas';

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

const years = Array.from({ length: 20 }, (_, i) => 2070 + i);

const daysInMonthBS = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 31]; 
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];

type CalendarData = {
  currentDate: { year: number; month: number; day: number };
  gregorianDate: Date;
  monthEvents: CalendarEvent[];
}

export default function NepaliCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [displayDate, setDisplayDate] = useState<{ year: number; month: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(0);

  const fetchMonthData = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      // month is 0-indexed in the component, but 1-indexed for the API
      const eventsPromise = getCalendarEvents({ year, month: month + 1 });
      
      // Approximating the start day of the week for a better placeholder
      // A more accurate method would require a BS to AD conversion for the 1st of the month.
      const approxStartDate = new Date(year - 57, month, 1);
      const firstDayPromise = convertDate({ source: 'bs_to_ad', year: year, month: month + 1, day: 1 }).then(res => {
         // Fallback to approximation if AI fails
         return res ? new Date(res.year, nepaliMonths.indexOf(res.month), res.day).getDay() : approxStartDate.getDay();
      }).catch(() => approxStartDate.getDay());

      const [monthEvents, firstDay] = await Promise.all([eventsPromise, firstDayPromise]);
      
      setCalendarData(prevData => ({...(prevData as CalendarData), monthEvents: monthEvents.month_events}));
      setFirstDayOfMonth(firstDay);
      setDisplayDate({ year, month });

    } catch (error) {
      console.error("Failed to fetch month data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    const initializeCalendar = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const bsDate: DateConversionOutput = await convertDate({
          source: 'ad_to_bs',
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate()
        });

        const nepaliMonthIndex = nepaliMonths.indexOf(bsDate.month);

        if (nepaliMonthIndex !== -1) {
          const today = { year: bsDate.year, month: nepaliMonthIndex, day: bsDate.day };
          
          setCalendarData({
            currentDate: today,
            gregorianDate: now,
            monthEvents: [],
          });
          setSelectedDay(today.day);
          await fetchMonthData(today.year, today.month);
        }
      } catch (error) {
        console.error("Failed to initialize calendar", error);
        setIsLoading(false);
      }
    };
    initializeCalendar();
  }, [fetchMonthData]);

  const changeDisplayedMonth = useCallback(async (year: number, month: number) => {
      if (!calendarData) return;
      setSelectedDay(null);
      await fetchMonthData(year, month);
  }, [calendarData, fetchMonthData]);
  
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
    if (!displayDate || !calendarData) return [];
    
    const daysInMonth = calendarData.monthEvents.length > 0 ? calendarData.monthEvents.length : daysInMonthBS[displayDate.month];
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [calendarData, displayDate, firstDayOfMonth]);

  const toNepaliNumber = (num: number) => {
    if (num === null || num === undefined) return '';
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
  }

  const initialLoading = isLoading && !calendarData;

  if (initialLoading) {
    return (
        <div className="w-full flex items-center justify-center p-8">
            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading Calendar...</span>
        </div>
    );
  }
  
  if (!displayDate || !calendarData) {
     return (
        <div className="w-full flex items-center justify-center p-8">
            <span className="ml-2 text-red-500">Could not load calendar data.</span>
        </div>
    );
  }

  const { currentDate, gregorianDate, monthEvents } = calendarData;
  const getEventForDay = (day: number) => monthEvents.find(e => e.day === day);
  const currentMonthName = nepaliMonths[displayDate.month];

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
          <div className="text-sm font-normal text-muted-foreground">{gregorianDate.toLocaleString('en-US', { month: 'long' })} / {new Date(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, 0).toLocaleString('en-US', { month: 'long' })} {gregorianDate.getFullYear()}</div>
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
                if (!day) return <div key={index} className="bg-white"></div>;

                const eventInfo = getEventForDay(day);
                const isToday = day === currentDate.day && displayDate.month === currentDate.month && displayDate.year === currentDate.year;
                const isHoliday = eventInfo?.is_holiday || weekDays[index % 7] === 'शनिवार';
                
                const approxGregorianDay = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), day - currentDate.day + gregorianDate.getDate()).getDate();

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
                        <span className={cn(
                            "text-xl font-bold w-full text-center",
                            isHoliday && "text-red-600",
                            isToday && "bg-primary text-white rounded-full p-1"
                        )}>
                            {toNepaliNumber(day)}
                        </span>
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
