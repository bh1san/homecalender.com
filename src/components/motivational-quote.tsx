
"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useIsMounted } from '@/hooks/use-is-mounted';

const quotes = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Strive not to be a success, but rather to be of value.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you’ve ever wanted is on the other side of fear.",
];

export default function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [isFading, setIsFading] = useState(false);
  const isMounted = useIsMounted();

  useEffect(() => {
    // This effect runs only on the client, after hydration
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const intervalId = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        let nextQuote = currentQuote;
        while (nextQuote === currentQuote) {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          nextQuote = quotes[randomIndex];
        }
        setCurrentQuote(nextQuote);
        setIsFading(false);
      }, 1000); 
    }, 15000); 

    return () => clearInterval(intervalId);
  }, [currentQuote]); // Note: dependency on currentQuote is for the interval logic, not for initial render.

  if (!isMounted) {
    return (
        <div className="w-[400px] h-[100px] flex items-center justify-center bg-black/20 rounded-lg p-4 text-center overflow-hidden" />
    );
  }

  return (
    <div className="w-[400px] h-[100px] flex items-center justify-center bg-black/20 rounded-lg p-4 text-center overflow-hidden">
        <p className={cn(
            "text-lg italic font-medium text-white/90 transition-opacity duration-1000",
            isFading ? "opacity-0" : "opacity-100"
        )}>
            &ldquo;{currentQuote}&rdquo;
        </p>
    </div>
  );
}
