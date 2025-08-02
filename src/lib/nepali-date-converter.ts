
import NepaliDate from 'nepali-date-converter';

// Configure the NepaliDate object to use English language for month names if needed.
// new NepaliDate().setLanguage('en');

const getDaysInMonthBS = (year: number, month: number): number => {
    // The library's constructor takes (year, month, day). Month is 0-indexed for the constructor.
    const nepaliDate = new NepaliDate(year, month - 1, 1);
    return nepaliDate.getDaysInMonth();
}

const toBS = (adDate: Date): { year: number; month: number; day: number; weekDay: number; } => {
  const bsDate = new NepaliDate(adDate);
  return {
      year: bsDate.getYear(),
      month: bsDate.getMonth() + 1, // Convert 0-indexed to 1-indexed
      day: bsDate.getDate(),
      weekDay: bsDate.getDay(),
  };
};

const toAD = (bsDate: {year: number, month: number, day: number}): Date => {
  // Library uses 0-based month in the constructor.
  const nepaliDate = new NepaliDate(bsDate.year, bsDate.month - 1, bsDate.day);
  return nepaliDate.toJsDate();
}

const getFirstDayOfMonthBS = (year: number, month: number): number => {
    const adDate = toAD({ year, month, day: 1 });
    return adDate.getDay();
}

const getNepaliMonthName = (month: number) => {
    // Library month is 0-indexed for names
    const months = ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"];
    return months[month - 1];
}

const getEnglishMonthName = (month: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // JS Date month is 0-indexed
    return months[month];
};

const getNepaliDayOfWeek = (day: number) => {
    // JS Date day is 0-indexed (Sun=0)
    const days = ["आइतवार", "सोमवार", "मङ्गलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"];
    return days[day];
};

const getNepaliNumber = (num: number | string) => {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).split("").map(char => {
        if (!isNaN(parseInt(char))) {
            return nepaliDigits[parseInt(char)];
        }
        return char;
    }).join("");
};

const getNepaliDateParts = (date: Date) => toBS(date);


export { toBS, toAD, getDaysInMonthBS, getFirstDayOfMonthBS, getNepaliMonthName, getEnglishMonthName, getNepaliDayOfWeek, getNepaliNumber, getNepaliDateParts };
