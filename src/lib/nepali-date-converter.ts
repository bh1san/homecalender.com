
const getNepaliMonthName = (month: number) => {
    // Month is 0-indexed
    const months = ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"];
    return months[month];
}

const getEnglishMonthName = (month: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // Month is 0-indexed
    return months[month];
};

const getNepaliDayOfWeek = (day: number) => {
    // Day is 0-indexed (Sun=0)
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


export { getNepaliMonthName, getEnglishMonthName, getNepaliDayOfWeek, getNepaliNumber };
