
"use client";

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';
import FlagLoader from './flag-loader';

interface LocationSelectorProps {
  onLocationChange: (country: string | null) => void;
}

// A minimal list of countries for demonstration
const countries = [
  "Argentina", "Australia", "Bahrain", "Bangladesh", "Brazil", "Canada", "China",
  "Egypt", "France", "Germany", "India", "Indonesia", "Italy", "Japan",
  "Kuwait", "Mexico", "Nepal", "Netherlands", "Nigeria", "Oman", "Pakistan",
  "Philippines", "Qatar", "Russia", "Saudi Arabia", "South Africa",
  "South Korea", "Spain", "Thailand", "Turkey", "United Arab Emirates",
  "United Kingdom", "United States", "Vietnam"
];

export default function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false); 

  useEffect(() => {
    // Set Nepal as default on initial load, but don't trigger location detection automatically
    handleCountryChange("Nepal");
  }, []);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    onLocationChange(country);
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await response.json();
            const country = data.countryName;
            if (country) {
                handleCountryChange(country);
            }
          } catch (error) {
            console.error("Error fetching country from location:", error);
            handleCountryChange("United States"); // Fallback
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          handleCountryChange("United States"); // Fallback on error
          setIsLocating(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      handleCountryChange("United States"); // Fallback if not supported
      setIsLocating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleCountryChange} value={selectedCountry || ""}>
        <SelectTrigger className="w-[200px] text-lg font-semibold">
          <SelectValue placeholder="Select Country..." />
        </SelectTrigger>
        <SelectContent>
          {countries.sort().map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={handleDetectLocation} disabled={isLocating}>
        {isLocating ? <FlagLoader /> : <MapPin className="h-5 w-5 text-gray-600" />}
        <span className="sr-only">Detect Location</span>
      </Button>
    </div>
  );
}
