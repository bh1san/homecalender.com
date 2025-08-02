
"use client";

import { useState, useEffect } from 'react';
import { convertDate } from '@/ai/flows/date-conversion-flow';
import { DateConversionOutput } from '@/ai/schemas';

interface CurrentDateTimeProps {
  country: string | null;
}

const toNepaliNumber = (num: number | string) => {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(char => {
        if (!isNaN(parseInt(char))) {
            return nepaliDigits[parseInt(char)];
        }
        return char;
    }).join("");
}

export default function CurrentDateTime({ country }: CurrentDateTimeProps) {
  const [dateTime, setDateTime] = useState<{
      timeString: string, 
      dateString: string,
      nepaliDate: DateConversionOutput | null,
    } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!country) {
      setLoading(false);
      return;
    }

    const fetchDateAndTime = async () => {
        setLoading(true);
        try {
            const tzResponse = await fetch(`https://worldtimeapi.org/api/timezone/${countryToTimezone(country)}`);
            if (!tzResponse.ok) throw new Error('Failed to fetch timezone.');
            
            const timeData = await tzResponse.json();
            const now = new Date(timeData.datetime);

            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            if (country === 'Nepal') {
                const result = await convertDate({
                    source: 'ad_to_bs',
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate()
                });
                setDateTime({ timeString, dateString, nepaliDate: result });
            } else {
                 setDateTime({ timeString, dateString, nepaliDate: null });
            }
        } catch (error) {
            console.error("Failed to fetch date and time", error);
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            setDateTime({ timeString, dateString, nepaliDate: null });
        } finally {
            setLoading(false);
        }
    };
    
    fetchDateAndTime();
  }, [country]);

  const countryToTimezone = (countryName: string) => {
      const map: { [key: string]: string } = {
          'Nepal': 'Asia/Kathmandu',
          'United States': 'America/New_York',
          'United Kingdom': 'Europe/London',
          'India': 'Asia/Kolkata',
          'Australia': 'Australia/Sydney',
          'Canada': 'America/Toronto',
          'Japan': 'Asia/Tokyo',
      };
      return map[countryName] || 'Etc/UTC';
  }


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

  const { timeString, dateString, nepaliDate } = dateTime;
  
  const isNepal = country === 'Nepal';

  const mainDateString = isNepal && nepaliDate 
    ? `${toNepaliNumber(nepaliDate.day)} ${nepaliDate.month} ${toNepaliNumber(nepaliDate.year)}, ${nepaliDate.weekday}`
    : dateString;
    
  const nepaliTimeParts = timeString.split(':');
  const nepaliTimeString = toNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1].substring(0,2)}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div>
        <h1 className="text-3xl font-bold">{mainDateString}</h1>
        {isNepal && nepaliDate && <p className="text-sm">साउन शुक्ल अष्टमी</p>}
        {isNepal && nepaliDate && <p className="text-sm">पञ्चाङ्गः शुभ बव विशाखा</p>}
        <p className="text-sm">
            {isNepal ? `${localizedTimePrefix} ${nepaliTimeString}` : timeString}
        </p>
        {isNepal && <p className="text-sm mt-1">{dateString}</p>}
    </div>
  );
}
