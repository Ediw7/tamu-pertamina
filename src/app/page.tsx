"use client";

import Link from "next/link";
import { QrCode, Monitor, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [lastGuestId, setLastGuestId] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastGuestId");
    if (savedId) {
      setLastGuestId(savedId);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-12 bg-gray-50">
      
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-50 rounded-full opacity-50"></div>
        
        {/* Logo / Icon Area */}
        <div className="flex justify-center mb-6 relative">
          <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-md p-2">
            <Image src="/pertamina.png" alt="Logo Pertamina" width={80} height={80} className="object-contain" />
          </div>
        </div>
        
        <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
          Sistem Buku Tamu Digital
        </h1>
        <h2 className="mb-6 text-xl font-medium text-red-600">
          PT Pertamina Patra Niaga IT Semarang
        </h2>
        
        <p className="max-w-xl mx-auto mb-10 text-gray-600">
          Selamat datang di fasilitas kami. Silakan lakukan registrasi Check-In sebelum memasuki area, dan pastikan Anda melakukan Check-Out saat meninggalkan area.
        </p>

        {lastGuestId && (
          <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
            <Link 
              href={`/check-in/success?id=${lastGuestId}`}
              className="inline-flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all group"
            >
              <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="text-left pr-4">
                <p className="text-sm font-bold text-blue-900 leading-tight">Lihat QR Code Terakhir</p>
                <p className="text-xs text-blue-700 font-medium opacity-80">Gunakan ID: {lastGuestId}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            href="/check-in"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white transition-all rounded-xl bg-red-600 hover:bg-red-700 w-full sm:w-auto shadow-lg shadow-red-600/20 active:scale-95"
          >
            <QrCode className="w-5 h-5" />
            Check-In Pengunjung
          </Link>
          
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-gray-700 transition-all bg-white border border-gray-200 rounded-xl hover:bg-gray-50 w-full sm:w-auto active:scale-95"
          >
            <Monitor className="w-5 h-5" />
            Dashboard Admin
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 font-medium">
        &copy; {new Date().getFullYear()} PT Pertamina Patra Niaga
      </div>
    </div>
  );
}
