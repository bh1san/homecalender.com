
"use client";

import { useState, useEffect } from 'react';
import { convertDate } from '@/ai/flows/date-conversion-flow';
import { DateConversionOutput } from '@/ai/schemas';

interface CurrentDateTimeProps {
  country: string | null;
}

const toNepaliNumber = (num: number) => {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
}

const nepaliWeekdays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];
const gregorianWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CurrentDateTime({ country }: CurrentDateTimeProps) {
  const [dateTime, setDateTime] = useState<{
      timeString: string, 
      dateString: string,
      nepaliDate: DateConversionOutput | null,
      nepaliWeekday: string,
      gregorianWeekday: string,
    } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const nepaliWeekday = nepaliWeekdays[now.getDay()];
    const gregorianWeekday = gregorianWeekdays[now.getDay()];

    const fetchDate = async () => {
        setLoading(true);
        try {
            if (country === 'Nepal') {
                const result = await convertDate({
                    source: 'ad_to_bs',
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate()
                });
                setDateTime({ timeString, dateString, nepaliDate: result, nepaliWeekday, gregorianWeekday });
            } else {
                 setDateTime({ timeString, dateString, nepaliDate: null, nepaliWeekday, gregorianWeekday });
            }
        } catch (error) {
            console.error("Failed to fetch date", error);
            setDateTime({ timeString, dateString, nepaliDate: null, nepaliWeekday, gregorianWeekday });
        } finally {
            setLoading(false);
        }
    };
    
    fetchDate();
  }, [country]);

  if (loading || !dateTime) {
    return (
        <div>
            <div className="h-9 w-64 bg-gray-300/20 animate-pulse rounded-md mb-2" />
            <div className="h-5 w-48 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-56 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-32 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-40 bg-gray-300/20 animate-pulse rounded-md mt-2" />
        </div>
    );
  }

  const { timeString, dateString, nepaliDate, nepaliWeekday } = dateTime;
  
  const isNepal = country === 'Nepal';

  const mainDateString = isNepal && nepaliDate 
    ? `${toNepaliNumber(nepaliDate.day)} ${nepaliDate.month} ${toNepaliNumber(nepaliDate.year)}, ${nepaliWeekday}` 
    : dateString;

  const secondaryLine1 = isNepal ? 'साउन कृष्ण पञ्चमी' : `Local Time`;
  const secondaryLine2 = isNepal ? 'पञ्चाङ्गः सौभाग्य कौलव शतभिषा' : ` `;


  return (
    <div>
        <h1 className="text-3xl font-bold">{mainDateString}</h1>
        <p className="text-sm">{secondaryLine1}</p>
        <p className="text-sm">{secondaryLine2}</p>
        <p className="text-sm">
            {isNepal ? `बिहानको ${timeString}` : timeString}
        </p>
        {isNepal && <p className="text-sm mt-1">{dateString}</p>}
    </div>
  );
}
