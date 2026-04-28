import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

export async function GET() {
  try {
    await connectDB();
    // Fetch all guests, sorted by newest first
    const guests = await Guest.find({}).sort({ check_in_time: -1 }).lean();
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Generate a unique QR code (for example: GUEST-RANDOMID)
    const qr_code = 'GUEST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newGuest = await Guest.create({
      ...body,
      name: body.name ? body.name.toUpperCase() : '',
      status: 'checked_in',
      qr_code
    });

    return NextResponse.json({ success: true, guest: newGuest }, { status: 201 });
  } catch (error) {
    console.error('Failed to create guest:', error);
    return NextResponse.json({ error: 'Failed to check-in guest' }, { status: 500 });
  }
}
