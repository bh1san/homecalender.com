
"use client";

import { useState, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { CurrentDateInfoResponse } from '@/ai/schemas';

interface CurrentDateTimeProps {
  today?: CurrentDateInfoResponse | null;
  todaysEvent?: string;
}

export default function CurrentDateTime({ today, todaysEvent }: CurrentDateTimeProps) {
  const [timeString, setTimeString] = useState("");
  const [nepaliTimeString, setNepaliTimeString] = useState("");
  const isMounted = useIsMounted();

  useEffect(() => {
    // This effect should only run on the client side
    const intervalId = setInterval(() => {
      const now = new Date();
      const timezone = "Asia/Kathmandu";
      const timeStr = now.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: 'numeric', 
          second: 'numeric', 
          hour12: true, 
          timeZone: timezone 
      });
      setTimeString(timeStr);

      try {
        const nepaliTime = new NepaliDate(now).format('K:mm:ss', 'np');
        setNepaliTimeString(nepaliTime);
      } catch (e) {
        // Handle potential errors from NepaliDate if any
        setNepaliTimeString("");
      }
    }, 1000);
    
    // Set initial time immediately
    const now = new Date();
    const timezone = "Asia/Kathmandu";
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: timezone });
    setTimeString(timeStr);
    try {
        const nepaliTime = new NepaliDate(now).format('K:mm:ss', 'np');
        setNepaliTimeString(nepaliTime);
    } catch (e) {
        setNepaliTimeString("");
    }

    return () => clearInterval(intervalId);
  }, []);

  if (!isMounted || !today) {
    return (
      <div className="space-y-2 text-primary-foreground">
        <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
      </div>
    );
  }

  const nepaliDay = new NepaliDate(0,0,0).convert(String(today.bsDay), 'en', 'np');
  const nepaliYear = new NepaliDate(0,0,0).convert(String(today.bsYear), 'en', 'np');
  const nepaliDateStr = `${nepaliDay} ${today.bsMonthName} ${nepaliYear}, ${today.dayOfWeek}`;

  const gregorianDate = new Date(today.adYear, today.adMonth - 1, today.adDay);
  const gregorianDateStr = gregorianDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
  });
  
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : (timeSuffix === 'PM' ? 'बेलुकीको' : '');

  return (
    <div className="space-y-1 text-primary-foreground">
      <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
      {todaysEvent && <p className="text-lg">{todaysEvent}</p>}
      <p className="text-lg">{nepaliTimeString ? `${localizedTimePrefix} ${nepaliTimeString}` : ""}</p>
      <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}

    