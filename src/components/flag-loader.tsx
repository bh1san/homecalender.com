
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMounted } from '@/hooks/use-is-mounted';

const flags = [
  "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇮🇳", "🇳🇵", "🇨🇳", "🇯🇵", "🇩🇪", "🇫🇷",
  "🇧🇷", "🇿🇦", "🇳🇬", "🇪🇬", "🇷🇺", "🇦🇪", "🇸🇦", "🇦🇷", "🇧🇭", "🇧🇩",
  "🇮🇩", "🇮🇹", "🇰🇼", "🇲🇽", "🇳🇱", "🇴🇲", "🇵🇰", "🇵🇭", "🇶🇦", "🇰🇷",
  "🇪🇸", "🇹🇭", "🇹🇷", "🇻🇳"
];

const FlagLoader = ({ className }: { className?: string }) => {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setCurrentFlagIndex((prevIndex) => (prevIndex + 1) % flags.length);
    }, 2000); // Change flag every 2 seconds

    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("relative w-8 h-8 flex items-center justify-center font-sans", className)}>
      {flags.map((flag, index) => (
        <span
          key={flag}
          className={cn(
            "absolute text-2xl transition-opacity duration-1000",
            index === currentFlagIndex ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: index === currentFlagIndex ? '0s' : '1s' }}
        >
          {flag}
        </span>
      ))}
    </div>
  );
};

export default FlagLoader;
