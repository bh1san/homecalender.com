"use client";

import { useState, useEffect } from 'react';
import { getNepaliMonthName, getNepaliDayOfWeek, getEnglishMonthName } from '@/lib/nepali-date-converter';
import { CurrentDateInfoResponse } from '@/ai/schemas';

interface CurrentDateTimeProps {
  country: string | null;
  today: CurrentDateInfoResponse | null | undefined;
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

export default function CurrentDateTime({ country, today }: CurrentDateTimeProps) {
  const [timeString, setTimeString] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [gregorianDateString, setGregorianDateString] = useState("");
  
  useEffect(() => {
    setIsMounted(true);

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
  }, [country]);


  if (!isMounted) {
      return (
         <div className="space-y-2 text-white">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      );
  }

  if (country !== "Nepal" || !today) {
      return (
        <div>
            <h1 className="text-3xl font-bold">{gregorianDateString || 'Loading date...'}</h1>
            <p className="text-sm mt-1">{timeString || '...'}</p>
        </div>
      )
  }
    
  const nepaliDateStr = `${toNepaliNumber(today.bsDay)} ${getNepaliMonthName(today.bsMonth)} ${toNepaliNumber(today.bsYear)}, ${getNepaliDayOfWeek(today.bsWeekDay)}`;
  const gregorianDateStr = `${getEnglishMonthName(today.adMonth)} ${today.adDay}, ${today.adYear}`;

  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = toNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
        <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
        {today.tithi && <p className="text-lg">तिथि: {today.tithi}</p>}
        {today.panchanga && <p className="text-lg">पञ्चाङ्ग: {today.panchanga}</p>}
        {timeString && <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>}
        <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
