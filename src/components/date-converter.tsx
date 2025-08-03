
"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FlagLoader from "./flag-loader";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useToast } from "@/hooks/use-toast";
import { getNepaliMonthName, getEnglishMonthName } from "@/lib/nepali-date-converter";
import { adToBs, bsToAd } from "@/lib/ad-bs-converter";

const nepaliMonths = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra",
  "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const gregorianMonths = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function DateConverter() {
  const { toast } = useToast();
  const isMounted = useIsMounted();

  const [gregorianDate, setGregorianDate] = useState({ year: "", month: "", day: "" });
  const [nepaliResult, setNepaliResult] = useState<string | null>(null);
  const [isConvertingAD, setIsConvertingAD] = useState(false);

  const [nepaliDate, setNepaliDate] = useState({ year: "", month: "", day: "" });
  const [gregorianResult, setGregorianResult] = useState<string | null>(null);
  const [isConvertingBS, setIsConvertingBS] = useState(false);

  useEffect(() => {
    // Only set default dates after component has mounted on the client
    if (isMounted) {
      const todayAD = new Date();
      setGregorianDate({
        year: String(todayAD.getFullYear()),
        month: String(todayAD.getMonth()), // 0-indexed for select
        day: String(todayAD.getDate())
      });

      try {
        const todayBS = adToBs(todayAD.getFullYear(), todayAD.getMonth() + 1, todayAD.getDate());
        setNepaliDate({
            year: String(todayBS.year),
            month: String(todayBS.month), // 1-indexed for select
            day: String(todayBS.day)
        });
      } catch (e) {
         const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
         toast({ variant: "destructive", title: "Date Error", description: errorMessage });
         console.error("Failed to get BS date", e);
      }
    }
  }, [isMounted, toast]);

  const handleADToBS = () => {
    const { year, month, day } = gregorianDate;
    if (!year || month === "" || !day) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all Gregorian date fields." });
        return;
    }
    setIsConvertingAD(true);
    try {
        const bsDate = adToBs(parseInt(year), parseInt(month) + 1, parseInt(day));
        setNepaliResult(`${bsDate.day} ${getNepaliMonthName(bsDate.month)}, ${bsDate.year}`);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Invalid date provided.";
        toast({ variant: "destructive", title: "Conversion Error", description: errorMessage });
        setNepaliResult(null);
    } finally {
        setIsConvertingAD(false);
    }
  }

  const handleBSToAD = () => {
    const { year, month, day } = nepaliDate;
    if (!year || month === "" || !day) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all Nepali date fields." });
        return;
    }
    setIsConvertingBS(true);
    try {
        const adDate = bsToAd(parseInt(year), parseInt(month), parseInt(day));
        setGregorianResult(`${getEnglishMonthName(adDate.month - 1)} ${adDate.day}, ${adDate.year}`);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Invalid date provided.";
        toast({ variant: "destructive", title: "Conversion Error", description: errorMessage });
        setGregorianResult(null);
    } finally {
        setIsConvertingBS(false);
    }
  }

  if (!isMounted) {
    return (
        <div className="space-y-8">
            <div className="h-52 w-full animate-pulse bg-muted/50 rounded-lg" />
            <div className="relative flex justify-center my-8">
                <Separator/>
            </div>
            <div className="h-52 w-full animate-pulse bg-muted/50 rounded-lg" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline">Gregorian to Nepali</CardTitle>
          <CardDescription>Convert a date from AD to BS.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gregorian-year">Year (AD)</Label>
            <Input id="gregorian-year" type="number" placeholder="e.g., 2024" value={gregorianDate.year} onChange={(e) => setGregorianDate({...gregorianDate, year: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gregorian-month">Month</Label>
             <Select value={gregorianDate.month} onValueChange={(value) => setGregorianDate({...gregorianDate, month: value})}>
                <SelectTrigger id="gregorian-month"><SelectValue placeholder="Select month..." /></SelectTrigger>
                <SelectContent>
                  {gregorianMonths.map((month, index) => (
                    <SelectItem key={month} value={String(index)}>{month}</SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gregorian-day">Day</Label>
            <Input id="gregorian-day" type="number" placeholder="e.g., 27" value={gregorianDate.day} onChange={(e) => setGregorianDate({...gregorianDate, day: e.target.value})} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleADToBS} disabled={isConvertingAD}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
             {isConvertingAD ? "Converting..." : "Convert to Nepali"}
          </Button>
          {isConvertingAD && <FlagLoader />}
          {nepaliResult && (
            <div className="rounded-md bg-accent/20 p-3 text-center font-medium text-primary">
              <p>Nepali Date: <span className="font-bold">{nepaliResult}</span></p>
            </div>
          )}
        </CardFooter>
      </Card>

      <div className="relative flex justify-center">
        <Separator className="absolute inset-x-0 top-1/2" />
        <div className="relative z-10 rounded-full bg-background p-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline">Nepali to Gregorian</CardTitle>
          <CardDescription>Convert a date from BS to AD.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nepali-year">Year (BS)</Label>
            <Input id="nepali-year" type="number" placeholder="e.g., 2081" value={nepaliDate.year} onChange={(e) => setNepaliDate({...nepaliDate, year: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nepali-month">Month</Label>
             <Select value={nepaliDate.month} onValueChange={(value) => setNepaliDate({...nepaliDate, month: value})}>
                <SelectTrigger id="nepali-month"><SelectValue placeholder="Select month..." /></SelectTrigger>
                <SelectContent>
                  {nepaliMonths.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>{month}</SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nepali-day">Day</Label>
            <Input id="nepali-day" type="number" placeholder="e.g., 15" value={nepaliDate.day} onChange={(e) => setNepaliDate({...nepaliDate, day: e.target.value})} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleBSToAD} disabled={isConvertingBS}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {isConvertingBS ? "Converting..." : "Convert to Gregorian"}
          </Button>
          {isConvertingBS && <FlagLoader />}
          {gregorianResult && (
            <div className="rounded-md bg-accent/20 p-3 text-center font-medium text-primary">
               <p>Gregorian Date: <span className="font-bold">{gregorianResult}</span></p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
