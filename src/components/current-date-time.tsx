
"use client";

import { useState, useEffect } from 'react';
import { toBS, toAD, getNepaliDateParts, getNepaliNumber, getNepaliMonthName, getNepaliDayOfWeek } from '@/lib/nepali-date-converter';

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

interface NepaliDate {
    year: number;
    month: number;
    day: number;
    weekDay: number;
}

export default function CurrentDateTime({ country }: CurrentDateTimeProps) {
  const [dateTime, setDateTime] = useState<{
      timeString: string, 
      dateString: string,
      nepaliDate: NepaliDate | null,
    } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const effectiveCountry = country || 'Nepal';

    const fetchDateAndTime = async () => {
        setLoading(true);
        try {
            const timezone = countryToTimezone(effectiveCountry);
            // Use a public proxy for WorldTimeAPI to avoid CORS issues.
            const tzResponse = await fetch(`https://cors-anywhere.herokuapp.com/https://worldtimeapi.org/api/timezone/${timezone}`);
            if (!tzResponse.ok) throw new Error(`Failed to fetch timezone data for ${timezone}.`);
            
            const timeData = await tzResponse.json();
            
            const now = new Date(timeData.datetime);

            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: timezone });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone });

            if (effectiveCountry === 'Nepal') {
                const bsDate = toBS(now);
                setDateTime({ timeString, dateString, nepaliDate: bsDate });
            } else {
                 setDateTime({ timeString, dateString, nepaliDate: null });
            }
        } catch (error) {
            console.error("Failed to fetch date and time", error);
            // Fallback to local time if API fails
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
             setDateTime({ timeString, dateString, nepaliDate: null });
        } finally {
            setLoading(false);
        }
    };
    
    fetchDateAndTime();

  }, [country, isMounted]);

  const countryToTimezone = (countryName: string) => {
      const map: { [key: string]: string } = {
          'Nepal': 'Asia/Kathmandu',
          'United States': 'America/New_York',
          'United Kingdom': 'Europe/London',
          'India': 'Asia/Kolkata',
          'Australia': 'Australia/Sydney',
          'Canada': 'America/Toronto',
          'Japan': 'Asia/Tokyo',
          'China': 'Asia/Shanghai',
          'Germany': 'Europe/Berlin',
          'France': 'Europe/Paris',
          'Brazil': 'America/Sao_Paulo',
          'South Africa': 'Africa/Johannesburg',
          'Nigeria': 'Africa/Lagos',
          'Egypt': 'Africa/Cairo',
          'Russia': 'Europe/Moscow',
          'United Arab Emirates': 'Asia/Dubai',
          'Saudi Arabia': 'Asia/Riyadh',
          'Argentina': 'America/Argentina/Buenos_Aires',
          'Bahrain': 'Asia/Bahrain',
          'Bangladesh': 'Asia/Dhaka',
          'Indonesia': 'Asia/Jakarta',
          'Italy': 'Europe/Rome',
          'Kuwait': 'Asia/Kuwait',
          'Mexico': 'America/Mexico_City',
          'Netherlands': 'Europe/Amsterdam',
          'Oman': 'Asia/Muscat',
          'Pakistan': 'Asia/Karachi',
          'Philippines': 'Asia/Manila',
          'Qatar': 'Asia/Qatar',
          'South Korea': 'Asia/Seoul',
          'Spain': 'Europe/Madrid',
          'Thailand': 'Asia/Bangkok',
          'Turkey': 'Europe/Istanbul',
          'Vietnam': 'Asia/Ho_Chi_Minh',
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
  
  const isNepal = country === 'Nepal' || country === null;

  const nepaliDateString = nepaliDate 
    ? `${getNepaliDayOfWeek(nepaliDate.weekDay)} ${getNepaliMonthName(nepaliDate.month)} ${toNepaliNumber(nepaliDate.day)}, ${toNepaliNumber(nepaliDate.year)}`
    : '';
    
  const nepaliTimeParts = timeString.split(/:| /); // split by colon or space
  const nepaliTimeString = toNepaliNumber(`${nepaliTimeParts[0]}:${nepaliTimeParts[1]}`);
  const timeSuffix = timeString.slice(-2);
  const localizedTimePrefix = timeSuffix === 'AM' ? 'बिहानको' : 'बेलुकीको';

  return (
    <div>
        <h1 className="text-3xl font-bold">{isNepal ? nepaliDateString : dateString}</h1>
        {isNepal && <p className="text-sm mt-1">{dateString}</p>}

        <p className="text-sm">
            {isNepal ? `${localizedTimePrefix} ${nepaliTimeString}` : timeString}
        </p>
    </div>
  );
}

    