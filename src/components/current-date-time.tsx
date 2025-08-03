
"use client";

import { useState, useEffect } from 'react';
import { getNepaliMonthName, getNepaliDayOfWeek, getEnglishMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { CurrentDateInfoResponse } from '@/ai/schemas';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { adToBs } from '@/lib/ad-bs-converter';

interface CurrentDateTimeProps {
  today: CurrentDateInfoResponse | null | undefined;
}

interface ClientToday {
    bsYear: number;
    bsMonth: number;
    bsDate: number;
    weekDay: number;
    adYear: number;
    adMonth: number;
    adDate: number;
}


export default function CurrentDateTime({ today }: CurrentDateTimeProps) {
  const [timeString, setTimeString] = useState("");
  const [clientToday, setClientToday] = useState<ClientToday | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;

    const intervalId = setInterval(() => {
      const timezone = "Asia/Kathmandu";
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: timezone });
      setTimeString(timeStr);
    }, 1000);

    try {
        const now = new Date();
        const bsDate = adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate());
        setClientToday({
            bsYear: bsDate.year,
            bsMonth: bsDate.month, 
            bsDate: bsDate.day,
            weekDay: now.getDay(),
            adYear: now.getFullYear(),
            adMonth: now.getMonth(), 
            adDate: now.getDate()
        });
    } catch(e) {
        console.error("Failed to convert date", e);
    }

    return () => clearInterval(intervalId);
  }, [isMounted]);

  if (!isMounted || !clientToday) {
      return (
         <div className="space-y-2 text-primary-foreground">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      );
  }
    
  const nepaliDateStr = `${getNepaliNumber(clientToday.bsDate)} ${getNepaliMonthName(clientToday.bsMonth)} ${getNepaliNumber(clientToday.bsYear)}, ${getNepaliDayOfWeek(clientToday.weekDay)}`;
  const gregorianDateStr = `${getEnglishMonthName(clientToday.adMonth)} ${clientToday.adDate}, ${clientToday.adYear}`;

  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = timeString ? getNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`) : "";
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
        <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
        {today?.tithi && today.tithi !== 'N/A' && <p className="text-lg">तिथि: {today.tithi}</p>}
        {today?.panchanga && <p className="text-lg">पञ्चाङ्ग: {today.panchanga}</p>}
        {timeString && <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>}
        <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
