import CheckInForm from "@/components/features/CheckInForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function CheckInPage() {
  return (
    <div className="flex justify-center min-h-screen bg-gray-50/50">
      <div className="w-full max-w-md bg-white shadow-sm sm:border-x sm:border-gray-100 min-h-screen sm:min-h-0 sm:my-8 sm:rounded-3xl overflow-hidden relative">
        
        {/* Header Section */}
        <div className="px-6 pt-8 pb-6 bg-red-600 rounded-b-3xl relative overflow-hidden">
          {/* Subtle pattern/gradient */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
          
          <div className="relative z-10">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-red-100 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Beranda
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 bg-white rounded-xl shadow-sm">
                <Image src="/pertamina.png" alt="Logo Pertamina" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">PT Pertamina Patra Niaga</h1>
                <p className="text-xs text-red-200">Integrated Terminal Semarang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 py-8">
          <CheckInForm />
        </div>
      </div>
    </div>
  );
}
