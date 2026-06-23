'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEvents, useAttendance, useVerifyTicket } from '@/lib/hooks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight, Download, Users,
  CheckCircle2, Clock, BarChart2, X, Keyboard, FlipHorizontal
} from 'lucide-react';
import type { Ticket } from '@/lib/types';
import { formatDateTime } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
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
  );
}

/* ─── Stats Modal Component ────────────────────────────────────────── */
interface StatsModalProps {
  onClose: () => void;
  stats: {
    total: number;
    attended: number;
    absent: number;
    rate: number;
  };
  eventTitle: string;
}

function StatsModal({ onClose, stats, eventTitle }: StatsModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = stats.total;

  const chartData = total > 0 
    ? [
        { name: 'Attended', value: stats.attended, color: '#10B981' },
        { name: 'Absent', value: stats.absent, color: '#EF4444' },
      ].filter(item => item.value > 0)
    : [
        { name: 'No Records', value: 1, color: '#F1F5F9' }
      ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6.5 max-w-[340px] w-full border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-950 leading-tight">Attendance Distribution</h2>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1 truncate">
            {eventTitle || 'All Events Overview'}
          </p>
        </div>

        {/* Chart Container */}
        <div className="relative h-48 w-full flex items-center justify-center mb-5">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={78}
                  paddingAngle={total > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]} 
                  contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Center Info Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">Attendance Rate</span>
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{stats.rate}%</span>
          </div>
        </div>

        {/* Metrics List Layout */}
        <div className="space-y-2.5 mt-2 pt-4.5 border-t border-slate-200">
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-600 font-semibold">Total Registered</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Attended</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.attended}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Absent</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.absent}</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200/50 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
        >
          Close
        </button>
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


/* ─── Main Page ─────────────────────────────────────────────────── */
function AttendancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const [eventFilter, setEventFilter] = useState(initialEventId);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'already_scanned' | 'invalid';
    message: string;
  } | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isMirrored, setIsMirrored] = useState(true);

  const lastScannedCode = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const currentEvent = events.find((ev) => ev.id === eventFilter);
  const eventTitle = currentEvent?.title || '';

  const { data, isLoading } = useAttendance({
    page,
    limit: 15,
    ...(eventFilter && { eventId: eventFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  // Query global/filtered statistics based on active filters
  const { data: statsTotalData } = useAttendance({
    limit: 1,
    ...(eventFilter && { eventId: eventFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  const { data: statsAttendedData } = useAttendance({
    limit: 1,
    status: 'attended',
    ...(eventFilter && { eventId: eventFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  const { data: statsAbsentData } = useAttendance({
    limit: 1,
    status: 'absent',
    ...(eventFilter && { eventId: eventFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  const tickets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const statsTotal = statsTotalData?.total ?? 0;
  const statsAttended = statsAttendedData?.total ?? 0;
  const statsAbsent = statsAbsentData?.total ?? 0;
  const attendanceRate = statsTotal > 0 ? Math.round((statsAttended / statsTotal) * 100) : 0;

  const verifyMutation = useVerifyTicket();

  function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    if (!eventFilter) {
      setScanResult({ status: 'invalid', message: 'Please select an event before verifying.' });
      return;
    }
    setScanResult(null);
    verifyMutation.mutate(
      { ticketCode: ticketCode.trim(), scannerId: 'admin', eventId: eventFilter },
      {
        onSuccess: (response) => {
          if (response.valid) {
            setScanResult({ status: 'valid', message: response.status || 'Ticket verified successfully!' });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({ status: 'already_scanned', message: response.status || 'Ticket has already been scanned.' });
            } else if (msg.includes('wrong') || msg.includes('event') || msg.includes('different')) {
              setScanResult({ status: 'invalid', message: 'Ticket belongs to a different event.' });
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

  function handleCameraScan(code: string) {
    if (!code || !code.trim()) return;
    if (!eventFilter) {
      setScanResult({ status: 'invalid', message: 'Please select an event before scanning.' });
      return;
    }
    const now = Date.now();
    if (code === lastScannedCode.current && now - lastScannedTime.current < 2000) return;
    lastScannedCode.current = code;
    lastScannedTime.current = now;

    setScanResult(null);
    verifyMutation.mutate(
      { ticketCode: code.trim(), scannerId: 'admin-camera', eventId: eventFilter },
      {
        onSuccess: (response) => {
          if (response.valid) {
            setScanResult({ status: 'valid', message: response.status || 'Ticket verified successfully!' });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({ status: 'already_scanned', message: response.status || 'Ticket has already been scanned.' });
            } else if (msg.includes('wrong') || msg.includes('event') || msg.includes('different')) {
              setScanResult({ status: 'invalid', message: 'Ticket belongs to a different event.' });
            } else {
              setScanResult({ status: 'invalid', message: response.status || 'Invalid ticket code.' });
            }
          }
        },
        onError: () => {
          setScanResult({ status: 'invalid', message: 'Failed to verify ticket. Please try again.' });
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/core/dashboard" className="hover:text-[#FF9900] transition-colors">Core</Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Attendance</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none">
                {eventTitle || 'All Attendance'}
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-full text-xs font-semibold mr-1">
                {totalCount}
              </span>
              <button
                onClick={() => setShowStatsModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] font-semibold transition-all duration-200 cursor-pointer shadow-sm ml-1.5"
              >
                <BarChart2 size={10.5} className="text-white" />
                Show Stats
              </button>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              {eventTitle 
                ? 'Track, search, and verify real-time event check-ins for this event.' 
                : 'Track, search, and verify real-time event check-ins across all events.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* OD List Button */}
            <button
              onClick={() => {
                if (!eventFilter) {
                  alert("Please select a specific event from the dropdown filter first to generate its OD list.");
                  return;
                }
                router.push(`/core/attendance/od-generator?eventId=${eventFilter}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Download size={13} className="text-slate-500" />
              Generate OD List
            </button>

            {/* Scan Ticket Button */}
            <button
              onClick={() => {
                if (!eventFilter) {
                  alert("Please select a specific event from the dropdown filter first to enable scanning.");
                  return;
                }
                setScanModalOpen(true);
                setScanResult(null);
                setTicketCode('');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg text-[12px] font-semibold transition-all shadow-sm cursor-pointer ${
                eventFilter 
                  ? 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:-translate-y-0.5' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
              title={!eventFilter ? "Please select an event to start scanning" : "Scan Ticket"}
            >
              <QrCode size={13} className={eventFilter ? "text-slate-500" : "text-slate-300"} />
              Scan Ticket
            </button>
          </div>
        </div>


        {/* ── Unified Attendance Data Table Container ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
          
          {/* Filters Toolbar */}
          <div className="px-6 py-4 bg-slate-50/20 border-b border-slate-200 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.015)_0%,transparent_55%)] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Event Filter */}
              <div className="md:col-span-5 relative">
                <select
                  value={eventFilter}
                  onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                  className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
                >
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>

              {/* Date Filter */}
              <div className="md:col-span-4 relative flex items-center gap-2">
                <Calendar size={14} className="text-slate-400 absolute left-3.5" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12.5px] text-slate-600 transition-all cursor-pointer"
                />
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
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
                  className="text-xs font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : tickets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto relative z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,115,187,0.01)_0%,transparent_50%)] pointer-events-none" />
              <table className="min-w-[960px] w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80">
                    {([
                      'Attendee',
                      !eventFilter && 'Event',
                      'Ticket Code',
                      'Scanned At',
                      'Scanner',
                      'Status'
                    ].filter(Boolean) as string[]).map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
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
                            <span className="text-[13.5px] font-semibold text-slate-800">{name}</span>
                          ) : (
                            <span className="text-[13px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Event */}
                        {!eventFilter && (
                          <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-600 font-medium">
                            {ticket.event?.title ?? '—'}
                          </td>
                        )}

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
          )}
        </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setScanModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl p-6.5 max-w-sm w-full shadow-2xl z-10 overflow-hidden flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Dynamic Keyframes for modal scanner laser */}
            <style>{`
              @keyframes laser-sweep {
                0% { top: 4%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 96%; opacity: 0; }
              }
            `}</style>

            {/* Ambient header glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.06)_0%,transparent_60%)] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-700">
                  <QrCode size={16} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Scan Ticket</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {scanMode === 'camera' ? 'Position QR code in front of camera' : 'Enter code to verify check-in'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center text-[10px] font-semibold cursor-pointer border border-transparent hover:border-rose-100"
              >
                ✕
              </button>
            </div>

            {/* Mode Switch Tab Link */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 relative h-9 shrink-0">
              <button
                type="button"
                onClick={() => { setScanMode('camera'); setScanResult(null); }}
                className={`flex-grow text-[11px] font-bold transition-all rounded-md flex items-center justify-center gap-1.5 ${
                  scanMode === 'camera' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode size={13} />
                Camera Scanner
              </button>
              <button
                type="button"
                onClick={() => { setScanMode('manual'); setScanResult(null); }}
                className={`flex-grow text-[11px] font-bold transition-all rounded-md flex items-center justify-center gap-1.5 ${
                  scanMode === 'manual' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Keyboard size={13} />
                Manual Code
              </button>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              {scanMode === 'camera' ? (
                /* Camera Feed Viewport inside Modal */
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-[#101720] overflow-hidden shadow-md flex items-center justify-center border border-slate-200/45">
                    
                    {/* QR Code Scanner Feed */}
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                    >
                      <Scanner
                        onScan={(result: any) => {
                          if (result && result.length > 0 && result[0].rawValue) {
                            handleCameraScan(result[0].rawValue);
                          }
                        }}
                        onError={(error: any) => console.log('Scanner error:', error?.message)}
                        sound={false}
                        components={{ finder: false }}
                        constraints={{ facingMode: 'environment' }}
                        styles={{ container: { width: '100%', height: '100%' } }}
                      />
                    </div>

                    {/* HUD Targets */}
                    <div className="absolute inset-0 pointer-events-none p-3">
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#FF9900] rounded-tl-sm" />
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FF9900] rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FF9900] rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#FF9900] rounded-br-sm" />
                    </div>

                    {/* Mirror/Flip View Option */}
                    <button
                      type="button"
                      onClick={() => setIsMirrored(!isMirrored)}
                      title="Mirror Camera View"
                      className="absolute top-3.5 right-3.5 z-20 bg-slate-900/65 hover:bg-slate-900/85 text-white p-1.5 rounded-lg border border-white/10 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <FlipHorizontal size={13} />
                    </button>

                    {/* Laser Line */}
                    <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-[#FF9900] to-transparent opacity-80 shadow-[0_0_8px_#FF9900] animate-[laser-sweep_2.5s_infinite] pointer-events-none" />
                  </div>
                  
                  {/* Blinking Live Feed Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-bold text-emerald-700 tracking-wide uppercase select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Camera Feed
                  </div>
                </div>
              ) : (
                /* Manual text input */
                <form onSubmit={handleScanSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Ticket Code
                    </label>
                    <input
                      type="text"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      placeholder="e.g. TKT-XXXXXXXXX"
                      autoFocus
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[12.5px] text-slate-700 placeholder-slate-400 transition-all font-mono font-semibold"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setScanModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 bg-white hover:border-slate-300 rounded-xl text-[11px] font-semibold text-slate-500 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifyMutation.isPending || !ticketCode.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-semibold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {verifyMutation.isPending ? 'Verifying…' : 'Verify Ticket'}
                    </button>
                  </div>
                </form>
              )}

              {/* Scan feedback details (Rendered for both camera & manual results) */}
              {scanResult && (
                <div className={`p-3.5 rounded-xl border text-[12px] font-medium flex items-start gap-2.5 transition-all ${
                  scanResult.status === 'valid'
                    ? 'bg-emerald-50/70 border-emerald-100/80 text-emerald-800'
                    : scanResult.status === 'already_scanned'
                    ? 'bg-amber-50/70 border-amber-100/80 text-amber-800'
                    : 'bg-rose-50/70 border-rose-100/80 text-rose-800'
                }`}>
                  <span className="mt-0.5 flex-shrink-0">
                    {scanResult.status === 'valid' && <CheckCircle size={14} className="text-emerald-500" />}
                    {scanResult.status === 'already_scanned' && <AlertTriangle size={14} className="text-amber-500" />}
                    {scanResult.status === 'invalid' && <XCircle size={14} className="text-rose-500" />}
                  </span>
                  <span className="leading-normal">{scanResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Modal ── */}
      {showStatsModal && (
        <StatsModal
          onClose={() => setShowStatsModal(false)}
          stats={{
            total: statsTotal,
            attended: statsAttended,
            absent: statsAbsent,
            rate: attendanceRate,
          }}
          eventTitle={eventTitle}
        />
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] p-8 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading attendance data...</div>
      </div>
    }>
      <AttendancePageContent />
    </Suspense>
  );
}
