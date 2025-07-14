"use client";

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const months = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra",
  "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const daysInMonth = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NepaliCalendar() {
  const [currentDate, setCurrentDate] = useState({ year: 2081, month: 1 }); // Jestha 2081
  const [selectedDay, setSelectedDay] = useState<number | null>(15);

  const currentMonthName = useMemo(() => months[currentDate.month], [currentDate.month]);
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl text-primary">
          {currentMonthName} {currentDate.year}
        </CardTitle>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map(day => (
            <div key={day} className="font-medium text-muted-foreground">{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-center">
          {calendarGrid.map((day, index) => (
            <div key={index} className="flex items-center justify-center">
              {day ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-in-out",
                    day === selectedDay ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                >
                  {day}
                </button>
              ) : (
                <div className="h-10 w-10" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
