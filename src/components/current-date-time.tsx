
"use client";

import { useState, useEffect } from 'react';

export default function CurrentDateTime() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
        <h1 className="text-3xl font-bold">३१ असार २०८२, मंगलवार</h1>
        <p className="text-sm">साउन कृष्ण पञ्चमी</p>
        <p className="text-sm">पञ्चाङ्गः सौभाग्य कौलव शतभिषा</p>
        <p className="text-sm">बिहानको {timeString}</p>
        <p className="text-sm mt-1">{dateString}</p>
    </div>
  );
}
