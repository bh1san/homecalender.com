/**
 * @fileoverview AD to BS and BS to AD date converter.
 * This is a self-contained library to avoid external dependency issues.
 * The logic is based on standard conversion algorithms.
 */

const nepaliMonthDays = [
  [30, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2000
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2001
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2002
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2003
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 30, 30, 30], // 2004
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2005
  [30, 32, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], // 2006
  [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2007
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2008
  [30, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30], // 2009
  [30, 31, 32, 31, 32, 31, 30, 29, 30, 30, 30, 30], // 2010
  [31, 31, 32, 31, 32, 31, 30, 30, 29, 30, 30, 30], // 2011
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2012
  [31, 31, 32, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2013
  [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2014
  [31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2015
  [30, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2016
  [30, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2017
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2018
  [30, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2019
  [30, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2020
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2021
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2022
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2023
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2024
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2025
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2026
  [31, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2027
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2028
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2029
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2030
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2031
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2032
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30], // 2033
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2034
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2035
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2036
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30], // 2037
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2038
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2039
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2040
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2041
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2042
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30], // 2043
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2044
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2045
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2046
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30], // 2047
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2048
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2049
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2050
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2051
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2052
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30], // 2053
  [31, 32, 31, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2054
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2055
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2056
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2057
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 30, 30, 30], // 2058
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2059
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2060
  [31, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2061
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2062
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2063
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2064
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2065
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2066
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30], // 2067
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2068
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2069
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2070
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30], // 2071
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2072
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2073
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2074
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2075
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2076
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30], // 2077
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2078
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2079
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2080
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30], // 2081
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30], // 2082
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30], // 2083
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30], // 2084
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2085
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30], // 2086
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30], // 2087
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2088
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2089
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30], // 2090
];
const englishMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const START_BS_YEAR = 2000;
const END_BS_YEAR = 2090;

const START_AD_YEAR = 1943;
const END_AD_YEAR = 2034;

const START_AD_MONTH = 4;
const START_AD_DAY = 14;

const bsMonthFirstDay = [0, 1, 17, 17, 18, 19, 20, 21, 21, 22, 22, 21, 21];

export function adToBs(year: number, month: number, day: number) {
    if (year < START_AD_YEAR || year >= END_AD_YEAR) {
        throw new Error(`Date out of range. Please provide an AD year between ${START_AD_YEAR} and ${END_AD_YEAR-1}.`);
    }

    let bsYear = year + 57;
    let bsMonth = (month + 9) % 12;
    bsMonth = bsMonth === 0 ? 12 : bsMonth;
    let bsDay = 1;

    if (month < 4) {
        bsYear -= 1;
    } else if (month === 4) {
        const bsYearIndexCheck = bsYear - START_BS_YEAR;
        if (nepaliMonthDays[bsYearIndexCheck]) {
            const bsNewYearDay = nepaliMonthDays[bsYearIndexCheck][0] - 15;
            if (day < bsNewYearDay) {
                bsYear -= 1;
            }
        }
    }

    const bsYearIndex = bsYear - START_BS_YEAR;
    if (!nepaliMonthDays[bsYearIndex]) {
        throw new Error(`Date out of range. BS year ${bsYear} is not supported.`);
    }

    let totalEngDays = 0;
    for (let i = 0; i < month - 1; i++) {
        totalEngDays += englishMonthDays[i];
    }
    totalEngDays += day;

    let isLeapYear = false;
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        isLeapYear = true;
    }
    if (isLeapYear && month > 2) {
        totalEngDays++;
    }

    let totalNepDays = bsMonthFirstDay[month] || 0;

    let k = month > 3 ? 1 : 0;
    bsMonth = 0;
    let tempDays = 0;

    for (let i = 0; i < 12; i++) {
        tempDays += nepaliMonthDays[bsYearIndex][i];
        if (totalEngDays <= tempDays + totalNepDays) {
            bsMonth = i + 1;
            bsDay = totalEngDays - (tempDays - nepaliMonthDays[bsYearIndex][i]) - totalNepDays;
            break;
        }
    }

    return { year: bsYear, month: bsMonth, day: bsDay };
}


export function bsToAd(year: number, month: number, day: number) {
    if (year < START_BS_YEAR || year > END_BS_YEAR) {
        throw new Error(`Date out of range. Please provide a BS year between ${START_BS_YEAR} and ${END_BS_YEAR}.`);
    }

    const bsYearIndex = year - START_BS_YEAR;
    if (!nepaliMonthDays[bsYearIndex] || month < 1 || month > 12 || day < 1 || day > nepaliMonthDays[bsYearIndex][month - 1]) {
        throw new Error("Invalid BS date provided.");
    }
    
    let totalDays = 0;
    
    for(let i = START_BS_YEAR; i < year; i++) {
        for(let j=0; j<12; j++) {
            totalDays += nepaliMonthDays[i-START_BS_YEAR][j];
        }
    }
    for(let j=0; j<month-1; j++) {
        totalDays += nepaliMonthDays[year-START_BS_YEAR][j];
    }
    totalDays += day - 1;

    const resultDate = new Date(START_AD_YEAR, START_AD_MONTH-1, START_AD_DAY);
    resultDate.setDate(resultDate.getDate() + totalDays);

    return { year: resultDate.getFullYear(), month: resultDate.getMonth() + 1, day: resultDate.getDate() };
}

export function getMonthDays(year: number, month: number) {
    if (year < START_BS_YEAR || year > END_BS_YEAR) return 30; // Return a default
    const bsYearIndex = year - START_BS_YEAR;
    if (!nepaliMonthDays[bsYearIndex] || month < 1 || month > 12) return 30;
    return nepaliMonthDays[bsYearIndex][month-1];
}
