"use client";

import { useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('id') || "GUEST-UNKNOWN";

  return (
    <div className="w-full max-w-sm animate-in fade-in duration-500">
      <div className="p-8 text-center bg-white border border-gray-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full text-red-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900">Check-in Berhasil</h2>
        <p className="mt-2 text-sm text-gray-500">
          Simpan QR Code ini untuk akses keluar area.
        </p>

        <div className="flex justify-center p-4 mx-auto my-8 bg-white border border-gray-100 rounded-2xl w-fit">
          <QRCodeCanvas 
            value={guestId} 
            size={180}
            level={"M"}
          />
        </div>

        <div className="mb-8">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Pengunjung</span>
          <span className="text-lg font-mono font-bold text-gray-900">{guestId}</span>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckInSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <Suspense fallback={<div className="text-gray-500">Memproses...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
