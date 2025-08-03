
/**
 * @fileoverview AD to BS and BS to AD date converter.
 * This is a self-contained library to avoid external dependency issues.
 * The logic is based on a standard, verified conversion algorithm.
 */

const nepaliMonthDays = [
  // 2000-2010
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 30, 30, 30],
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  [30, 32, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30],
  // 2011-2020
  [31, 31, 32, 31, 32, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  [30, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  // 2021-2030
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  // 2031-2040
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  // 2041-2050
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  // 2051-2060
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30],
  [31, 32, 31, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  // 2061-2070
  [31, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  // 2071-2080
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  // 2081-2090
  [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2081
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30], // 2082
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2083
  [30, 32, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], // 2084
  [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2085
  [30, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30], // 2086
  [31, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30], // 2087
  [31, 31, 32, 31, 32, 31, 30, 30, 29, 30, 30, 30], // 2088
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2089
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2090
];

const START_BS_YEAR = 2000;
const END_BS_YEAR = 2090;
const START_AD_YEAR = 1943;
const START_AD_MONTH = 4;
const START_AD_DAY = 14;

function isAdLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const englishMonthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function adToBs(adYear: number, adMonth: number, adDay: number) {
    if (adYear < START_AD_YEAR || (adYear === START_AD_YEAR && adMonth < START_AD_MONTH) || (adYear === START_AD_YEAR && adMonth === START_AD_MONTH && adDay < START_AD_DAY)) {
        throw new Error(`Date out of range. Please provide an AD year after ${START_AD_YEAR}-04-14.`);
    }

    const epochAdDate = new Date(START_AD_YEAR, START_AD_MONTH - 1, START_AD_DAY);
    const givenAdDate = new Date(adYear, adMonth - 1, adDay);

    const diffDays = Math.ceil((givenAdDate.getTime() - epochAdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let bsYear = START_BS_YEAR;
    let bsMonth = 1;
    let bsDay = 1;
    
    let daysRemaining = diffDays;
    let yearIndex = 0;

    while (true) {
        const yearData = nepaliMonthDays[yearIndex];
        if (!yearData) {
             throw new Error(`Date out of range. BS year data not available for ${START_BS_YEAR + yearIndex}.`);
        }
        const daysInYear = yearData.reduce((sum, days) => sum + days, 0);
        if (daysRemaining < daysInYear) {
            bsYear = START_BS_YEAR + yearIndex;
            break;
        }
        daysRemaining -= daysInYear;
        yearIndex++;
    }

    let monthIndex = 0;
    while (true) {
        const daysInMonth = nepaliMonthDays[yearIndex][monthIndex];
        if (daysRemaining < daysInMonth) {
            bsMonth = monthIndex + 1;
            bsDay = daysRemaining + 1;
            break;
        }
        daysRemaining -= daysInMonth;
        monthIndex++;
    }

    return { year: bsYear, month: bsMonth, day: bsDay };
}


export function bsToAd(bsYear: number, bsMonth: number, bsDay: number) {
    if (bsYear < START_BS_YEAR || bsYear > END_BS_YEAR) {
        throw new Error(`Date out of range. Please provide a BS year between ${START_BS_YEAR} and ${END_BS_YEAR}.`);
    }
    const yearIndex = bsYear - START_BS_YEAR;
    if (bsMonth < 1 || bsMonth > 12 || bsDay < 1 || bsDay > nepaliMonthDays[yearIndex][bsMonth - 1]) {
        throw new Error("Invalid BS date provided.");
    }
    
    let totalDays = 0;

    for (let i = 0; i < yearIndex; i++) {
        totalDays += nepaliMonthDays[i].reduce((sum, days) => sum + days, 0);
    }
    for (let i = 0; i < bsMonth - 1; i++) {
        totalDays += nepaliMonthDays[yearIndex][i];
    }
    totalDays += bsDay - 1;

    const resultAdDate = new Date(START_AD_YEAR, START_AD_MONTH - 1, START_AD_DAY);
    resultAdDate.setDate(resultAdDate.getDate() + totalDays);

    return {
        year: resultAdDate.getFullYear(),
        month: resultAdDate.getMonth() + 1,
        day: resultAdDate.getDate()
    };
}


export function getMonthDays(year: number, month: number) {
    if (year < START_BS_YEAR || year > END_BS_YEAR) {
        throw new Error(`Date out of range. BS year data not available for ${year}.`);
    }
    const bsYearIndex = year - START_BS_YEAR;
    if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
    }
    return nepaliMonthDays[bsYearIndex][month - 1];
}
