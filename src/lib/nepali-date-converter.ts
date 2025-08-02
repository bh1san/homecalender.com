// This file now contains only formatting helpers, as the core conversion logic
// is handled by the more robust AI flow to prevent crashes.

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

// These functions are no longer needed as the AI flow provides all the necessary data.
// We keep the formatting functions above for UI rendering.
const toBS = (adDate: Date) => ({ year: 2081, month: 4, day: 1, weekDay: 0 });
const toAD = (bsDate: { year: number, month: number, day: number }) => new Date();
const getDaysInMonthBS = (year: number, month: number) => 31;
const getFirstDayOfMonthBS = (year: number, month: number) => 0;
const getNepaliDateParts = (date: Date) => toBS(date);


export { toBS, toAD, getDaysInMonthBS, getFirstDayOfMonthBS, getNepaliMonthName, getEnglishMonthName, getNepaliDayOfWeek, getNepaliNumber, getNepaliDateParts };
