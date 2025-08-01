
"use client";

import { useState, useEffect } from 'react';

export default function CurrentDateTime() {
  const [dateTime, setDateTime] = useState<{timeString: string, dateString: string} | null>(null);

  useEffect(() => {
    const now = new Date();
    setDateTime({
        timeString: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
        dateString: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }, []);

  if (!dateTime) {
    return (
        <div>
            <div className="h-9 w-64 bg-gray-300/20 animate-pulse rounded-md" />
            <div className="h-5 w-48 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-56 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-32 bg-gray-300/20 animate-pulse rounded-md mt-1" />
            <div className="h-5 w-24 bg-gray-300/20 animate-pulse rounded-md mt-2" />
        </div>
    );
  }

  return (
    <div>
        <h1 className="text-3xl font-bold">३१ असार २०८२, मंगलवार</h1>
        <p className="text-sm">साउन कृष्ण पञ्चमी</p>
        <p className="text-sm">पञ्चाङ्गः सौभाग्य कौलव शतभिषा</p>
        <p className="text-sm">बिहानको {dateTime.timeString}</p>
        <p className="text-sm mt-1">{dateTime.dateString}</p>
    </div>
  );
}
