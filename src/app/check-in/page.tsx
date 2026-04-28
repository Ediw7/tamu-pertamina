import CheckInForm from "@/components/features/CheckInForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function CheckInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-0 sm:p-4 lg:p-8">
      <div className="w-full max-w-md lg:max-w-5xl bg-white shadow-2xl lg:flex min-h-screen sm:min-h-0 sm:max-h-[95vh] sm:rounded-[2.5rem] sm:overflow-hidden relative border border-gray-100">
        
        {/* Left Branding Side (Desktop Only) */}
        <div className="hidden lg:flex lg:w-5/12 bg-red-600 relative overflow-hidden flex-col justify-between p-8 text-white">
          <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-red-100 transition-all hover:text-white hover:translate-x-[-4px]"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl">
              <Image src="/pertamina.png" alt="Logo Pertamina" width={56} height={56} className="object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">
                Integrated <br /> Terminal Semarang
              </h1>
              <div className="h-1 w-20 bg-white/30 rounded-full mx-auto"></div>
              <p className="text-red-100 text-base font-medium opacity-90">
                Selamat Datang di Kawasan Operasional <br /> PT Pertamina Patra Niaga.
              </p>
            </div>
          </div>

          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-red-100">Patuhi Aturan K3</h3>
            <p className="text-xs leading-relaxed text-red-50/80">
              Pastikan Anda menggunakan APD yang sesuai jika memasuki area terbatas dan selalu perhatikan rambu-rambu keselamatan yang ada.
            </p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden px-6 pt-8 pb-10 bg-red-600 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-red-600/20">
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
            
            <div className="relative z-10">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-red-100 transition-colors hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Beranda
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center p-2.5 bg-white rounded-xl shadow-md">
                  <Image src="/pertamina.png" alt="Logo Pertamina" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight leading-tight">PT Pertamina Patra Niaga</h1>
                  <p className="text-[10px] text-red-200 uppercase tracking-widest font-semibold">IT Semarang</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center px-6 py-6 lg:px-12 lg:py-8">
            <div className="max-w-md mx-auto w-full">
              <CheckInForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
