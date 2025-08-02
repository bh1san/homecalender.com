
"use client";

import { useState, useEffect } from 'react';
import { convertDate } from '@/ai/flows/date-conversion-flow';
import { DateConversionOutput } from '@/ai/schemas';

const toNepaliNumber = (num: number) => {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(digit => nepaliDigits[parseInt(digit)]).join("");
}

const nepaliWeekdays = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];

export default function CurrentDateTime() {
  const [dateTime, setDateTime] = useState<{
      timeString: string, 
      dateString: string,
      nepaliDate: DateConversionOutput | null,
      nepaliWeekday: string,
    } | null>(null);

  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const nepaliWeekday = nepaliWeekdays[now.getDay()];

    const fetchNepaliDate = async () => {
        try {
            const result = await convertDate({
                source: 'ad_to_bs',
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            });
            setDateTime({ timeString, dateString, nepaliDate: result, nepaliWeekday });
        } catch (error) {
            console.error("Failed to fetch Nepali date", error);
            setDateTime({ timeString, dateString, nepaliDate: null, nepaliWeekday });
        }
    };
    
    fetchNepaliDate();
  }, []);

  if (!dateTime) {
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
  const nepaliDateString = nepaliDate 
    ? `${toNepaliNumber(nepaliDate.day)} ${nepaliDate.month} ${toNepaliNumber(nepaliDate.year)}, ${nepaliWeekday}` 
    : 'मिति लोड हुँदैछ...';


  return (
    <div>
        <h1 className="text-3xl font-bold">{nepaliDateString}</h1>
        <p className="text-sm">साउन कृष्ण पञ्चमी</p>
        <p className="text-sm">पञ्चाङ्गः सौभाग्य कौलव शतभिषा</p>
        <p className="text-sm">बिहानको {timeString}</p>
        <p className="text-sm mt-1">{dateString}</p>
    </div>
  );
}
