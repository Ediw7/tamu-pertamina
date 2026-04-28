import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';
import Visitor from '@/models/Visitor';

export async function GET() {
  try {
    await connectDB();
    // Fetch all visits and populate visitor details (Master Data)
    const visits = await Guest.find({})
      .populate('visitorId')
      .sort({ check_in_time: -1 })
      .lean();
    
    // Flatten the data for frontend compatibility if needed
    const flattenedData = visits.map((visit: any) => ({
      ...visit,
      name: visit.visitorId?.name || 'Unknown',
      agency: visit.visitorId?.agency || 'Unknown',
      phone: visit.visitorId?.phone || 'Unknown',
    }));

    return NextResponse.json(flattenedData);
  } catch (error: any) {
    console.error('GET Guests Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, agency, phone, host, purpose } = body;
    
    if (!name || !phone) {
      return NextResponse.json({ error: 'Nama dan Nomor Telepon wajib diisi' }, { status: 400 });
    }

    // 1. Find or Create Visitor (Master Data)
    let visitor = await Visitor.findOne({ phone });
    
    if (!visitor) {
      visitor = await Visitor.create({
        name: name.toUpperCase(),
        agency: agency || '-',
        phone
      });
    } else {
      // Optional: Update name/agency if they changed
      visitor.name = name.toUpperCase();
      visitor.agency = agency || visitor.agency;
      await visitor.save();
    }

    // 2. Generate a unique QR code
    const qr_code = 'GUEST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 3. Create Visit Log (Referencing Visitor)
    const newVisit = await Guest.create({
      visitorId: visitor._id,
      host: host || '-',
      purpose: purpose || '-',
      status: 'CHECKED_IN',
      qr_code
    });

    const visitObj = newVisit.toObject();

    return NextResponse.json({ 
      success: true, 
      guest: { ...visitObj, name: visitor.name, agency: visitor.agency } 
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST Guest Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses data check-in' }, { status: 500 });
  }
}
