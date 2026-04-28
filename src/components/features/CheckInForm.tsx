"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Phone, FileText, ArrowRight } from "lucide-react";

export default function CheckInForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtherPurpose, setIsOtherPurpose] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    phone: "",
    host: "",
    purpose: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (e.target.name === 'name') {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to success page and pass the qr code
        router.push(`/check-in/success?id=${data.guest.qr_code}`);
      } else {
        alert("Terjadi kesalahan: " + data.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registrasi Tamu</h2>
        <p className="mt-1 text-sm text-gray-500">
          Silakan lengkapi data diri Anda di bawah ini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Lengkap</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Asal Instansi / Universitas / Perusahaan</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Briefcase className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="agency"
              required
              value={formData.agency}
              onChange={handleChange}
              className="block w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="Contoh: PT. Pertamina / Universitas Diponegoro"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">PIC / Pegawai yang Dituju</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="host"
              required
              value={formData.host}
              onChange={handleChange}
              className="block w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="Nama Pegawai / Departemen"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Telepon</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="block w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="08123456789"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Keperluan Kunjungan</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <select
              required={!isOtherPurpose}
              value={isOtherPurpose ? 'Lainnya' : formData.purpose}
              onChange={(e) => {
                if (e.target.value === 'Lainnya') {
                  setIsOtherPurpose(true);
                  setFormData({ ...formData, purpose: '' });
                } else {
                  setIsOtherPurpose(false);
                  setFormData({ ...formData, purpose: e.target.value });
                }
              }}
              className="block w-full py-2.5 pl-10 pr-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
            >
              <option value="" disabled>Pilih keperluan...</option>
              <option value="Meeting / Rapat">Meeting / Rapat</option>
              <option value="Kunjungan Kerja">Kunjungan Kerja</option>
              <option value="Penelitian / Mahasiswa">Penelitian / Mahasiswa</option>
              <option value="Vendor / Pekerjaan Proyek">Vendor / Pekerjaan Proyek</option>
              <option value="Pengiriman Barang">Pengiriman Barang</option>
              <option value="Lainnya">Lainnya...</option>
            </select>
          </div>
          
          {isOtherPurpose && (
            <div className="mt-3 relative animate-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                className="block w-full py-2.5 px-4 text-sm text-gray-900 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Sebutkan keperluan spesifik Anda..."
                autoFocus
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          ) : (
            <>
              Check-In Sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
