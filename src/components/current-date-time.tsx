
"use client";

import { useState, useEffect } from 'react';
import { toBS, toAD, getNepaliMonthName, getNepaliDayOfWeek } from '@/lib/nepali-date-converter';
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

  const countryToTimezone = (countryName: string | null): string => {
      if (!countryName) return 'Asia/Kathmandu';
      const map: { [key: string]: string } = {
          'United States': 'America/New_York', 'United Kingdom': 'Europe/London', 'India': 'Asia/Kolkata', 'Australia': 'Australia/Sydney', 'Canada': 'America/Toronto', 'Japan': 'Asia/Tokyo', 'China': 'Asia/Shanghai', 'Germany': 'Europe/Berlin', 'France': 'Europe/Paris', 'Brazil': 'America/Sao_Paulo', 'South Africa': 'Africa/Johannesburg', 'Nigeria': 'Africa/Lagos', 'Egypt': 'Africa/Cairo', 'Russia': 'Europe/Moscow', 'United Arab Emirates': 'Asia/Dubai', 'Saudi Arabia': 'Asia/Riyadh', 'Argentina': 'America/Argentina/Buenos_Aires', 'Bahrain': 'Asia/Bahrain', 'Bangladesh': 'Asia/Dhaka', 'Indonesia': 'Asia/Jakarta', 'Italy': 'Europe/Rome', 'Kuwait': 'Asia/Kuwait', 'Mexico': 'America/Mexico_City', 'Netherlands': 'Europe/Amsterdam', 'Oman': 'Asia/Muscat', 'Pakistan': 'Asia/Karachi', 'Philippines': 'Asia/Manila', 'Qatar': 'Asia/Qatar', 'South Korea': 'Asia/Seoul', 'Spain': 'Europe/Madrid', 'Thailand': 'Asia/Bangkok', 'Turkey': 'Europe/Istanbul', 'Vietnam': 'Asia/Ho_Chi_Minh', 'Nepal': 'Asia/Kathmandu'
      };
      return map[countryName] || 'Etc/UTC';
  }

  const fetchDateAndTime = async () => {
    setLoading(true);
    try {
        const timezone = countryToTimezone(country);
        // Using a reliable public API to get timezone-accurate date, as client-side date can be unreliable.
        const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
        if (!response.ok) {
            throw new Error('Failed to fetch time data');
        }
        const data = await response.json();
        const now = new Date(data.utc_datetime);

        const isNepal = country === 'Nepal' || country === null;

        if (isNepal) {
            const bsDate = toBS(now);
            const gregorianDateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

            const monthEventsData = await getCalendarEvents({ year: bsDate.year, month: bsDate.month });
            const dayEvent = monthEventsData.month_events.find(e => e.day === bsDate.day) || null;
            
            setDateTime({ timeString, gregorianDateString, nepaliDate: bsDate, dayEvent });

        } else {
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
        // Fallback to local client time on error, though it may be inaccurate.
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
    // No need for interval since we are displaying a static date
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
        {dayEvent?.tithi && <p className="text-lg">{dayEvent.tithi}</p>}
        {dayEvent?.panchanga && <p className="text-lg">पञ्चाङ्ग: {dayEvent.panchanga}</p>}
        <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>
        <p className="text-base">{gregorianDateString}</p>
    </div>
  );
}
