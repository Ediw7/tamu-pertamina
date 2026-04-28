"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    // Only initialize scanner on client side
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        // Stop scanning to prevent multiple API calls
        scanner.pause();
        
        try {
          const response = await fetch('/api/guests/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qr_code: decodedText })
          });
          
          if (response.ok) {
            setScanResult(decodedText);
            setStatus("success");
            scanner.clear();
          } else {
            const data = await response.json();
            alert("Gagal Check-Out: " + (data.error || "QR tidak valid"));
            scanner.resume();
          }
        } catch (error) {
          alert("Terjadi kesalahan jaringan.");
          scanner.resume();
        }
      },
      (error) => {
        // Ignore errors during continuous scanning
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleReset = () => {
    setScanResult(null);
    setStatus("idle");
    window.location.reload(); // Quick way to reinitialize scanner
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Scan QR Keluar</h2>
        <p className="mt-2 text-sm text-gray-500">
          Arahkan QR Code tamu ke kamera untuk melakukan proses check-out.
        </p>
      </div>

      <div className="p-8 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden">
        <div className={status === "idle" ? "flex flex-col items-center" : "hidden"}>
          <style jsx global>{`
            #reader video {
              transform: scaleX(-1);
            }
          `}</style>
          <div id="reader" className="w-full max-w-sm overflow-hidden bg-black rounded-2xl shadow-inner aspect-square"></div>
          
          <p className="mt-8 text-sm text-gray-500 flex items-center gap-2">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
              <span className="relative inline-flex w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </span>
            Kamera aktif & siap memindai
          </p>
        </div>

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-green-50 rounded-full shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Check-Out Berhasil!</h3>
            <div className="px-6 py-3 mb-8 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">ID Pengunjung</p>
              <p className="font-mono text-lg font-bold text-gray-900">{scanResult}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-8 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-[0.98]"
            >
              Scan Pengunjung Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
