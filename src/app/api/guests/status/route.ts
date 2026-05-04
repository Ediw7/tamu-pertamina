import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const qr_code = searchParams.get('qr_code');

    if (!qr_code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    const guest = await Guest.findOne({ qr_code }).select('status').lean();

    if (!guest) {
      return NextResponse.json({ status: 'NOT_FOUND' });
    }

    return NextResponse.json({ status: guest.status });
  } catch (error: any) {
    console.error('Check Status Error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
