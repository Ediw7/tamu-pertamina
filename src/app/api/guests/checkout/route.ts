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

    // 1. Cari tamu berdasarkan QR Code
    const guest = await Guest.findOne({ qr_code });

    if (!guest) {
      return NextResponse.json({ error: 'Data tamu tidak ditemukan' }, { status: 404 });
    }

    // 2. VALIDASI: Cek apakah tamu sudah checkout sebelumnya
    if (guest.status === 'CHECKED_OUT') {
      return NextResponse.json({ 
        error: 'Gagal! Tamu ini sudah tercatat KELUAR sebelumnya.',
        alreadyCheckedOut: true 
      }, { status: 400 });
    }

    // 3. Proses Checkout jika status masih CHECKED_IN
    guest.status = 'CHECKED_OUT';
    guest.check_out_time = new Date();
    await guest.save();

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Failed to checkout guest:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat checkout' }, { status: 500 });
  }
}
