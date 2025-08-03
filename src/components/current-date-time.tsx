
"use client";

import { useState, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';

export default function CurrentDateTime() {
  const [timeString, setTimeString] = useState("");
  const [nepaliDate, setNepaliDate] = useState<NepaliDate | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const updateDateAndTime = () => {
        const now = new Date();
        const nd = new NepaliDate(now);
        setNepaliDate(nd);
        
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

      updateDateAndTime();
      const intervalId = setInterval(updateDateAndTime, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isMounted]);

  if (!isMounted || !nepaliDate) {
    return (
      <div className="space-y-2 text-primary-foreground">
        <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
      </div>
    );
  }

  const nepaliDateStr = nepaliDate.format('DD MMMM YYYY, ddd', 'np');
  const gregorianDateStr = nepaliDate.format('MMMM DD, YYYY', 'en');

  const nepaliTimeParts = timeString.split(/:| /);
  const nepaliTimeString = timeString ? new NepaliDate().format('K:mm', 'np') : "";
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div className="space-y-1 text-primary-foreground">
      <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
      <p className="text-lg">{`${localizedTimePrefix} ${nepaliTimeString}`}</p>
      <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
