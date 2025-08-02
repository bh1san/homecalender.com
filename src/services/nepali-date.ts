
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
        is_public_holiday: boolean;
    }[];
}

const API_BASE_URL = 'https://nepali-calendar-api.p.rapidapi.com';

async function callApi<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        throw new Error('RapidAPI key is not configured. Please set RAPIDAPI_KEY in your .env file.');
    }

    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    if (params) {
        url.search = params.toString();
    }

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'nepali-calendar-api.p.rapidapi.com',
            'x-rapidapi-key': apiKey,
        },
    };

    try {
        const response = await fetch(url.toString(), options);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Response:', errorBody);
            throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Failed to fetch from Nepali Calendar API endpoint "${endpoint}":`, error);
        throw new Error(`Could not retrieve data from the Nepali Calendar API.`);
    }
}


/**
 * Fetches today's complete date information from the Nepali Calendar API.
 * @returns {Promise<NepaliDateApiResponse>} The complete date information for today.
 */
export async function getTodaysInfoFromApi(): Promise<NepaliDateApiResponse> {
    return callApi<NepaliDateApiResponse>('date');
}


/**
 * Fetches all events for a specific Nepali month.
 * @param {number} year The Nepali year (BS).
 * @param {number} month The Nepali month (1-12).
 * @returns {Promise<NepaliDateApiResponse[]>} An array of daily event information for the month.
 */
export async function getEventsForMonthFromApi(year: number, month: number): Promise<NepaliDateApiResponse[]> {
    const params = new URLSearchParams({
        bs_year_en: String(year),
        bs_month_en: String(month),
    });
    return callApi<NepaliDateApiResponse[]>('month', params);
}
