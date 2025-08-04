
'use server';

import { getPatroData } from '@/ai/flows/patro-data-flow';
import { getNews } from '@/ai/flows/news-flow';
import fs from 'fs/promises';
import path from 'path';

// This ensures all flows are part of the server build
import '@/ai/dev';

async function getSettings() {
    const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');
    try {
        const fileContents = await fs.readFile(settingsFilePath, 'utf-8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Failed to read settings, returning default:', error);
        return {
            logoUrl: "https://placehold.co/200x50.png",
            navLinks: [
                "Mart", "Bank Rates", "Jyotish", "Rashifal", "Podcasts", 
                "News", "Blog", "Gold/Silver", "Forex", "Converter"
            ]
        };
    }
}

export async function getPageData() {
  try {
    const [patroData, newsData, settings] = await Promise.all([
      getPatroData(),
      getNews('Nepal'),
      getSettings()
    ]);
    
    return {
      patroData,
      newsItems: newsData.headlines,
      settings
    };
  } catch (error) {
    console.error("Error fetching page data in server action:", error);
    const settings = await getSettings();
    // Return a default state to prevent the page from crashing
    return {
      patroData: {
        horoscope: [],
        goldSilver: null,
        forex: [],
        today: null,
        todaysEvent: undefined,
        upcomingEvents: [],
      },
      newsItems: [],
      settings,
    };
  }
}
