
/**
 * @fileOverview A service for interacting with the Nepali Calendar RapidAPI.
 */

// This type definition is based on the sample response from the API documentation.
// It might need adjustments if the actual API response differs.
interface NepaliDateApiResponse {
    bs_year_en: number;
    bs_month_en: string;
    bs_day_en: number;
    ad_year_en: number;
    ad_month_en: string;
    ad_day_en: number;
    bs_month_code_en: number;
    ad_month_code_en: number;
    ad_day_of_week_en: number; // Sunday: 1, Monday: 2, ...
    bs_day_of_week_en: number; // Sunday: 1, Monday: 2, ...
    is_holiday: boolean;
    tithi: {
        tithi_name_np: string;
    };
    panchanga: {
        panchanga_np: string;
    };
    events: {
        event_title_en: string | null;
        event_title_np: string | null;
    }[];
}


/**
 * Fetches today's complete date information from the Nepali Calendar API.
 * @returns {Promise<NepaliDateApiResponse>} The complete date information for today.
 * @throws Will throw an error if the API call fails or the API key is missing.
 */
export async function getTodaysInfoFromApi(): Promise<NepaliDateApiResponse> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        throw new Error('RapidAPI key is not configured. Please set RAPIDAPI_KEY in your .env file.');
    }

    const url = 'https://nepali-calendar-api.p.rapidapi.com/date';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'nepali-calendar-api.p.rapidapi.com',
            'x-rapidapi-key': apiKey,
        },
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Response:', errorBody);
            throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Failed to fetch from Nepali Calendar API:', error);
        throw new Error('Could not retrieve data from the Nepali Calendar API.');
    }
}
