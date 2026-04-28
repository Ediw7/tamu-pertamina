"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('id') || "GUEST-UNKNOWN";

  return (
    <div className="w-full max-w-sm p-8 text-center bg-white border border-gray-100 shadow-xl rounded-2xl">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Check-in Berhasil!</h2>
      <p className="mb-8 text-sm text-gray-500">
        Silakan tunjukkan QR Code di bawah ini kepada petugas keamanan atau scan saat Anda check-out.
      </p>

      <div className="flex justify-center p-4 mx-auto mb-6 bg-white border-2 border-gray-100 border-dashed rounded-xl w-fit">
        <QRCodeSVG 
          value={guestId} 
          size={200}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"Q"}
          includeMargin={false}
        />
      </div>

      <div className="px-4 py-3 mb-8 bg-gray-50 rounded-xl">
        <span className="block text-xs text-gray-500">ID Pengunjung</span>
        <span className="text-lg font-mono font-bold text-gray-900 tracking-wider">{guestId}</span>
      </div>

      <Link
        href="/"
        className="block w-full py-3 text-sm font-medium text-center text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100"
      >
        Selesai & Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function CheckInSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <Suspense fallback={<div className="text-gray-500">Memuat...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
