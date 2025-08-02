
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Force dynamic rendering, which will prevent caching of the response.
// This is important to ensure the calendar data is always fresh.
export const dynamic = 'force-dynamic';

const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');
const dataDir = path.join(process.cwd(), 'data');

const initialNavLinks = [
    "Mart", "Bank Rates", "Jyotish", 
    "Rashifal", "Podcasts", "News", "Blog", "Gold/Silver", "Forex", "Converter"
];
const initialLogoUrl = "https://placehold.co/200x50.png";

async function ensureDataFileExists() {
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }

    try {
        await fs.access(settingsFilePath);
    } catch {
        const initialSettings = {
            logoUrl: initialLogoUrl,
            navLinks: initialNavLinks,
        };
        await fs.writeFile(settingsFilePath, JSON.stringify(initialSettings, null, 2), 'utf-8');
    }
}

export async function GET() {
    try {
        await ensureDataFileExists();
        const fileContents = await fs.readFile(settingsFilePath, 'utf-8');
        const settings = JSON.parse(fileContents);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to read settings:', error);
        return NextResponse.json({
            logoUrl: initialLogoUrl,
            navLinks: initialNavLinks
        }, { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const newSettings = await request.json();
        
        await ensureDataFileExists();
        
        // Basic validation
        if (typeof newSettings.logoUrl !== 'string' || !Array.isArray(newSettings.navLinks)) {
            return NextResponse.json({ message: 'Invalid settings format.' }, { status: 400 });
        }
        
        await fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2), 'utf-8');
        
        return NextResponse.json({ message: 'Settings saved successfully.' });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ message: 'Failed to save settings.' }, { status: 500 });
    }
}
