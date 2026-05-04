"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function QRScanner() {
  const [lastGuest, setLastGuest] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let scanner: Html5Qrcode | null = null;
    let isScannerStarted = false;

    // Use a small delay to prevent double-initialization in React Strict Mode
    const initTimer = setTimeout(async () => {
      if (!isMounted) return;

      try {
        scanner = new Html5Qrcode("reader");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            // Prevent processing if already processing or unmounted
            if (!isMounted || isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
              const response = await fetch('/api/guests/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr_code: decodedText })
              });

              if (response.ok) {
                const data = await response.json();
                setLastGuest(decodedText);
                setNotification({ type: "success", message: `Berhasil Check-Out: ${data.guest?.name || decodedText}` });
                
                // Clear notification and allow next scan after 3 seconds
                setTimeout(() => {
                  setNotification(null);
                  isProcessingRef.current = false;
                }, 3000);
              } else {
                const data = await response.json();
                setNotification({ type: "error", message: data.error || "QR tidak valid" });
                
                setTimeout(() => {
                  setNotification(null);
                  isProcessingRef.current = false;
                }, 3000);
              }
            } catch (error) {
              setNotification({ type: "error", message: "Terjadi kesalahan jaringan." });
              setTimeout(() => {
                setNotification(null);
                isProcessingRef.current = false;
              }, 3000);
            }
          },
          (error) => {
            // Ignore continuous scan errors
          }
        );
        isScannerStarted = true;
      } catch (err) {
        console.error("Error starting scanner:", err);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (scanner && isScannerStarted) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);


  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Scan QR Keluar</h2>
        <p className="mt-2 text-sm text-gray-500">
          Arahkan QR Code tamu ke kamera untuk melakukan proses check-out.
        </p>
      </div>

      <div className="p-8 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden">
        {/* Camera UI - Always Visible */}
        <div className="flex flex-col items-center">
          <style jsx global>{`
            #reader video {
              transform: scaleX(-1);
            }
          `}</style>
          
          {/* Notification Overlay */}
          {notification && (
            <div className={`absolute top-0 left-0 right-0 z-10 p-4 text-center animate-in slide-in-from-top duration-300 ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}>
              <div className="flex items-center justify-center gap-2 text-white">
                {notification.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">{notification.message}</p>
              </div>
            </div>
          )}

          <div id="reader" className="w-full max-w-sm overflow-hidden bg-black rounded-2xl shadow-inner aspect-square"></div>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </span>
              Kamera aktif & siap memindai
            </p>
            {lastGuest && !notification && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Terakhir Scan: {lastGuest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
