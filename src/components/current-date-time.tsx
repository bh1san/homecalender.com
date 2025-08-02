
"use client";

import { useState, useEffect } from 'react';
import { toBS, getNepaliMonthName, getNepaliDayOfWeek } from '@/lib/nepali-date-converter';
import { getCalendarEvents } from '@/ai/flows/calendar-events-flow';
import { CalendarEvent } from '@/ai/schemas';

interface CurrentDateTimeProps {
  country: string | null;
}

const toNepaliNumber = (num: number | string) => {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(char => {
        if (!isNaN(parseInt(char))) {
            return nepaliDigits[parseInt(char)];
        }
        return char;
    }).join("");
}

interface NepaliDate {
    year: number;
    month: number;
    day: number;
    weekDay: number;
}

interface DateTimeInfo {
    timeString: string;
    gregorianDateString: string;
    nepaliDate: NepaliDate;
    dayEvent: CalendarEvent | null;
}

export default function CurrentDateTime({ country }: CurrentDateTimeProps) {
  const [dateTime, setDateTime] = useState<DateTimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDateAndTime = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const isNepal = country === 'Nepal' || country === null;

      if (isNepal) {
        // For Nepal, we always get the Nepal time and detailed events.
        const nepaliTimeZone = 'Asia/Kathmandu';
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: nepaliTimeZone });
        
        // We need the accurate date in Nepal to fetch correct events.
        const dateInNepal = new Date(now.toLocaleString('en-US', { timeZone: nepaliTimeZone }));
        
        const gregorianDateString = dateInNepal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const bsDate = toBS(dateInNepal);

        const monthEventsData = await getCalendarEvents({ year: bsDate.year, month: bsDate.month });
        const dayEvent = monthEventsData.month_events.find(e => e.day === bsDate.day) || null;
        
        setDateTime({ timeString, gregorianDateString, nepaliDate: bsDate, dayEvent });

      } else {
        // For other countries, just format the local time.
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const gregorianDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setDateTime({ 
            timeString: timeString, 
            gregorianDateString: gregorianDateString, 
            nepaliDate: toBS(new Date()), // Keep nepali date as a fallback, won't be displayed
            dayEvent: null 
        });
      }

    } catch (error) {
        console.error("Failed to fetch date and time", error);
        // Fallback to local client time on error.
        const localNow = new Date();
        const bsDate = toBS(localNow);
        const localTimeString = localNow.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const localGregorianDateString = localNow.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setDateTime({ timeString: localTimeString, gregorianDateString: localGregorianDateString, nepaliDate: bsDate, dayEvent: null });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted) return;
    
    fetchDateAndTime();
    const intervalId = setInterval(fetchDateAndTime, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [country, isMounted]);

  if (loading || !dateTime) {
    return (
        <div className="space-y-2">
            <div className="h-9 w-64 bg-black/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-black/20 animate-pulse rounded-md" />
            <div className="h-5 w-56 bg-black/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-black/20 animate-pulse rounded-md" />
            <div className="h-5 w-40 bg-black/20 animate-pulse rounded-md" />
        </div>
    );
  }

  const { timeString, gregorianDateString, nepaliDate, dayEvent } = dateTime;
  const isNepal = country === 'Nepal' || country === null;

  if (!isNepal) {
      return (
        <div>
            <h1 className="text-3xl font-bold">{gregorianDateString}</h1>
            <p className="text-sm mt-1">{timeString}</p>
        </div>
      )
  }

  const nepaliDateString = `${toNepaliNumber(nepaliDate.day)} ${getNepaliMonthName(nepaliDate.month)} ${toNepaliNumber(nepaliDate.year)}, ${getNepaliDayOfWeek(nepaliDate.weekDay)}`;
    
  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = toNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1">
        <h1 className="text-3xl font-bold">{nepaliDateString}</h1>
        {dayEvent?.tithi && <p className="text-lg">तिथि: {dayEvent.tithi}</p>}
        {dayEvent?.panchanga && <p className="text-lg">पञ्चाङ्ग: {dayEvent.panchanga}</p>}
        <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>
        <p className="text-base">{gregorianDateString}</p>
    </div>
  );
}
