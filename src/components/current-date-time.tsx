
"use client";

import { useState, useEffect } from 'react';
import type NepaliDate from 'nepali-date-converter';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { CurrentDateInfoResponse } from '@/ai/schemas';

interface CurrentDateTimeProps {
  today?: CurrentDateInfoResponse | null;
  todaysEvent?: string;
}

export default function CurrentDateTime({ today, todaysEvent }: CurrentDateTimeProps) {
  const isMounted = useIsMounted();
  const [NepaliDate, setNepaliDate] = useState<typeof import('nepali-date-converter').default | null>(null);

  useEffect(() => {
    import('nepali-date-converter').then(mod => setNepaliDate(() => mod.default));
  }, []);

  if (!isMounted || !today || !NepaliDate) {
    return (
      <div className="space-y-2 text-primary-foreground">
        <div className="h-9 w-64 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-48 bg-white/20 animate-pulse rounded-md" />
        <div className="h-5 w-32 bg-white/20 animate-pulse rounded-md" />
      </div>
    );
  }
  
  const todayBS = new NepaliDate(new Date(today.adYear, today.adMonth -1, today.adDay));
  const nepaliDateStr = todayBS.format('dddd, MMMM D, YYYY', 'np');
  
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
      <iframe
        scrolling="no"
        frameBorder="0"
        marginWidth={0}
        marginHeight={0}
        allowTransparency={true}
        src="https://www.ashesh.com.np/linknepali-time.php?time_only=no&font_color=FFFFFF&aj_time=yes&font_size=14&line_brake=1&sec_time=no&nst=yes&api=430081p485"
        width="195"
        height="45"
        className="bg-transparent"
      ></iframe>
      <p className="text-base">{gregorianDateStr}</p>
    </div>
  );
}
