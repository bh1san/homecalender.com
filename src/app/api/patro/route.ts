
import { getPatroData } from '@/ai/flows/patro-data-flow';
import { NextResponse } from 'next/server';

// Force dynamic rendering, which will prevent caching of the response.
// This is important to ensure the calendar data is always fresh.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPatroData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in patro API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch patro data.' },
      { status: 500 }
    );
  }
}
