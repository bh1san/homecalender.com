
"use client"

import { GoldSilver as GoldSilverType } from '@/ai/schemas';

interface GoldSilverProps {
    loading: boolean;
    prices?: GoldSilverType | null;
}

const PriceDisplay = ({ label, value, unit }: { label: string, value?: string, unit?: string }) => (
    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
        <span className="font-medium">{label}</span>
        {value ? (
            <div className="font-bold text-lg text-primary">
                {value}
                <span className="text-sm font-normal text-muted-foreground ml-1">per {unit}</span>
            </div>
        ) : (
            <div className="h-6 w-24 bg-muted animate-pulse rounded-md" />
        )}
    </div>
)

export default function GoldSilver({ loading, prices }: GoldSilverProps) {
    if (loading) {
         return (
            <div className="space-y-2">
                <div className="h-12 bg-muted/50 animate-pulse rounded-md" />
                <div className="h-12 bg-muted/50 animate-pulse rounded-md" />
                <div className="h-12 bg-muted/50 animate-pulse rounded-md" />
            </div>
        )
    }

    if (!prices) {
        return <p className="text-center text-muted-foreground p-4">Could not load prices.</p>;
    }

    return (
        <div className="space-y-2">
            <PriceDisplay label="Fine Gold" value={prices.fineGold.price} unit={prices.fineGold.unit} />
            <PriceDisplay label="Tejabi Gold" value={prices.tejabiGold.price} unit={prices.tejabiGold.unit} />
            <PriceDisplay label="Silver" value={prices.silver.price} unit={prices.silver.unit} />
        </div>
    )
}
