
"use client";

import NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { CurrentDateInfoResponse } from '@/ai/schemas';
import { useEffect } from 'react';

interface CurrentDateTimeProps {
  today?: CurrentDateInfoResponse | null;
  todaysEvent?: string;
}

export default function CurrentDateTime({ today, todaysEvent }: CurrentDateTimeProps) {
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      if ((window as any).time_is_widget) {
        (window as any).time_is_widget.init({Kathmandu_z423:{template:"TIME<br>SUN", sun_format:"Sunrise: srhour:srminute Sunset: sshour:ssminute<br>Day length: dlhoursh dlminutesm", coords:"27.7016900,85.3206000"}});
      }
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

  return (
    <div className="space-y-1 text-primary-foreground">
      <h1 className="text-3xl font-bold">{nepaliDateStr}</h1>
      {todaysEvent && <p className="text-lg">{todaysEvent}</p>}
      <div className="flex items-baseline gap-2">
         <span id="Kathmandu_z423" className="text-lg leading-tight"></span>
      </div>
      <p className="text-base">{gregorianDateStr}</p>
       <a href="https://time.is/Kathmandu" id="time_is_link" rel="nofollow" className="text-xs opacity-80 hover:opacity-100 hidden">
           Time in Kathmandu
        </a>
    </div>
  );
}
