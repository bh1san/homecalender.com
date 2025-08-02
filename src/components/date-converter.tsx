"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { convertDate } from "@/ai/flows/date-conversion-flow";
import {
  DateConversionInput,
  DateConversionOutput,
} from "@/ai/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FlagLoader from "./flag-loader";

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
  
  const [gregorianDate, setGregorianDate] = useState({ year: "2024", month: "7", day: "15" });
  const [nepaliResult, setNepaliResult] = useState<DateConversionOutput | null>(null);
  const [isConvertingAD, setIsConvertingAD] = useState(false);

  const [nepaliDate, setNepaliDate] = useState({ year: "2081", month: "4", day: "1" });
  const [gregorianResult, setGregorianResult] = useState<DateConversionOutput | null>(null);
  const [isConvertingBS, setIsConvertingBS] = useState(false);

  const handleGregorianToNepali = async () => {
    if (!gregorianDate.year || !gregorianDate.month || !gregorianDate.day) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all Gregorian date fields.",
      });
      return;
    }

    setIsConvertingAD(true);
    setNepaliResult(null);
    try {
      const input: DateConversionInput = {
        source: "ad_to_bs",
        year: parseInt(gregorianDate.year),
        month: parseInt(gregorianDate.month),
        day: parseInt(gregorianDate.day),
      };
      const result = await convertDate(input);
      setNepaliResult(result);
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: "Could not convert the Gregorian date. Please try again.",
      });
    } finally {
      setIsConvertingAD(false);
    }
  };

  const handleNepaliToGregorian = async () => {
    if (!nepaliDate.year || !nepaliDate.month || !nepaliDate.day) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all Nepali date fields.",
      });
      return;
    }
    
    setIsConvertingBS(true);
    setGregorianResult(null);
    try {
      const input: DateConversionInput = {
        source: "bs_to_ad",
        year: parseInt(nepaliDate.year),
        month: parseInt(nepaliDate.month),
        day: parseInt(nepaliDate.day),
      };
      const result = await convertDate(input);
      setGregorianResult(result);
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: "Could not convert the Nepali date. Please try again.",
      });
    } finally {
      setIsConvertingBS(false);
    }
  };

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
                    <SelectItem key={month} value={String(index + 1)}>{month}</SelectItem>
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
          <Button onClick={handleGregorianToNepali} disabled={isConvertingAD}>
            {isConvertingAD ? (
              <FlagLoader />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
             Convert to Nepali
          </Button>
          {nepaliResult && (
            <div className="rounded-md bg-accent/20 p-3 text-center font-medium text-primary">
              <p>Nepali Date: <span className="font-bold">{nepaliResult.fullDate}</span></p>
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
          <Button onClick={handleNepaliToGregorian} disabled={isConvertingBS}>
            {isConvertingBS ? (
                <FlagLoader />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            Convert to Gregorian
          </Button>
          {gregorianResult && (
            <div className="rounded-md bg-accent/20 p-3 text-center font-medium text-primary">
               <p>Gregorian Date: <span className="font-bold">{gregorianResult.fullDate}</span></p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
