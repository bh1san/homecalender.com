
"use client";

import { Horoscope } from '@/ai/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';

interface RashifalProps {
    loading: boolean;
    horoscope?: Horoscope[];
}

export default function Rashifal({ loading, horoscope }: RashifalProps) {
    const [selectedRashi, setSelectedRashi] = useState<Horoscope | null>(null);

    if (loading) {
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
    
    const handleRashiChange = (title: string) => {
        const rashi = horoscope.find(r => r.title === title) || null;
        setSelectedRashi(rashi);
    };
    
    // Set a default if none is selected
    const displayRashi = selectedRashi || horoscope[0];

    return (
        <div className="space-y-3">
             <Select onValueChange={handleRashiChange} defaultValue={displayRashi.title}>
                <SelectTrigger className="w-full font-semibold">
                    <SelectValue placeholder="Select your Rashi..." />
                </SelectTrigger>
                <SelectContent>
                    {horoscope.map((rashi) => (
                        <SelectItem key={rashi.title} value={rashi.title}>
                           {rashi.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-md min-h-[100px]">
                {displayRashi.description}
            </p>
        </div>
    )
}
