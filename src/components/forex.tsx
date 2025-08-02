
"use client"

import { Forex as ForexType } from '@/ai/schemas';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from 'next/image';

interface ForexProps {
    loading: boolean;
    rates?: ForexType[];
}

export default function Forex({ loading, rates }: ForexProps) {
    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between h-10 bg-muted/50 animate-pulse rounded-md" />
                ))}
            </div>
        )
    }

    if (!rates || rates.length === 0) {
        return <p className="text-center text-muted-foreground p-4">Could not load exchange rates.</p>;
    }

    return (
        <div className="overflow-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">Buy</TableHead>
                        <TableHead className="text-right">Sell</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rates.map((rate) => (
                        <TableRow key={rate.iso3}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Image src={rate.flag} alt={`${rate.name} flag`} width={24} height={18} className="object-contain" />
                                <div>
                                    <div>{rate.name}</div>
                                    <div className="text-xs text-muted-foreground">{rate.iso3}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{rate.unit}</TableCell>
                            <TableCell className="text-right">{rate.buy}</TableCell>
                            <TableCell className="text-right">{rate.sell}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
