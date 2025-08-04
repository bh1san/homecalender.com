
import { getMonthEvents } from '@/ai/flows/month-events-flow';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const year = parseInt(params.year, 10);
    const month = parseInt(params.month, 10);

    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ message: 'Invalid year or month' }, { status: 400 });
    }
    
    const data = await getMonthEvents({ year, month });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in calendar API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch calendar data.' },
      { status: 500 }
    );
  }
}
