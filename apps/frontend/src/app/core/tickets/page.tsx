'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTickets, useEvents, useRegenerateTicket, useEmailTicket, useRegenerateBulkTickets } from '@/lib/hooks';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  BarChart2, RefreshCw, Mail, Ticket,
  Search, ChevronDown, Filter,
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, ClipboardList, XCircle, X
} from 'lucide-react';

import type { Ticket as TicketType } from '@/lib/types';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
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
  );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="py-20 text-center bg-white/60 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400">
          <Ticket size={18} className="stroke-[1.5]" />
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

/* ─── Stats Modal Component ────────────────────────────────────────── */
interface StatsModalProps {
  onClose: () => void;
  stats: {
    total: number;
    active: number;
    used: number;
    cancelled: number;
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
        { name: 'Active', value: stats.active, color: '#10B981' },
        { name: 'Used', value: stats.used, color: '#3B82F6' },
        { name: 'Cancelled', value: stats.cancelled, color: '#EF4444' },
      ].filter(item => item.value > 0)
    : [
        { name: 'No Tickets', value: 1, color: '#F1F5F9' }
      ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[6px] p-6.5 max-w-[340px] w-full border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-950 leading-tight">Ticket Distribution</h2>
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
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">Total Passes</span>
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{total}</span>
          </div>
        </div>

        {/* Metrics List Layout */}
        <div className="space-y-2.5 mt-2 pt-4.5 border-t border-slate-200">
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Active Passes</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.active}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Used Passes</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.used}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Cancelled Passes</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{stats.cancelled}</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200/50 rounded-[6px] text-xs font-semibold transition-all cursor-pointer text-center"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  useEffect(() => {
    if (!initialEventId) {
      router.replace('/core/events');
    }
  }, [initialEventId, router]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState(initialEventId);
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Bulk ticket selection/regeneration states
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const regenerateBulkMutation = useRegenerateBulkTickets();

  if (!initialEventId) {
    return null;
  }

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

  const currentEvent = events.find((ev) => ev.id === (eventFilter || initialEventId));
  const eventTitle = currentEvent?.title || '';

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

  // Clear selections when tickets array updates
  const ticketsKey = tickets.map(t => t.id).join(',');
  useEffect(() => {
    setSelectedTicketIds([]);
  }, [ticketsKey]);

  function handleSelectRow(ticketId: string) {
    setSelectedTicketIds(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId) 
        : [...prev, ticketId]
    );
  }

  function handleSelectAll() {
    if (selectedTicketIds.length === tickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(tickets.map(t => t.id));
    }
  }

  function handleBulkRegenerate() {
    if (selectedTicketIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to regenerate tickets for all ${selectedTicketIds.length} selected participant(s)? This will invalidate their previous entry passes.`)) {
      return;
    }

    regenerateBulkMutation.mutate({
      ticketIds: selectedTicketIds,
      sendEmail: true
    }, {
      onSuccess: () => {
        setSelectedTicketIds([]);
      }
    });
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasFilter = !!(search || statusFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/core/dashboard" className="hover:text-[#FF9900] transition-colors">Admin</Link>
              <span className="text-slate-300">/</span>
              <Link href="/core/events" className="hover:text-[#FF9900] transition-colors">Events</Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Tickets</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none">
                {eventTitle || 'Tickets'}
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-full text-xs font-semibold">
                {totalCount}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              {eventTitle 
                ? 'Manage, verify, and monitor secure entry passes for this event.' 
                : 'Manage, verify, and monitor secure entry passes for registered cloud events.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer font-bold border-none"
            >
              <BarChart2 size={13} />
              Show Stats
            </button>
            <Link
              href="/core/attendance"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer text-decoration-none"
            >
              <ClipboardList size={13} className="text-slate-500" />
              View Attendance
            </Link>
          </div>
        </div>

        {/* ── Unified Tickets Data Table Container ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden flex flex-col relative">
          
          {/* Filters Toolbar */}
          <div className="px-6 py-4 bg-slate-50/20 border-b border-slate-200 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.015)_0%,transparent_55%)] pointer-events-none" />
            
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              {/* Left Group: Search, Event selector, and Status */}
              <div className="flex flex-wrap items-center gap-3 flex-grow">
                {/* Search Input */}
                <div className="relative min-w-[240px] flex-grow md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search tickets by code or attendee name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] font-normal transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>
 
                {/* Event Filter */}
                {!initialEventId && (
                  <div className="relative w-48 shrink-0">
                    <select
                      value={eventFilter}
                      onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                      className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all appearance-none"
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
                <div className="relative w-40 shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all appearance-none"
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
                <button
                  onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
                  className="text-xs font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer shrink-0 border-none bg-transparent"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
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
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={tickets.length > 0 && selectedTicketIds.length === tickets.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] cursor-pointer"
                      />
                    </th>
                    {(['Ticket Code', !(eventFilter || initialEventId) && 'Event', 'Attendee', 'Status', 'Created', 'Actions'].filter(Boolean) as string[]).map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tickets.map((ticket) => {
                    const attendeeName = ticket.registration?.user
                      ? `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`
                      : '—';
                    const isSelected = selectedTicketIds.includes(ticket.id);
                    return (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-slate-50/40 transition-all duration-200 group ${
                          isSelected ? 'bg-orange-50/20 hover:bg-orange-50/30' : ''
                        }`}
                      >
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(ticket.id)}
                            className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] cursor-pointer"
                          />
                        </td>
                        {/* Code */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/50 rounded-[4px] px-2.5 py-1 text-slate-500 font-medium">
                            {ticket.ticketCode}
                          </span>
                        </td>

                        {/* Event */}
                        {!(eventFilter || initialEventId) && (
                          <td className="px-6 py-4.5 max-w-[200px] truncate text-[13px] text-slate-600 font-medium">
                            {ticket.event?.title ?? '—'}
                          </td>
                        )}

                        {/* Attendee */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {attendeeName !== '—' ? (
                            <span className="text-[13.5px] font-semibold text-slate-800">{attendeeName}</span>
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
                          <div className="flex items-center gap-3">
                            {/* Regenerate */}
                            <button
                              onClick={() => handleRegenerate(ticket.id)}
                              disabled={regenerateMutation.isPending}
                              className="text-[12.5px] font-semibold text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                            </button>
                            {/* Email */}
                            <button
                              onClick={() => handleEmail(ticket.id)}
                              disabled={emailMutation.isPending}
                              className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              {emailMutation.isPending ? 'Sending...' : 'Email'}
                            </button>
                          </div>
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
              Showing page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total tickets)
            </p>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
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
                    className={`min-w-[36px] h-9 rounded-[6px] text-[12.5px] font-bold border transition-all flex items-center justify-center cursor-pointer ${
                      p === page
                        ? 'bg-[#232F3E] border-[#232F3E] text-white shadow-sm'
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
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
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

      {/* Stats Modal */}
      {showStatsModal && (
        <StatsModal
          onClose={() => setShowStatsModal(false)}
          stats={{
            total: statsTotal,
            active: statsActive,
            used: statsUsed,
            cancelled: statsCancelled,
          }}
          eventTitle={eventTitle}
        />
      )}
      {/* Floating Bulk Action Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-[6px] shadow-xl z-40 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300 border border-slate-800">
          <span className="text-[12.5px] font-bold tracking-wide text-slate-355">
            {selectedTicketIds.length} ticket(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRegenerate}
              disabled={regenerateBulkMutation.isPending}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-[6px] text-xs tracking-wide transition-all cursor-pointer border-none"
            >
              {regenerateBulkMutation.isPending ? 'Regenerating...' : 'Regenerate Selected'}
            </button>
            <button
              onClick={() => setSelectedTicketIds([])}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors ml-1 cursor-pointer bg-transparent border-none flex items-center justify-center"
              title="Clear selection"
            >
              <X size={15} />
            </button>
          </div>
        </div>
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
