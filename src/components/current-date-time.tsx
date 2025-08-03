
"use client";

import { useState, useEffect } from 'react';
import { getNepaliMonthName, getNepaliDayOfWeek, getEnglishMonthName, getNepaliNumber } from '@/lib/nepali-date-converter';
import { CurrentDateInfoResponse } from '@/ai/schemas';
import { useIsMounted } from '@/hooks/use-is-mounted';
import ADBS from '@/lib/ad-bs-converter';

interface CurrentDateTimeProps {
  today: CurrentDateInfoResponse | null | undefined;
}

interface ClientToday {
    bsYear: number;
    bsMonth: number;
    bsDate: number;
    bsDay: number;
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

    // Use the library on the client-side to get the most accurate date
    try {
        const adDate = new Date();
        const bsDate = ADBS.ad2bs(`${adDate.getFullYear()}/${adDate.getMonth() + 1}/${adDate.getDate()}`);
        setClientToday({
            bsYear: parseInt(bsDate.en.year),
            bsMonth: parseInt(bsDate.en.month) - 1, // To 0-indexed
            bsDate: parseInt(bsDate.en.day),
            bsDay: adDate.getDay(),
            adYear: adDate.getFullYear(),
            adMonth: adDate.getMonth(), // Is 0-indexed
            adDate: adDate.getDate()
        });
    } catch(e) {
        console.error("Failed to convert date", e);
    }

    return () => clearInterval(intervalId);
  }, [isMounted]);

  if (!isMounted || !clientToday) {
      return (
         <div className="space-y-2 text-white">
            <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      );
  }
    
  const nepaliDateStr = `${getNepaliNumber(clientToday.bsDate)} ${getNepaliMonthName(clientToday.bsMonth)} ${getNepaliNumber(clientToday.bsYear)}, ${getNepaliDayOfWeek(clientToday.bsDay)}`;
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
