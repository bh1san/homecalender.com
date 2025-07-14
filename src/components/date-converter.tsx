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

export default function DateConverter() {
  const { toast } = useToast();
  const [gregorianDate, setGregorianDate] = useState({ year: "", month: "", day: "" });
  const [nepaliResult, setNepaliResult] = useState("");
  const [nepaliDate, setNepaliDate] = useState({ year: "", month: "", day: "" });
  const [gregorianResult, setGregorianResult] = useState("");

  const handleGregorianToNepali = () => {
    if (gregorianDate.year && gregorianDate.month && gregorianDate.day) {
      // Mock conversion logic
      const year = parseInt(gregorianDate.year);
      const month = parseInt(gregorianDate.month);
      const day = parseInt(gregorianDate.day);
      if (year > 1943 && year < 2034 && month > 0 && month < 13 && day > 0 && day < 32) {
        const nepaliYear = year + 56;
        const nepaliMonth = "Jestha";
        const nepaliDay = (day + 14) % 32;
        setNepaliResult(`${nepaliYear} ${nepaliMonth} ${nepaliDay}`);
      } else {
        setNepaliResult("Invalid date provided.");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all Gregorian date fields.",
      });
    }
  };

  const handleNepaliToGregorian = () => {
    if (nepaliDate.year && nepaliDate.month && nepaliDate.day) {
        // Mock conversion logic
        const year = parseInt(nepaliDate.year);
        const day = parseInt(nepaliDate.day);
        if (year > 2000 && year < 2091 && day > 0 && day < 33) {
            const gregorianYear = year - 57;
            const gregorianMonth = "May";
            const gregorianDay = (day + 15) % 31;
            setGregorianResult(`${gregorianYear} ${gregorianMonth} ${gregorianDay}`);
        } else {
            setGregorianResult("Invalid date provided.");
        }
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all Nepali date fields.",
      });
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
            <Input id="gregorian-month" type="number" placeholder="e.g., 5" value={gregorianDate.month} onChange={(e) => setGregorianDate({...gregorianDate, month: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gregorian-day">Day</Label>
            <Input id="gregorian-day" type="number" placeholder="e.g., 27" value={gregorianDate.day} onChange={(e) => setGregorianDate({...gregorianDate, day: e.target.value})} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleGregorianToNepali}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to Nepali
          </Button>
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
            <Input id="nepali-month" placeholder="e.g., Jestha" value={nepaliDate.month} onChange={(e) => setNepaliDate({...nepaliDate, month: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nepali-day">Day</Label>
            <Input id="nepali-day" type="number" placeholder="e.g., 15" value={nepaliDate.day} onChange={(e) => setNepaliDate({...nepaliDate, day: e.target.value})} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleNepaliToGregorian}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to Gregorian
          </Button>
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
