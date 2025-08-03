
/**
 * @fileoverview AD to BS and BS to AD date converter.
 * This is a self-contained library to avoid external dependency issues.
 * The logic is based on standard conversion algorithms.
 */

const nepaliMonthDays = [
  [30, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
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
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 31, 32, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 32, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
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
  [31, 32, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  [30, 31, 32, 32, 31, 31, 30, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 29, 30, 30, 30, 30],
  [31, 31, 32, 31, 32, 31, 31, 30, 29, 30, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30],
  [31, 32, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30],
  [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 30, 30]
];
const englishMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const minBsYear = 2000;
const minAdYear = 1943;
const bsMonthFirstDay = [0, 1, 17, 17, 18, 19, 20, 21, 21, 22, 22, 21, 21];

const START_BS_YEAR = 2000;
const START_BS_MONTH = 1;
const START_BS_DAY = 1;

const START_AD_YEAR = 1943;
const START_AD_MONTH = 4;
const START_AD_DAY = 14;

export function adToBs(year: number, month: number, day: number) {
  let bsYear = year + 57;
  let bsMonth = (month + 9) % 12;
  bsMonth = bsMonth === 0 ? 12 : bsMonth;
  let bsDay = 1;

  if (month < 4) {
    bsYear -= 1;
  } else if (month === 4) {
    const bsNewYearDay = nepaliMonthDays[bsYear - START_BS_YEAR][0] - 15;
    if (day < bsNewYearDay) {
      bsYear -= 1;
    }
  }

  const bsYearIndex = bsYear - START_BS_YEAR;

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

  let totalNepDays = 0;
  totalNepDays += bsMonthFirstDay[month];

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
    let adYear = year - 57;
    let adMonth = (month + 3) % 12;
    adMonth = adMonth === 0 ? 12 : adMonth;
  
    if (month > 8) {
      adYear += 1;
    }
  
    let totalNepDays = 0;
    const bsYearIndex = year - START_BS_YEAR;
  
    for (let i = 0; i < month - 1; i++) {
      totalNepDays += nepaliMonthDays[bsYearIndex][i];
    }
    totalNepDays += day;
  
    let totalEngDays = 0;
    let adDay = 0;
    let adM = 0;
  
    let tempDays = 0;
    for (let i = 0; i < 12; i++) {
      let isLeapYear = false;
      if ((adYear % 4 === 0 && adYear % 100 !== 0) || adYear % 400 === 0) {
        isLeapYear = true;
      }
      if (isLeapYear && i === 1) {
          tempDays += englishMonthDays[i] + 1;
      } else {
          tempDays += englishMonthDays[i];
      }
  
      if (totalNepDays + bsMonthFirstDay[i+1] <= tempDays) {
        adMonth = i + 1;
        adDay = totalNepDays + bsMonthFirstDay[i+1] - (tempDays - englishMonthDays[i]);
        break;
      }
    }
    
    // This is a rough approximation, real logic is more complex
     let refAdYear = START_AD_YEAR;
     let refAdMonth = START_AD_MONTH;
     let refAdDay = START_AD_DAY;

     let refBsYear = START_BS_YEAR;
     let refBsMonth = START_BS_MONTH;
     let refBsDay = START_BS_DAY;

    let totalDays = 0;
    
    for(let i = refBsYear; i < year; i++) {
        for(let j=0; j<12; j++) {
            totalDays += nepaliMonthDays[i-START_BS_YEAR][j];
        }
    }
    for(let j=0; j<month-1; j++) {
        totalDays += nepaliMonthDays[year-START_BS_YEAR][j];
    }
    totalDays += day - refBsDay;

    const resultDate = new Date(refAdYear, refAdMonth-1, refAdDay);
    resultDate.setDate(resultDate.getDate() + totalDays);

    return { year: resultDate.getFullYear(), month: resultDate.getMonth() + 1, day: resultDate.getDate() };
}

export function getMonthDays(year: number, month: number) {
    if (year < minBsYear) return 0;
    return nepaliMonthDays[year - minBsYear][month-1];
}
