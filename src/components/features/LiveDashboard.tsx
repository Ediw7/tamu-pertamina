"use client";

import { useState, useEffect } from "react";
import {
  Users, UserCheck, Clock, ShieldAlert, CheckCircle2, Download,
  Trash2, Search, Filter, Calendar, ChevronRight, BarChart3, PieChart, Activity
} from "lucide-react";
import { Guest } from "@/types/guest";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function LiveDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [overstayCount, setOverstayCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
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
          const active = data.filter((g: any) => g.status === 'CHECKED_IN');
          setActiveCount(active.length);

          const overstay = active.filter((g: any) => (now - new Date(g.check_in_time).getTime()) > (4 * 60 * 60 * 1000));
          setOverstayCount(overstay.length);

          const today = new Date().toDateString();
          const todayGuests = data.filter((g: any) => new Date(g.check_in_time).toDateString() === today);
          setTodayCount(todayGuests.length);
          setCompletedCount(todayGuests.filter((g: any) => g.status === 'CHECKED_OUT').length);
        }
      } catch (error) {
        console.error('Failed to fetch guests', error);
      }
    };

    fetchGuests();
    const interval = setInterval(fetchGuests, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, filterType, filterDate, filterWeek, filterMonth, filterYear]);

  const handleExportCSV = () => {
    const headers = ["Nama", "Instansi", "Alamat Instansi", "PIC", "Keperluan", "Masuk", "Keluar", "Status"];
    const rows = filteredGuests.map(g => [
      g.name,
      g.agency,
      g.agency_address || "-",
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

  const getISOWeek = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
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

  // Pagination logic
  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Analytics Data Processing ---

  // 1. Hourly Arrival Distribution
  const hourlyData = Array(24).fill(0);
  filteredGuests.forEach(g => {
    const hour = new Date(g.check_in_time).getHours();
    hourlyData[hour]++;
  });

  // 2. Purpose Distribution
  const purposeCounts: Record<string, number> = {};
  filteredGuests.forEach(g => {
    purposeCounts[g.purpose] = (purposeCounts[g.purpose] || 0) + 1;
  });

  // 3. Average Duration (for checked_out guests)
  const completedGuests = filteredGuests.filter(g => g.status === 'CHECKED_OUT' && g.check_out_time);
  const totalDuration = completedGuests.reduce((acc, g) => {
    const duration = new Date(g.check_out_time!).getTime() - new Date(g.check_in_time).getTime();
    return acc + duration;
  }, 0);
  const avgDurationMinutes = completedGuests.length > 0 ? Math.round(totalDuration / completedGuests.length / (1000 * 60)) : 0;

  // Chart Colors
  const colors = [
    'rgba(239, 68, 68, 0.8)', // red
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(16, 185, 129, 0.8)', // emerald
    'rgba(245, 158, 11, 0.8)', // amber
    'rgba(139, 92, 246, 0.8)', // violet
    'rgba(236, 72, 153, 0.8)', // pink
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Live Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 font-medium">Monitoring Real-Time & Business Intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border ${showAnalytics
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            {showAnalytics ? <Activity className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            {showAnalytics ? "Tampilkan Tabel" : "Analitik"}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md shadow-green-500/20"
          >
            <Download className="w-4 h-4" />
            Export CSV ({filteredGuests.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Tamu Aktif Area</h3>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <Users className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{activeCount}</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Total Tamu</h3>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <UserCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{filteredGuests.length}</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500">Rata-rata Durasi</h3>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 relative z-10">{avgDurationMinutes} <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Min</span></p>
        </div>

        <div className="p-6 bg-white border border-red-100 shadow-[0_4px_20_rgba(239,68,68,0.1)] rounded-2xl relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-red-600">Overstay (&gt;4h)</h3>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-red-600 relative z-10">{overstayCount}</p>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-600" /> Filter Data
          </h3>

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
              <option value="CHECKED_IN">Di Area</option>
              <option value="CHECKED_OUT">Selesai</option>
            </select>

            {/* Items Per Page */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all cursor-pointer font-bold text-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {!showAnalytics ? (
        <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" /> Log Pengunjung ({filteredGuests.length})
            </h3>
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
                  paginatedGuests.map((guest: any) => {
                    const checkInTime = new Date(guest.check_in_time).getTime();
                    const now = new Date().getTime();
                    const isOverstay = guest.status === 'CHECKED_IN' && (now - checkInTime) > (4 * 60 * 60 * 1000);

                    return (
                      <tr key={guest._id || guest.id} className={`hover:bg-gray-50/50 transition-colors ${isOverstay ? 'bg-red-50/50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{guest.name}</td>
                        <td className="px-6 py-4">{guest.agency}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{guest.host || "-"}</td>
                        <td className="px-6 py-4">{guest.purpose}</td>
                        <td className="px-6 py-4 font-medium">{new Date(guest.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {guest.status === 'CHECKED_OUT' && guest.check_out_time
                            ? new Date(guest.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {guest.status === 'CHECKED_IN' ? (
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
                          {guest.status === 'CHECKED_IN' && (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 font-medium">
                Menampilkan <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredGuests.length)}</span> dari <span className="font-bold text-gray-900">{filteredGuests.length}</span> data
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Basic pagination window logic
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                  }
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${currentPage === pageNum
                        ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Hourly Arrivals Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" /> Waktu Kedatangan Terpadat
            </h3>
            <div className="h-[300px]">
              <Bar
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                  datasets: [{
                    label: 'Jumlah Tamu',
                    data: hourlyData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderRadius: 8,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>

          {/* Purpose Distribution Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" /> Distribusi Kategori Tamu
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <Pie
                data={{
                  labels: Object.keys(purposeCounts),
                  datasets: [{
                    data: Object.values(purposeCounts),
                    backgroundColor: colors,
                    borderWidth: 0,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } }
                  }
                }}
              />
            </div>
          </div>

          {/* Tips for Thesis Panel */}
          <div className="lg:col-span-2 p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white shadow-xl">
            <h4 className="font-bold text-lg mb-2">Insight Business Intelligence (BI)</h4>
            <p className="text-red-50 text-sm opacity-90 leading-relaxed">
              Analitik di atas menunjukkan bahwa waktu puncak kunjungan adalah pukul <strong>{hourlyData.indexOf(Math.max(...hourlyData))}:00</strong>.
              Mayoritas tamu datang dengan keperluan <strong>{Object.entries(purposeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}</strong>.
              Data ini dapat digunakan manajemen Pertamina untuk mengoptimalkan jumlah petugas keamanan pada jam-jam sibuk tersebut.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
