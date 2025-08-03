
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
  const [time, setTime] = useState<Date | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Kathmandu');
        if (!response.ok) {
            throw new Error('Failed to fetch time');
        }
        const data = await response.json();
        const initialTime = new Date(data.datetime);
        setTime(initialTime);
      } catch (error) {
        console.error("Error fetching time from API, falling back to client time:", error);
        // Fallback to client time if API fails
        setTime(new Date());
      }
    };

    fetchTime();
  }, []);

  useEffect(() => {
    if (!time) return;

    const intervalId = setInterval(() => {
      setTime(prevTime => prevTime ? new Date(prevTime.getTime() + 1000) : null);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [time]);

  if (!isMounted || !today) {
    return (
      <div className="space-y-2 text-primary-foreground">
        <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
      </div>
    );
  }
  
  const todayBS = new NepaliDate(new Date(today.adYear, today.adMonth -1, today.adDay));
  const nepaliDay = todayBS.format('D', 'np');
  const nepaliYear = todayBS.format('YYYY', 'np');
  const nepaliDateStr = `${nepaliDay} ${today.bsMonthName} ${nepaliYear}, ${today.dayOfWeek}`;

  const gregorianDate = new Date(today.adYear, today.adMonth - 1, today.adDay);
  const gregorianDateStr = gregorianDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
  });
  
  let timeString = null;
  let localizedTimePrefix = '';
  let nepaliTimeString = '';

  if (time) {
      timeString = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
      const timeSuffix = timeString.slice(-2);
      localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : (timeSuffix === 'PM' ? 'बेलुकीको' : '');
      nepaliTimeString = new NepaliDate(time).format('K:mm:ss', 'np');
  }


  return (
    <div className="space-y-1 text-primary-foreground">
      <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
      {todaysEvent && <p className="text-lg">{todaysEvent}</p>}
      <p className="text-lg">{nepaliTimeString ? `${localizedTimePrefix} ${nepaliTimeString}` : "Loading..."}</p>
      <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}

