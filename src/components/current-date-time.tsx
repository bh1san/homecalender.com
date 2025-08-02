
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getNepaliMonthName, getNepaliDayOfWeek, getEnglishMonthName } from '@/lib/nepali-date-converter';
import { getCurrentDateInfo } from '@/ai/flows/calendar-events-flow';
import { CurrentDateInfoResponse } from '@/ai/schemas';

interface CurrentDateTimeProps {
  country: string | null;
  onDateLoaded?: (date: CurrentDateInfoResponse) => void;
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

export default function CurrentDateTime({ country, onDateLoaded }: CurrentDateTimeProps) {
  const [dateInfo, setDateInfo] = useState<CurrentDateInfoResponse | null>(null);
  const [timeString, setTimeString] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [gregorianDateString, setGregorianDateString] = useState("");

  const fetchDateAndTime = useCallback(async () => {
    if (country !== "Nepal") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const info = await getCurrentDateInfo();
      setDateInfo(info);
      if (onDateLoaded) {
        onDateLoaded(info);
      }
    } catch (error) {
      console.error("Failed to fetch date and time", error);
      setDateInfo(null);
    } finally {
      setLoading(false);
    }
  }, [country, onDateLoaded]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    fetchDateAndTime();

    const intervalId = setInterval(() => {
      const timezone = country === "Nepal" ? "Asia/Kathmandu" : undefined;
      const now = new Date();
      if (timezone) {
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: timezone });
        setTimeString(timeStr);
      } else {
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
        setTimeString(timeStr);
        setGregorianDateString(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isMounted, country, fetchDateAndTime]);


  if (loading && country === 'Nepal') {
    return (
        <div className="space-y-2 text-white">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-56 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-40 bg-white/20 animate-pulse rounded-md" />
        </div>
    );
  }
  
  if (!isMounted) {
      return (
         <div className="space-y-2 text-white">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      );
  }

  if (country !== "Nepal" || !dateInfo) {
      return (
        <div>
            <h1 className="text-3xl font-bold">{gregorianDateString || 'Loading date...'}</h1>
            <p className="text-sm mt-1">{timeString || '...'}</p>
        </div>
      )
  }
    
  const nepaliDateStr = `${toNepaliNumber(dateInfo.bsDay)} ${getNepaliMonthName(dateInfo.bsMonth)} ${toNepaliNumber(dateInfo.bsYear)}, ${getNepaliDayOfWeek(dateInfo.bsWeekDay)}`;
  const gregorianDateStr = `${getEnglishMonthName(dateInfo.adMonth)} ${dateInfo.adDay}, ${dateInfo.adYear}`;

  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = toNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
        <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
        {dateInfo.tithi && <p className="text-lg">तिथि: {dateInfo.tithi}</p>}
        {dateInfo.panchanga && <p className="text-lg">पञ्चाङ्ग: {dateInfo.panchanga}</p>}
        {timeString && <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>}
        <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
