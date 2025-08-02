
"use client";

import { Horoscope } from '@/ai/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useIsMounted } from '@/hooks/use-is-mounted';

interface RashifalProps {
    loading: boolean;
    horoscope?: Horoscope[];
}

export default function Rashifal({ loading, horoscope }: RashifalProps) {
    const [selectedRashi, setSelectedRashi] = useState<Horoscope | null>(null);
    const isMounted = useIsMounted();

    useEffect(() => {
        // Set the default rashi on the client side to avoid hydration mismatch
        if (isMounted && horoscope && horoscope.length > 0 && !selectedRashi) {
            setSelectedRashi(horoscope[0]);
        }
    }, [isMounted, horoscope, selectedRashi]);

    if (loading || !isMounted) {
        return (
            <div className="space-y-3">
                <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md" />
                <div className="h-20 w-full bg-muted/50 animate-pulse rounded-md" />
            </div>
        )
    }

    if (!horoscope || horoscope.length === 0) {
        return <p className="text-center text-muted-foreground p-4">Could not load horoscope.</p>;
    }
    
    const handleRashiChange = (name: string) => {
        const rashi = horoscope.find(r => r.name === name) || null;
        setSelectedRashi(rashi);
    };
    
    const displayRashi = selectedRashi;

    return (
        <div className="space-y-3">
             <Select onValueChange={handleRashiChange} value={displayRashi?.name}>
                <SelectTrigger className="w-full font-semibold">
                    <SelectValue placeholder="Select your Rashi..." />
                </SelectTrigger>
                <SelectContent>
                    {horoscope.map((rashi) => (
                        <SelectItem key={rashi.name} value={rashi.name}>
                           {rashi.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {displayRashi ? (
                <p className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-md min-h-[100px]">
                    {displayRashi.text}
                </p>
            ) : (
                 <div className="h-20 w-full bg-muted/50 animate-pulse rounded-md" />
            )}
        </div>
    )
}
