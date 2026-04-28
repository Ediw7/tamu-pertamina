"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Phone, FileText, ArrowRight, ShieldCheck, Info, ArrowLeft } from "lucide-react";

export default function CheckInForm() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtherPurpose, setIsOtherPurpose] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!agreedToSafety) return;
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

  if (step === 2) {
    return (
      <div className="w-full animate-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali Edit Data
        </button>

        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Konfirmasi Kehadiran & K3</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Waktu check-in Anda akan tercatat secara permanen saat Anda menekan tombol konfirmasi di bawah.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informasi Penting</h4>
          <ul className="space-y-3">
            <li className="flex gap-2 text-xs text-gray-700">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Saya sudah berada di area <strong>Pos Keamanan</strong> Integrated Terminal Semarang.</span>
            </li>
            <li className="flex gap-2 text-xs text-gray-700">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Saya bersedia mematuhi seluruh aturan <strong>K3 (Health, Safety, Security, Environment)</strong> yang berlaku.</span>
            </li>
            <li className="flex gap-2 text-xs text-gray-700">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Saya akan menunjukkan identitas diri (KTP/SIM) kepada petugas jika diminta.</span>
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-red-500 transition-all mb-6 group">
          <input 
            type="checkbox" 
            checked={agreedToSafety}
            onChange={(e) => setAgreedToSafety(e.target.checked)}
            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 leading-tight">
            Saya mengonfirmasi bahwa data yang saya isi sudah benar dan saya siap mematuhi aturan keamanan yang berlaku.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!agreedToSafety || isSubmitting}
          className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-bold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
        >
          {isSubmitting ? "Memproses..." : "Konfirmasi & Check-In"}
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registrasi Tamu</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Langkah 1: Lengkapi data kunjungan Anda.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Asal Instansi</label>
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
                placeholder="Instansi / Perusahaan"
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
            <div className="mt-2 relative animate-in slide-in-from-top-2 duration-300">
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
          className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] mt-4 shadow-lg shadow-red-600/20"
        >
          Lanjut ke Konfirmasi
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
