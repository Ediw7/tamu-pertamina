"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Clock, ShieldAlert, CheckCircle2, Download, Trash2, Search, Filter, Calendar, ChevronRight } from "lucide-react";
import { Guest } from "@/types/guest";

export default function LiveDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [overstayCount, setOverstayCount] = useState(0);
  
  // States for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterWeek, setFilterWeek] = useState(() => {
    const d = new Date();
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch('/api/guests');
        const data = await response.json();
        if (response.ok) {
          setGuests(data);
          
          const now = new Date().getTime();
          const active = data.filter((g: Guest) => g.status === 'checked_in');
          setActiveCount(active.length);
          
          const overstay = active.filter((g: Guest) => (now - new Date(g.check_in_time).getTime()) > (4 * 60 * 60 * 1000));
          setOverstayCount(overstay.length);
          
          const today = new Date().toDateString();
          const todayGuests = data.filter((g: Guest) => new Date(g.check_in_time).toDateString() === today);
          setTodayCount(todayGuests.length);
          setCompletedCount(todayGuests.filter((g: Guest) => g.status === 'checked_out').length);
        }
      } catch (error) {
        console.error('Failed to fetch guests', error);
      }
    };

    fetchGuests();
    const interval = setInterval(fetchGuests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    const headers = ["Nama", "Instansi", "PIC", "Keperluan", "Masuk", "Keluar", "Status"];
    const rows = filteredGuests.map(g => [
      g.name,
      g.agency,
      g.host || "-",
      g.purpose,
      new Date(g.check_in_time).toLocaleString(),
      g.check_out_time ? new Date(g.check_out_time).toLocaleString() : "-",
      g.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_tamu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleForceCheckout = async (qrCode: string) => {
    if (!confirm("Apakah Anda yakin ingin melakukan Force Check-Out pada tamu ini?")) return;
    
    try {
      const response = await fetch('/api/guests/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode })
      });
      
      if (response.ok) {
        const res = await fetch('/api/guests');
        const data = await res.json();
        setGuests(data);
      } else {
        alert("Gagal melakukan Force Check-Out");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  // ISO Week calculation helper
  const getISOWeek = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.host && guest.host.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || guest.status === statusFilter;

    const checkInDate = new Date(guest.check_in_time);
    let matchesTime = true;

    if (filterType === "daily") {
      matchesTime = checkInDate.toISOString().split('T')[0] === filterDate;
    } else if (filterType === "weekly") {
      matchesTime = getISOWeek(checkInDate) === filterWeek;
    } else if (filterType === "monthly") {
      matchesTime = checkInDate.toISOString().slice(0, 7) === filterMonth;
    } else if (filterType === "yearly") {
      matchesTime = checkInDate.getFullYear().toString() === filterYear;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Live Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Pantau aktivitas pengunjung di area operasional secara real-time.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md shadow-green-500/20"
        >
          <Download className="w-4 h-4" />
          Export CSV ({filteredGuests.length})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Users className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Tamu Aktif Area</h3>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <Users className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{activeCount}</p>
        </div>
        
        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <UserCheck className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Total Hari Ini</h3>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <UserCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{todayCount}</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Tamu Selesai (Keluar)</h3>
            <div className="p-2.5 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{completedCount}</p>
        </div>

        <div className="p-6 bg-white border border-red-100 shadow-[0_4px_20_rgba(239,68,68,0.1)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-red-600">Overstay (&gt;4h)</h3>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-red-600 relative z-10">{overstayCount}</p>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-gray-900">Log Pengunjung</h3>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama/instansi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all w-full md:w-56"
                />
              </div>

              {/* Advanced Filter Group */}
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-gray-700"
                >
                  <option value="all">Semua</option>
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>

                {filterType !== "all" && <ChevronRight className="w-4 h-4 text-gray-300" />}

                {filterType === "daily" && (
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-red-600 cursor-pointer"
                  />
                )}

                {filterType === "weekly" && (
                  <input
                    type="week"
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-red-600 cursor-pointer"
                  />
                )}

                {filterType === "monthly" && (
                  <input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-red-600 cursor-pointer"
                  />
                )}

                {filterType === "yearly" && (
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-red-600 cursor-pointer pr-8"
                  >
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all cursor-pointer font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="checked_in">Di Area</option>
                <option value="checked_out">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Instansi</th>
                <th className="px-6 py-4 font-semibold">PIC</th>
                <th className="px-6 py-4 font-semibold">Keperluan</th>
                <th className="px-6 py-4 font-semibold">Masuk</th>
                <th className="px-6 py-4 font-semibold">Keluar</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data yang ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest: any) => {
                  const checkInTime = new Date(guest.check_in_time).getTime();
                  const now = new Date().getTime();
                  const isOverstay = guest.status === 'checked_in' && (now - checkInTime) > (4 * 60 * 60 * 1000);

                  return (
                    <tr key={guest._id || guest.id} className={`hover:bg-gray-50/50 transition-colors ${isOverstay ? 'bg-red-50/50' : ''}`}>
                      <td className="px-6 py-4 font-medium text-gray-900">{guest.name}</td>
                      <td className="px-6 py-4">{guest.agency}</td>
                      <td className="px-6 py-4 font-medium text-gray-700">{guest.host || "-"}</td>
                      <td className="px-6 py-4">{guest.purpose}</td>
                      <td className="px-6 py-4 font-medium">{new Date(guest.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {guest.status === 'checked_out' && guest.check_out_time
                          ? new Date(guest.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {guest.status === 'checked_in' ? (
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${isOverstay ? 'text-red-700 bg-red-50 border-red-100' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOverstay ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}></span>
                            {isOverstay ? 'Overstay' : 'Di Area'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full border border-gray-200">
                            Selesai
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {guest.status === 'checked_in' && (
                          <button
                            onClick={() => handleForceCheckout(guest.qr_code)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Force Check-Out"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
