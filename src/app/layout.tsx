import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen Data Tamu | PT Pertamina Patra Niaga",
  description: "Sistem informasi manajemen data tamu berbasis QR Code di PT Pertamina Patra Niaga Integrated Terminal Semarang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans text-text-main antialiased selection:bg-primary/30">
          <main className="flex min-h-screen flex-col items-center justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
