'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents, useAttendance, useVerifyTicket } from '@/lib/hooks';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight, Download, Users,
  CheckCircle2, Clock
} from 'lucide-react';
import type { Ticket } from '@/lib/types';
import { formatDateTime } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Attendee', 'Event', 'Ticket Code', 'Scanned At', 'Scanner', 'Status'].map((h) => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[28, 32, 24, 28, 20, 16].map((w, j) => (
                  <td key={j} className="px-6 py-4.5">
                    <div className="h-3.5 rounded bg-slate-100" style={{ width: `${w * 4}px` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="border border-dashed border-slate-200/80 rounded-2xl p-16 text-center bg-white/60 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.025)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400">
          <QrCode size={22} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 mb-1">No attendance records found</h3>
        <p className="text-[12.5px] text-slate-400 max-w-xs mx-auto">Scan a ticket or adjust your filters to view results.</p>
      </div>
    </div>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [
    { bg: 'from-amber-400 to-orange-500', text: 'text-white' },
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

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function AttendancePage() {
  const router = useRouter();
  const [eventFilter, setEventFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'already_scanned' | 'invalid';
    message: string;
  } | null>(null);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useAttendance({
    page,
    limit: 15,
    ...(eventFilter && { eventId: eventFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  const tickets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const attendedTickets = tickets.filter((t) => t.status === 'USED' || t.scannedAt);
  const attendanceRate = tickets.length > 0 ? Math.round((attendedTickets.length / tickets.length) * 100) : 0;

  const verifyMutation = useVerifyTicket();

  function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    setScanResult(null);
    verifyMutation.mutate(
      { ticketCode: ticketCode.trim(), scannerId: 'admin' },
      {
        onSuccess: (response) => {
          if (response.valid) {
            setScanResult({ status: 'valid', message: response.status || 'Ticket verified successfully!' });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({ status: 'already_scanned', message: response.status || 'Ticket has already been scanned.' });
            } else {
              setScanResult({ status: 'invalid', message: response.status || 'Invalid ticket code.' });
            }
          }
          setTicketCode('');
        },
        onError: () => {
          setScanResult({ status: 'invalid', message: 'Failed to verify ticket. Please try again.' });
          setTicketCode('');
        },
      },
    );
  }

  function getAttendeeName(ticket: Ticket): string {
    if (ticket.registration?.user) {
      return `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`;
    }
    return '—';
  }

  function isAttended(ticket: Ticket): boolean {
    return ticket.status === 'USED' || !!ticket.scannedAt;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasFilter = !!(eventFilter || dateFilter || statusFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-10 px-10 overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.05)_0%,transparent_55%)] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* ── Header Card ── */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          {/* Ambient background glow inside the header card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.08)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-3 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin · Attendance</span>
              </div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                  Attendance
                </h1>
                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200/60 px-3 py-0.5 text-xs font-bold text-slate-600">
                  {totalCount}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 font-normal mt-2">
                Track, search, and verify real-time event check-ins.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* OD List Button */}
              <button
                onClick={() => {
                  if (!eventFilter) {
                    alert("Please select a specific event from the dropdown filter first to generate its OD list.");
                    return;
                  }
                  router.push(`/core/attendance/od-generator?eventId=${eventFilter}`);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer"
              >
                <Download size={14} />
                Generate OD List
              </button>

              {/* Scan Ticket Button */}
              <button
                onClick={() => { setScanModalOpen(true); setScanResult(null); setTicketCode(''); }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold transition-all shadow-md hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer"
              >
                <QrCode size={14} />
                Scan Ticket
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(0,115,187,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
              <Users size={18} className="group-hover:text-[#0073BB] transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Registered</span>
              <span className="text-xl font-bold text-slate-800">{totalCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
              <CheckCircle2 size={18} className="group-hover:text-emerald-500 transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Attended</span>
              <span className="text-xl font-bold text-slate-800">
                {attendedTickets.length} <span className="text-[10px] text-slate-400 font-normal">on page</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors">
              <XCircle size={18} className="group-hover:text-rose-500 transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Absent</span>
              <span className="text-xl font-bold text-slate-800">
                {tickets.length - attendedTickets.length} <span className="text-[10px] text-slate-400 font-normal">on page</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
              <Clock size={18} className="group-hover:text-[#FF9900] transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Attendance Rate</span>
              <span className="text-xl font-bold text-slate-800">{attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* ── Filters Panel Card ── */}
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.015)_0%,transparent_55%)] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Event Filter */}
            <div className="md:col-span-5 relative">
              <select
                value={eventFilter}
                onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
              >
                <option value="">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* Date filter */}
            <div className="md:col-span-4 relative flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 absolute left-3.5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12.5px] text-slate-600 transition-all cursor-pointer"
              />
            </div>

            {/* Status filter */}
            <div className="md:col-span-3 relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          {hasFilter && (
            <div className="relative z-10 flex justify-end pt-2 border-t border-slate-100/80">
              <button
                onClick={() => { setEventFilter(''); setDateFilter(''); setStatusFilter(''); setPage(1); }}
                className="text-xs font-bold text-[#FF9900] hover:text-orange-600 transition-colors underline underline-offset-4 decoration-2 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ── Table Grid Card ── */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,115,187,0.01)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Attendee', 'Event', 'Ticket Code', 'Scanned At', 'Scanner', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {tickets.map((ticket) => {
                    const name = getAttendeeName(ticket);
                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-slate-50/40 transition-all duration-200 group"
                      >
                        {/* Attendee */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {name !== '—' ? (
                            <div className="flex items-center gap-3">
                              <Avatar name={name} />
                              <span className="text-[13.5px] font-bold text-slate-800">{name}</span>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Event */}
                        <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-600 font-medium">
                          {ticket.event?.title ?? '—'}
                        </td>

                        {/* Ticket Code */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1 text-slate-500 font-medium">
                            {ticket.ticketCode}
                          </span>
                        </td>

                        {/* Scanned At */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-[13px] text-slate-500">
                          {ticket.scannedAt ? formatDateTime(ticket.scannedAt) : '—'}
                        </td>

                        {/* Scanner */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-[13px] text-slate-500">
                          {ticket.scannerId ?? '—'}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <StatusBadge status={isAttended(ticket) ? 'ATTENDED' : 'ABSENT'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
            <p className="text-[12px] text-slate-400 font-medium">
              Showing page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total records)
            </p>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
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
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Scan Ticket Modal Redesign ── */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setScanModalOpen(false)} />
          <div className="relative bg-white border border-slate-100 rounded-3xl p-8 max-w-md w-full shadow-2xl z-10 overflow-hidden flex flex-col gap-6">
            
            {/* Ambient header glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.06)_0%,transparent_60%)] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-700">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">Scan Ticket</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enter code to verify check-in</p>
                </div>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center text-xs font-semibold cursor-pointer border border-transparent hover:border-rose-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScanSubmit} className="relative z-10 flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Ticket Code
                </label>
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="e.g. TKT-XXXXXXXXX"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-slate-700 placeholder-slate-400 transition-all font-mono font-semibold"
                />
              </div>

              {/* Scan feedback details */}
              {scanResult && (
                <div className={`p-4 rounded-xl border text-[12.5px] font-medium flex items-start gap-3 transition-all ${
                  scanResult.status === 'valid'
                    ? 'bg-emerald-50/70 border-emerald-100/80 text-emerald-800'
                    : scanResult.status === 'already_scanned'
                    ? 'bg-amber-50/70 border-amber-100/80 text-amber-800'
                    : 'bg-rose-50/70 border-rose-100/80 text-rose-800'
                }`}>
                  <span className="mt-0.5 flex-shrink-0">
                    {scanResult.status === 'valid' && <CheckCircle size={15} className="text-emerald-500" />}
                    {scanResult.status === 'already_scanned' && <AlertTriangle size={15} className="text-amber-500" />}
                    {scanResult.status === 'invalid' && <XCircle size={15} className="text-rose-500" />}
                  </span>
                  <span>{scanResult.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setScanModalOpen(false)}
                  className="px-4.5 py-2.5 border border-slate-200 bg-white hover:border-slate-300 rounded-xl text-[12px] font-semibold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyMutation.isPending || !ticketCode.trim()}
                  className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  {verifyMutation.isPending ? 'Verifying…' : 'Verify Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
