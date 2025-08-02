
"use client";

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertDate } from '@/ai/flows/date-conversion-flow';

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

const years = Array.from({ length: 20 }, (_, i) => 2070 + i);

// Approximate days for client-side rendering, will be synced with server.
const daysInMonthBS = [30, 32, 31, 32, 31, 30, 29, 30, 29, 30, 30, 31]; 
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];

export default function NepaliCalendar() {
  const [currentDate, setCurrentDate] = useState({ year: 2081, month: 3, day: 1 }); // Shrawan 1, 2081
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [gregorianDate, setGregorianDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCurrentNepaliDate = async () => {
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
            setCurrentDate({ year: result.year, month: nepaliMonthIndex, day: result.day });
            setSelectedDay(result.day);
        }
        setGregorianDate(now);
      } catch (error) {
        console.error("Failed to fetch current Nepali date", error);
        // Fallback to a default date if API fails
        setGregorianDate(new Date());
      }
    };
    fetchCurrentNepaliDate();
  }, []);

  const currentMonthName = useMemo(() => nepaliMonths[currentDate.month], [currentDate.month]);
  const currentDaysInMonth = useMemo(() => daysInMonthBS[currentDate.month], [currentDate.month]);
  
  // Note: This is a mock starting day. Real-world Nepali calendar logic is far more complex.
  const startDayOfMonth = useMemo(() => {
      if (!gregorianDate) return 0;
      // Calculate a pseudo-start day. This is not accurate but provides a visual layout.
      const firstDayOfGregorianMonth = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), 1);
      return firstDayOfGregorianMonth.getDay();
  }, [currentDate, gregorianDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { ...prev, year: newYear, month: newMonth };
    });
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { ...prev, year: newYear, month: newMonth };
    });
    setSelectedDay(null);
  };
  
  const handleDateChange = (type: 'year' | 'month', value: string) => {
      setCurrentDate(prev => ({...prev, [type]: Number(value)}));
      setSelectedDay(null);
  }

  const calendarGrid = useMemo(() => {
    const blanks = Array(startDayOfMonth).fill(null);
    const days = Array.from({ length: currentDaysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [startDayOfMonth, currentDaysInMonth]);

  const toNepaliNumber = (num: number) => {
    if (num === null || num === undefined) return '';
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-2 gap-4">
        <div className="flex items-center space-x-1">
           <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Previous month" className="transition-transform hover:scale-110">
            <ChevronLeft className="h-5 w-5" />
          </Button>
            <Select value={String(currentDate.month)} onValueChange={(value) => handleDateChange('month', value)}>
                <SelectTrigger className="w-[120px] font-bold">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {nepaliMonths.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(currentDate.year)} onValueChange={(value) => handleDateChange('year', value)}>
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
          {toNepaliNumber(currentDate.year)} {currentMonthName}
          {gregorianDate && <div className="text-sm font-normal text-muted-foreground">{gregorianDate.toLocaleString('en-US', { month: 'long' })} / {new Date(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' })} {gregorianDate.getFullYear()}</div>}
        </div>
      </div>
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map(day => (
            <div key={day} className="font-semibold text-gray-600 text-sm py-2">{day.substring(0,3)}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarGrid.map((day, index) => (
            <div key={index} className="flex flex-col items-center justify-start p-1 border-t border-gray-200 min-h-[80px]">
              {day ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full rounded-md transition-all duration-300 ease-in-out transform hover:scale-105",
                    day === selectedDay ? "bg-red-600 text-white shadow-lg" : "hover:bg-gray-100",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  )}
                >
                  <span className="text-lg font-bold">{toNepaliNumber(day)}</span>
                  {gregorianDate && <span className="text-xs text-gray-500">{new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), day - currentDate.day + gregorianDate.getDate()).getDate()}</span>}
                  { day === 1 && <span className="text-[10px] text-red-500 truncate">बुवा दिवस</span>}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
