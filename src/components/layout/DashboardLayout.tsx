"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogOut, Home, QrCode, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        sessionStorage.setItem("adminAuth", "true");
        setIsAuthenticated(true);
      } else {
        setError(true);
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  const navigation = [
    { name: "Live Dashboard", href: "/dashboard", icon: Users },
    { name: "Scan QR Keluar", href: "/dashboard/scan", icon: QrCode },
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-0 sm:p-4 lg:p-8 font-sans">
        <div className="w-full max-w-md lg:max-w-5xl bg-white shadow-2xl lg:flex min-h-screen sm:min-h-0 sm:max-h-[95vh] sm:rounded-[2.5rem] sm:overflow-hidden relative border border-gray-100">
          
          {/* Left Branding Side (Desktop Only) */}
          <div className="hidden lg:flex lg:w-5/12 bg-red-600 relative overflow-hidden flex-col justify-between p-12 text-white">
            <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
            
            <div className="relative z-10">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-100 transition-all hover:text-white hover:translate-x-[-4px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 space-y-10">
              <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl shadow-2xl">
                <Image src="/pertamina.png" alt="Logo Pertamina" width={80} height={80} className="object-contain" />
              </div>
              <div className="space-y-4">
                <h1 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">
                  Akses Admin <br /> Integrated Terminal
                </h1>
                <div className="h-1 w-12 bg-white/30 rounded-full mx-auto"></div>
                <p className="text-red-100 text-base font-medium opacity-80 leading-relaxed">
                  Sistem Informasi Manajemen <br /> Tamu Digital Pertamina.
                </p>
              </div>
            </div>

            <div className="relative z-10 p-6 bg-black/10 backdrop-blur-md rounded-3xl border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-red-100 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Akses Terbatas
              </h3>
              <p className="text-[11px] leading-relaxed text-red-50/70 font-medium">
                Panel ini khusus untuk admin operasional dan petugas keamanan IT Semarang.
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
                    <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Akses Admin</h1>
                    <p className="text-[10px] text-red-200 uppercase tracking-widest font-semibold">IT Semarang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 lg:py-16">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-8 text-left">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login Panel</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Masukkan username dan password admin Anda.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(false);
                      }}
                      className={`block w-full py-3 px-4 text-sm text-gray-900 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all ${
                        error ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-red-500/10 focus:border-red-500'
                      }`}
                      placeholder="admin"
                      autoFocus
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      className={`block w-full py-3 px-4 text-sm text-gray-900 bg-gray-50/50 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all ${
                        error ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-red-500/10 focus:border-red-500'
                      }`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg animate-in fade-in duration-300">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      Kredensial salah, silakan coba lagi.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!username || !password || isLoading}
                    className="flex items-center justify-center w-full gap-2 px-5 py-3.5 text-sm font-semibold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-red-600/20"
                  >
                    {isLoading ? (
                      <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>Masuk ke Dashboard <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-[#f4f7f6] font-sans">
      {/* Sidebar */}
      <div className="hidden w-64 bg-white border-r border-gray-100 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.03)] md:flex md:flex-col z-10 relative">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-100">
          <Image src="/pertamina.png" alt="Logo" width={32} height={32} className="object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">Pertamina</span>
            <span className="text-xs text-red-600 font-semibold tracking-wider">IT SEMARANG</span>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 py-6 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive 
                      ? "bg-red-600 text-white shadow-md shadow-red-500/20" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-red-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar (Lock)
          </button>
          <Link
            href="/"
            className="flex items-center w-full gap-2 px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Kembali ke Web
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100 md:hidden shadow-sm z-10 relative">
          <div className="flex items-center gap-2">
            <Image src="/pertamina.png" alt="Logo" width={24} height={24} />
            <span className="text-sm font-bold text-gray-900">IT Semarang</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 rounded-xl hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
