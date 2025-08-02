// This file now contains only formatting helpers, as the core conversion logic
// is handled by the more robust API service.

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

const getFirstDayOfMonthBS = (year: number, month: number): number => {
    // This function needs to determine the day of the week for the 1st of a given Nepali month.
    // Since we are not using a library anymore, a simple but less accurate estimation
    // might be needed if the API for some reason doesn't provide this.
    // For now, we will rely on the API to provide the starting day implicitly.
    // Let's return a default (Sunday) and handle the padding in the component based on the first day's data from API.
    // A more robust client-side implementation would require a complex algorithm.
    return 0; // Defaulting to Sunday. The calendar component will handle the real offset.
};


export { getNepaliMonthName, getEnglishMonthName, getNepaliDayOfWeek, getNepaliNumber, getFirstDayOfMonthBS };
