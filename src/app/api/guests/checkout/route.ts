import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { qr_code } = await request.json();

    if (!qr_code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    const guest = await Guest.findOneAndUpdate(
      { qr_code },
      { 
        status: 'checked_out',
        check_out_time: new Date()
      },
      { new: true }
    );

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Failed to checkout guest:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
