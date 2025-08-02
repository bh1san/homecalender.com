// This file now contains only formatting helpers, as the core conversion logic
// is handled by the more robust API service.
import { toAD as convertToAD, toBS as convertToBS } from 'nepali-date-converter-minimal';


const getNepaliMonthName = (month: number) => {
    // Month is 1-indexed
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


const toBS = (adDate: Date) => {
    const bsDate = convertToBS(adDate);
    const [year, month, day] = bsDate.split('-').map(Number);
    return { year, month, day, weekDay: adDate.getDay() };
};
const toAD = (bsDate: { year: number, month: number, day: number }) => {
    return convertToAD(new Date(`${bsDate.year}-${bsDate.month}-${bsDate.day}`));
};

const getFirstDayOfMonthBS = (year: number, month: number) => {
    const adDate = convertToAD(new Date(`${year}-${month}-01`));
    return adDate.getDay();
};


export { getNepaliMonthName, getEnglishMonthName, getNepaliDayOfWeek, getNepaliNumber, getFirstDayOfMonthBS, toBS };