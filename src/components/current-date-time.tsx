
"use client";

import { useState, useEffect, useCallback } from 'react';
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

const countryToTimezoneMap: { [key: string]: string } = {
    "Nepal": "Asia/Kathmandu",
    "United States": "America/New_York",
    "United Kingdom": "Europe/London",
    "India": "Asia/Kolkata",
    // Add other countries as needed
};

const countryToTimezone = (country: string | null): string => {
    if (country && countryToTimezoneMap[country]) {
        return countryToTimezoneMap[country];
    }
    return "Asia/Kathmandu"; // Default
}

export default function CurrentDateTime({ country }: CurrentDateTimeProps) {
  const [dateTime, setDateTime] = useState<DateTimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDateAndTime = useCallback(async () => {
    setLoading(true);
    try {
        const effectiveCountry = country || "Nepal";
        const timezone = countryToTimezone(effectiveCountry);
        
        // Use a reliable public API for time
        const worldTimeResponse = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
        if (!worldTimeResponse.ok) {
            throw new Error(`Failed to fetch time for ${timezone}`);
        }
        const timeData = await worldTimeResponse.json();
        const now = new Date(timeData.utc_datetime);

        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: timezone });
        const gregorianDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone });
        
        let dayEvent: CalendarEvent | null = null;
        const bsDate = toBS(now);

        if (effectiveCountry === 'Nepal') {
            const monthEventsData = await getCalendarEvents({ year: bsDate.year, month: bsDate.month });
            dayEvent = monthEventsData.month_events.find(e => e.day === bsDate.day) || null;
        }

        setDateTime({ timeString, gregorianDateString, nepaliDate: bsDate, dayEvent });

    } catch (error) {
        console.error("Failed to fetch date and time", error);
        // Fallback to local client time on error, though this can cause hydration issues.
        const localNow = new Date();
        const bsDate = toBS(localNow);
        const localTimeString = localNow.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const localGregorianDateString = localNow.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setDateTime({ timeString: localTimeString, gregorianDateString: localGregorianDateString, nepaliDate: bsDate, dayEvent: null });
    } finally {
        setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    if (!isMounted) return;
    
    fetchDateAndTime();
    const intervalId = setInterval(fetchDateAndTime, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [isMounted, fetchDateAndTime]);

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
