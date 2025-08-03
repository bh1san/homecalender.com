
"use client";

import { useState, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { CurrentDateInfoResponse } from '@/ai/schemas';

interface CurrentDateTimeProps {
  today?: CurrentDateInfoResponse | null;
}

export default function CurrentDateTime({ today }: CurrentDateTimeProps) {
  const [timeString, setTimeString] = useState("");
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const updateTime = () => {
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
      };

      updateTime();
      const intervalId = setInterval(updateTime, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isMounted]);

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
  
  const nepaliTimeString = timeString ? new NepaliDate(new Date()).format('K:mm:ss', 'np') : "";
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
      <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
      <p className="text-lg">{today.tithi}</p>
      <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>
      <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
