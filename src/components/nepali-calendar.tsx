"use client";

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const months = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra",
  "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

const years = Array.from({ length: 10 }, (_, i) => 2075 + i);

const daysInMonth = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
const weekDays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];

export default function NepaliCalendar() {
  const [currentDate, setCurrentDate] = useState({ year: 2082, month: 2 }); // Ashadh 2082
  const [selectedDay, setSelectedDay] = useState<number | null>(31);

  const currentMonthName = useMemo(() => nepaliMonths[currentDate.month], [currentDate.month]);
  const currentDaysInMonth = useMemo(() => daysInMonth[currentDate.month], [currentDate.month]);
  
  // Mock starting day of the week (0=Sun, 1=Mon, ...)
  const startDayOfMonth = useMemo(() => (currentDate.year + currentDate.month) % 7, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDay(null);
  };

  const calendarGrid = useMemo(() => {
    const blanks = Array(startDayOfMonth).fill(null);
    const days = Array.from({ length: currentDaysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [startDayOfMonth, currentDaysInMonth]);

  const toNepaliNumber = (num: number) => {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
  }

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </Button>
            <Select value={String(currentDate.year)} onValueChange={(value) => setCurrentDate(d => ({...d, year: Number(value)}))}>
                <SelectTrigger className="w-[100px] font-bold">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(currentDate.month)} onValueChange={(value) => setCurrentDate(d => ({...d, month: Number(value)}))}>
                <SelectTrigger className="w-[120px] font-bold">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {nepaliMonths.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
           <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="font-bold text-lg text-gray-700">
          {currentDate.year} {currentMonthName} | {new Date(currentDate.year-57, currentDate.month, 1).toLocaleString('default', { month: 'short' })} / {new Date(currentDate.year-56, currentDate.month, 1).toLocaleString('default', { month: 'short' })} {new Date(currentDate.year-57, 1, 1).getFullYear()}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map(day => (
            <div key={day} className="font-semibold text-gray-600 text-sm py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarGrid.map((day, index) => (
            <div key={index} className="flex flex-col items-center justify-start p-1 border-t border-gray-200 min-h-[80px]">
              {day ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full rounded-md transition-colors duration-200 ease-in-out",
                    day === selectedDay ? "bg-red-600 text-white" : "hover:bg-gray-100",
                    "focus:outline-none focus:ring-1 focus:ring-red-500"
                  )}
                >
                  <span className="text-lg font-bold">{toNepaliNumber(day)}</span>
                  <span className="text-xs text-gray-500">{new Date(2025, 5, 14 + day).getDate()}</span>
                  { day === 1 && <span className="text-[10px] text-red-500 truncate">अन्तर्राष्ट्रिय बुवा दिवस</span>}
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
