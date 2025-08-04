
import { getNews } from '@/ai/flows/news-flow';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getNews('Nepal');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in news API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news data.' },
      { status: 500 }
    );
  }
}
