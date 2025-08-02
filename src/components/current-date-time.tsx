
"use client";

import { useState, useEffect } from 'react';
import { getNepaliMonthName, getNepaliDayOfWeek, getEnglishMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { CurrentDateInfoResponse } from '@/ai/schemas';
import { useIsMounted } from '@/hooks/use-is-mounted';
import NepaliCalendar from 'nepali-calendar-js';

interface CurrentDateTimeProps {
  today: CurrentDateInfoResponse | null | undefined;
}

export default function CurrentDateTime({ today }: CurrentDateTimeProps) {
  const [timeString, setTimeString] = useState("");
  const [clientToday, setClientToday] = useState<CurrentDateInfoResponse | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    // This effect runs only on the client, ensuring no hydration mismatch.
    const intervalId = setInterval(() => {
      const timezone = "Asia/Kathmandu";
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: timezone });
      setTimeString(timeStr);
    }, 1000);

    // Use the library on the client-side to get the most accurate date
    try {
        const cal = new NepaliCalendar(); // Instantiate only on client
        const bsDate = cal.toBS(new Date());
        
        setClientToday({
            bsYear: bsDate.bs_year,
            bsMonth: bsDate.bs_month,
            bsDay: bsDate.bs_date,
            bsWeekDay: bsDate.bs_day_of_week - 1, // Theirs is 1-7 (Sun-Sat), we use 0-6
            adYear: bsDate.ad_year,
            adMonth: bsDate.ad_month - 1, // Theirs is 1-12, we use 0-11
            adDay: bsDate.ad_date,
            day: bsDate.bs_date,
            tithi: today?.tithi ?? 'N/A', // Keep tithi from server if available
            events: today?.events ?? [],
            is_holiday: today?.is_holiday ?? false,
            panchanga: today?.panchanga ?? '',
        });
    } catch(e) {
        console.error("Failed to init nepali-calendar-js", e);
        setClientToday(today ?? null); // Fallback to server-passed data
    }


    return () => clearInterval(intervalId);
  }, [today]);

  const displayDate = clientToday || today;

  if (!isMounted || !displayDate) {
      return (
         <div className="space-y-2 text-white">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      );
  }
    
  const nepaliDateStr = `${getNepaliNumber(displayDate.bsDay)} ${getNepaliMonthName(displayDate.bsMonth)} ${getNepaliNumber(displayDate.bsYear)}, ${getNepaliDayOfWeek(displayDate.bsWeekDay)}`;
  const gregorianDateStr = `${getEnglishMonthName(displayDate.adMonth)} ${displayDate.adDay}, ${displayDate.adYear}`;

  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = getNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
        <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
        {displayDate.tithi && displayDate.tithi !== 'N/A' && <p className="text-lg">तिथि: {displayDate.tithi}</p>}
        {displayDate.panchanga && <p className="text-lg">पञ्चाङ्ग: {displayDate.panchanga}</p>}
        {timeString && <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>}
        <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
