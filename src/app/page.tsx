import Link from "next/link";
import { QrCode, Monitor } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-12 bg-gray-50">
      
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 md:p-12 text-center">
        {/* Logo / Icon Area */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full p-2">
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
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            href="/check-in"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-white transition-colors rounded-lg bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <QrCode className="w-5 h-5" />
            Check-In Pengunjung
          </Link>
          
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
          >
            <Monitor className="w-5 h-5" />
            Dashboard Admin
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PT Pertamina Patra Niaga
      </div>
    </div>
  );
}
