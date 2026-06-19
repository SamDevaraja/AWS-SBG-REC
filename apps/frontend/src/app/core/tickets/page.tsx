'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTickets, useEvents, useRegenerateTicket, useEmailTicket } from '@/lib/hooks';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import {
  Eye, RefreshCw, Mail, Ticket,
  Search, ChevronDown, Filter,
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, ClipboardList
} from 'lucide-react';
import type { Ticket as TicketType } from '@/lib/types';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Ticket Code', 'Event', 'Attendee', 'Status', 'Created', ''].map((h) => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[20, 32, 28, 16, 20, 15].map((w, j) => (
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
          <Ticket size={22} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 mb-1">No tickets found</h3>
        <p className="text-[12.5px] text-slate-400 max-w-xs mx-auto">Try adjusting your search query or filters.</p>
      </div>
    </div>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────── */
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

/* ─── Main Page ─────────────────────────────────────────────────── */
function TicketsPageContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState(initialEventId);
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useTickets({
    page,
    limit: 15,
    search: search || undefined,
    ...(statusFilter && { status: statusFilter }),
    ...(eventFilter && { eventId: eventFilter }),
  });

  // Query global/filtered statistics based on active event filters
  const { data: statsTotalData } = useTickets({
    limit: 1,
    ...(eventFilter && { eventId: eventFilter }),
  });

  const { data: statsActiveData } = useTickets({
    limit: 1,
    status: 'ACTIVE',
    ...(eventFilter && { eventId: eventFilter }),
  });

  const { data: statsUsedData } = useTickets({
    limit: 1,
    status: 'USED',
    ...(eventFilter && { eventId: eventFilter }),
  });

  const { data: statsCancelledData } = useTickets({
    limit: 1,
    status: 'CANCELLED',
    ...(eventFilter && { eventId: eventFilter }),
  });

  const tickets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const statsTotal = statsTotalData?.total ?? 0;
  const statsActive = statsActiveData?.total ?? 0;
  const statsUsed = statsUsedData?.total ?? 0;
  const statsCancelled = statsCancelledData?.total ?? 0;

  const regenerateMutation = useRegenerateTicket();
  const emailMutation = useEmailTicket();

  function handleRegenerate(ticketId: string) { regenerateMutation.mutate(ticketId); }
  function handleEmail(ticketId: string) { emailMutation.mutate(ticketId); }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasFilter = !!(search || statusFilter || eventFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.05)_0%,transparent_55%)] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin · Tickets</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                Tickets
              </h1>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200/60 px-3 py-0.5 text-xs font-bold text-slate-600">
                {totalCount}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 font-normal mt-2">
              Manage, verify, and monitor secure entry passes for registered cloud events.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/core/attendance"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer"
            >
              <ClipboardList size={14} className="text-[#FF9900]" />
              View Attendance
            </Link>
          </div>
        </div>


        {/* ── Stats Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(0,115,187,0.04)_0%,transparent_60%)] animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
              <Ticket size={18} className="group-hover:text-[#0073BB] transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Tickets</span>
              <span className="text-xl font-bold text-slate-800">{statsTotal}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
              <CheckCircle2 size={18} className="group-hover:text-emerald-500 transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Active</span>
              <span className="text-xl font-bold text-slate-800">{statsActive}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
              <Clock size={18} className="group-hover:text-amber-500 transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Used</span>
              <span className="text-xl font-bold text-slate-800">{statsUsed}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-slate-200/80 hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.04)_0%,transparent_60%)]" />
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors">
              <AlertTriangle size={18} className="group-hover:text-rose-500 transition-colors" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Cancelled</span>
              <span className="text-xl font-bold text-slate-800">{statsCancelled}</span>
            </div>
          </div>
        </div>

        {/* ── Filters Panel Card ── */}
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.015)_0%,transparent_55%)] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className={`${initialEventId ? 'md:col-span-9' : 'md:col-span-6'} relative`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search tickets by code or attendee name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] font-normal transition-all text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Event Filter */}
            {!initialEventId && (
              <div className="md:col-span-3 relative">
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
            )}

            {/* Status Filter */}
            <div className="md:col-span-3 relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="USED">Used</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          {hasFilter && (
            <div className="relative z-10 flex justify-end pt-2 border-t border-slate-100/80">
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setPage(1); }}
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
                    {['Ticket Code', 'Event', 'Attendee', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {tickets.map((ticket) => {
                    const attendeeName = ticket.registration?.user
                      ? `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`
                      : '—';
                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-slate-50/40 transition-all duration-200 group"
                      >
                        {/* Code */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1 text-slate-500 font-medium">
                            {ticket.ticketCode}
                          </span>
                        </td>

                        {/* Event */}
                        <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-600 font-medium">
                          {ticket.event?.title ?? '—'}
                        </td>

                        {/* Attendee */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {attendeeName !== '—' ? (
                            <div className="flex items-center gap-3">
                              <Avatar name={attendeeName} />
                              <span className="text-[13.5px] font-bold text-slate-800">{attendeeName}</span>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <StatusBadge status={ticket.status} />
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-[13px] text-slate-500">
                          {formatDate(ticket.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              title="View Pass"
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200/40 text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                            >
                              <Eye size={14} />
                            </button>
                            {/* Regenerate */}
                            <button
                              onClick={() => handleRegenerate(ticket.id)}
                              disabled={regenerateMutation.isPending}
                              title="Regenerate Ticket"
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200/40 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all disabled:opacity-40 cursor-pointer"
                            >
                              <RefreshCw size={14} className={regenerateMutation.isPending ? 'animate-spin' : ''} />
                            </button>
                            {/* Email */}
                            <button
                              onClick={() => handleEmail(ticket.id)}
                              disabled={emailMutation.isPending}
                              title="Send Ticket Email"
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200/40 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-40 cursor-pointer"
                            >
                              <Mail size={14} />
                            </button>
                          </div>
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
              Showing page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total tickets)
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRegenerate={(id) => { handleRegenerate(id); setSelectedTicket(null); }}
          onEmail={(id) => { handleEmail(id); setSelectedTicket(null); }}
        />
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
          <p className="text-sm text-slate-500">Loading tickets...</p>
        </div>
      </div>
    }>
      <TicketsPageContent />
    </Suspense>
  );
}
