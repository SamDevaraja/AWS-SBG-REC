'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegistrations, useEvents } from '@/lib/hooks';
import {
  Download, Eye, XCircle, ClipboardList,
  Search, ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight, Users, Ticket
} from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {['ID', 'Attendee', 'Email', 'Event', 'Date', 'Status', ''].map((h) => (
              <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              {[16, 28, 36, 32, 24, 20, 12].map((w, j) => (
                <td key={j} className="px-6 py-4.5">
                  <div className="h-3.5 rounded bg-slate-100" style={{ width: `${w * 4}px` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="py-20 text-center bg-white/60 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.015)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400 shadow-sm">
          <ClipboardList size={22} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 mb-1">No registrations found</h3>
        <p className="text-[12.5px] text-slate-400 max-w-xs mx-auto">Try adjusting your search query or filters.</p>
      </div>
    </div>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [
    { bg: 'from-cyan-400 to-teal-500', text: 'text-white' },
    { bg: 'from-blue-400 to-indigo-500', text: 'text-white' },
    { bg: 'from-emerald-400 to-teal-500', text: 'text-white' },
    { bg: 'from-rose-400 to-red-500', text: 'text-white' },
    { bg: 'from-purple-400 to-violet-500', text: 'text-white' },
    { bg: 'from-[#0073BB] to-[#005d96]', text: 'text-white' },
  ];
  const p = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.bg} ${p.text} flex items-center justify-center text-[10.5px] font-black shrink-0 shadow-sm border border-white`}>
      {initials}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
function RegistrationsPageContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState(initialEventId);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useRegistrations({
    page,
    limit: 15,
    search: search || undefined,
    ...(statusFilter && { status: statusFilter }),
    ...(eventFilter && { eventId: eventFilter }),
    ...(dateFrom && { startDate: dateFrom }),
    ...(dateTo && { endDate: dateTo }),
  });

  const registrations = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  function handleExportCsv() {
    const rows = [['ID', 'Name', 'Email', 'Event', 'Date', 'Status']];
    registrations.forEach((r) => {
      rows.push([r.id, r.name, r.email, r.event?.title ?? '', formatDate(r.registrationDate), r.status]);
    });
    const csv = rows.map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registrations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasActiveFilter = !!(search || statusFilter || eventFilter || dateFrom || dateTo);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow (matches services explorer) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.05)_0%,transparent_55%)] pointer-events-none z-0" />
      
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">
        
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin · Registrations</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                Registrations
              </h1>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200/60 px-3 py-0.5 text-xs font-bold text-slate-600">
                {totalCount}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 font-normal mt-2">
              Manage and monitor all event registrations across the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/core/tickets"
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[13px] font-medium transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Ticket size={14} className="text-[#FF9900]" />
              View Tickets
            </Link>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-medium transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>



        {/* ── Unified Registrations Data Table Container ── */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden flex flex-col relative">
          
          {/* Filters Toolbar */}
          <div className="px-6 py-5 bg-slate-50/20 border-b border-slate-100 flex flex-col gap-4 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.01)_0%,transparent_55%)] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Input */}
              <div className={`${initialEventId ? 'md:col-span-9' : 'md:col-span-6'} relative`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search registrations by attendee name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] font-normal transition-all text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Event Dropdown */}
              {!initialEventId && (
                <div className="md:col-span-3 relative">
                  <select
                    value={eventFilter}
                    onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
                  >
                    <option value="">All Events</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              )}

              {/* Status Dropdown */}
              <div className="md:col-span-3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Date Filters & Clear button */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100/80">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Registration Date Range</span>
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-lg text-xs text-slate-600 transition-all cursor-pointer"
                />
                <span className="text-slate-400 text-xs font-medium">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-lg text-xs text-slate-600 transition-all cursor-pointer"
                />
              </div>

              {hasActiveFilter && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                  className="text-xs font-bold text-[#FF9900] hover:text-orange-600 transition-colors underline underline-offset-4 decoration-2 cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-grow">
            {isLoading ? (
              <LoadingSkeleton />
            ) : registrations.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,115,187,0.005)_0%,transparent_50%)] pointer-events-none" />
                <div className="overflow-x-auto relative z-10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {['ID', 'Attendee', 'Email', 'Event', 'Date', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/70">
                      {registrations.map((reg) => (
                        <tr
                          key={reg.id}
                          className="hover:bg-slate-50/40 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1 text-slate-500 font-medium">
                              {reg.id.length > 8 ? reg.id.slice(0, 8) + '…' : reg.id}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar name={reg.name} />
                              <span className="text-[13.5px] font-bold text-slate-800">{reg.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-500">
                            {reg.email}
                          </td>
                          <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-600 font-medium">
                            {reg.event?.title ?? '—'}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-[13px] text-slate-500">
                            {formatDate(reg.registrationDate)}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <StatusBadge status={reg.status} />
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/registrations/${reg.id}`}
                                title="View Details"
                                className="p-2 rounded-lg bg-slate-50 border border-slate-200/40 text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
                              >
                                <Eye size={14} />
                              </Link>
                              {reg.status !== 'CANCELLED' && (
                                <Link
                                  href={`/registrations/${reg.id}?action=cancel`}
                                  title="Cancel Registration"
                                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/40 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                >
                                  <XCircle size={14} />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Pagination inside unified container */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/30 border-t border-slate-100 relative z-10">
              <p className="text-[12px] text-slate-400 font-medium">
                Showing page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total registrations)
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer font-bold"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {pages.map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`el-${idx}`} className="text-slate-400 text-xs px-2 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[36px] h-9 rounded-xl text-[12.5px] font-bold border transition-all flex items-center justify-center cursor-pointer ${
                        p === page
                          ? 'bg-gradient-to-r from-[#FF9900] to-[#F7BA45] border-[#FF9900] text-white shadow-sm shadow-orange-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer font-bold"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
          <p className="text-sm text-slate-500">Loading registrations...</p>
        </div>
      </div>
    }>
      <RegistrationsPageContent />
    </Suspense>
  );
}
