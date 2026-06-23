'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRegistrations, useEvents, useGenerateBulkTickets } from '@/lib/hooks';
import {
  Download, Eye, XCircle, ClipboardList,
  Search, ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight, Users, Ticket, X, FilterX
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400">
          <ClipboardList size={18} className="stroke-[1.5]" />
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

  // Bulk ticket selection/generation states
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [sendEmailOption, setSendEmailOption] = useState(true);
  const [createAnnouncementOption, setCreateAnnouncementOption] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const generateMutation = useGenerateBulkTickets();

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

  const currentEvent = events.find((ev) => ev.id === (eventFilter || initialEventId));
  const eventTitle = currentEvent?.title || '';

  const registrations = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  function handleSelectRow(regId: string) {
    setSelectedRegIds(prev =>
      prev.includes(regId)
        ? prev.filter(id => id !== regId)
        : [...prev, regId]
    );
  }

  function handleSelectAll() {
    if (selectedRegIds.length === registrations.length) {
      setSelectedRegIds([]);
    } else {
      setSelectedRegIds(registrations.map(r => r.id));
    }
  }

  function handleOpenGenerateModal(all: boolean) {
    setIsGeneratingAll(all);
    setShowGenerateModal(true);
  }

  function handleGenerateTickets() {
    const eventId = eventFilter || initialEventId;
    if (!eventId) return;

    generateMutation.mutate({
      eventId,
      registrationIds: isGeneratingAll ? undefined : selectedRegIds,
      sendEmail: sendEmailOption,
      createAnnouncement: createAnnouncementOption,
    }, {
      onSuccess: () => {
        setSelectedRegIds([]);
        setShowGenerateModal(false);
      }
    });
  }

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
              <span className="text-[#FF9900] font-semibold">Registrations</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none">
                {eventTitle || 'Registrations'}
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-full text-xs font-semibold">
                {totalCount}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              {eventTitle 
                ? 'Manage and monitor registrations for this event.' 
                : 'Manage and monitor all event registrations across the platform.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0 relative">
            {/* Specific Event View actions */}
            {(eventFilter || initialEventId) ? (
              <>
                <button
                  onClick={() => handleOpenGenerateModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <Ticket size={13} />
                  Release Event Passes
                </button>

                {/* More Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    Actions
                    <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${showActionsDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showActionsDropdown && (
                    <>
                      {/* Backdrop for closing */}
                      <div className="fixed inset-0 z-30" onClick={() => setShowActionsDropdown(false)} />
                      
                      <div className="absolute right-0 mt-1.5 w-44 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-lg shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] z-40 p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                        <Link
                          href={`/core/tickets?eventId=${eventFilter || initialEventId}`}
                          onClick={() => setShowActionsDropdown(false)}
                          className="group flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all duration-150 w-full text-left"
                        >
                          <Eye size={14} className="text-slate-400 group-hover:text-slate-650 transition-colors duration-150" />
                          View Tickets
                        </Link>
                        
                        <div className="h-px bg-slate-100/70 my-1 mx-1" />
                        
                        <button
                          onClick={() => {
                            handleExportCsv();
                            setShowActionsDropdown(false);
                          }}
                          className="group flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all duration-150 w-full text-left cursor-pointer border-none bg-transparent"
                        >
                          <Download size={14} className="text-slate-400 group-hover:text-slate-650 transition-colors duration-150" />
                          Export CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Overall Registrations View actions */}
                <Link
                  href="/core/attendance"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <ClipboardList size={13} className="text-slate-500" />
                  Attendance
                </Link>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download size={13} />
                  Export CSV
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Unified Registrations Data Table Container ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden flex flex-col relative">
          
          {/* Filters Toolbar */}
          <div className="px-6 py-4 bg-slate-50/20 border-b border-slate-200 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.01)_0%,transparent_55%)] pointer-events-none" />
            
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              {/* Left Group: Search, Event selector, Status, and Date Range */}
              <div className="flex flex-wrap items-center gap-3 flex-grow">
                {/* Search Input */}
                <div className="relative min-w-[240px] flex-grow md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search registrations by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] font-normal transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Event Dropdown */}
                {!initialEventId && (
                  <div className="relative w-48 shrink-0">
                    <select
                      value={eventFilter}
                      onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                      className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all appearance-none"
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
                <div className="relative w-40 shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>

                {/* Date range filter */}
                <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-[6px] px-3 py-1.5 transition-all focus-within:bg-white focus-within:border-[#FF9900] shrink-0">
                  <Calendar size={13} className="text-[#FF9900] shrink-0" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer border-none p-0 w-28"
                  />
                  <span className="text-slate-400 text-[10px] font-medium shrink-0">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="bg-transparent text-[11px] text-slate-600 focus:outline-none cursor-pointer border-none p-0 w-28"
                  />
                </div>
              </div>

              {/* Right Group: Clear filters */}
              {hasActiveFilter && (
                !initialEventId ? (
                  // Event dropdown is visible → compact icon button
                  <button
                    onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                    className="text-xs font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer shrink-0 border-none bg-transparent"
                  >
                    Clear
                  </button>
                ) : (
                  // No event dropdown → text label
                  <button
                    onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                    className="text-xs font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer shrink-0 border-none bg-transparent"
                  >
                    Clear filters
                  </button>
                )
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
                <div className="relative z-10 overflow-x-auto w-full">
                  <table className="w-full min-w-[960px] text-left border-collapse table-fixed">
                    <colgroup>
                      {(eventFilter || initialEventId) ? (
                        // Event-specific view: checkbox | Attendee | Email | Date | Status | Ticket | Actions
                        <>
                          <col style={{ width: '4%' }} />
                          <col style={{ width: '17%' }} />
                          <col style={{ width: '22%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '26%' }} />
                          <col style={{ width: '9%' }} />
                        </>
                      ) : (
                        // All-registrations view: Attendee | Email | Event | Date | Status | Ticket | Actions
                        <>
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '22%' }} />
                          <col style={{ width: '19%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                          <col style={{ width: '8%' }} />
                        </>
                      )}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80">
                        {(eventFilter || initialEventId) && (
                          <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={registrations.length > 0 && selectedRegIds.length === registrations.length}
                              onChange={handleSelectAll}
                              className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendee</th>
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                        {!(eventFilter || initialEventId) && <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event</th>}
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket Pass</th>
                        <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {registrations.map((reg) => {
                        const isSelected = selectedRegIds.includes(reg.id);
                        return (
                          <tr
                            key={reg.id}
                            className={`hover:bg-slate-50/40 transition-all duration-200 group ${
                              isSelected ? 'bg-orange-50/20 hover:bg-orange-50/30' : ''
                            }`}
                          >
                            {(eventFilter || initialEventId) && (
                              <td className="px-4 py-3.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(reg.id)}
                                  className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] cursor-pointer"
                                />
                              </td>
                            )}
                            {/* Attendee */}
                            <td className="px-4 py-3.5">
                              <span title={reg.name} className="text-[13px] font-semibold text-slate-800 block truncate cursor-default">{reg.name}</span>
                            </td>
                            {/* Email */}
                            <td className="px-4 py-3.5">
                              <span title={reg.email} className="text-[12.5px] text-slate-500 block truncate cursor-default">{reg.email}</span>
                            </td>
                            {/* Event (only in all-registrations view) */}
                            {!(eventFilter || initialEventId) && (
                              <td className="px-4 py-3.5">
                                <span title={reg.event?.title ?? ''} className="text-[12.5px] text-slate-600 font-medium block truncate cursor-default">{reg.event?.title ?? '—'}</span>
                              </td>
                            )}
                            {/* Date */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="text-[12.5px] text-slate-500">{formatDate(reg.registrationDate)}</span>
                            </td>
                            {/* Status */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <StatusBadge status={reg.status} />
                            </td>
                            {/* Ticket Pass */}
                            <td className="px-4 py-3.5">
                              {reg.ticket ? (
                                <span title={reg.ticket.ticketCode} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 max-w-full overflow-hidden cursor-default">
                                  <Ticket size={10} className="shrink-0" />
                                  <span className="truncate">{reg.ticket.ticketCode}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200/60 whitespace-nowrap">
                                  Not Released
                                </span>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {reg.status !== 'CANCELLED' ? (
                                <Link
                                  href={`/core/registrations/${reg.id}?action=cancel`}
                                  className="text-[12px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                                >
                                  Cancel
                                </Link>
                              ) : (
                                <span className="text-[12px] text-slate-400 font-medium">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Pagination inside unified container */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/30 border-t border-slate-200 relative z-10">
              <p className="text-[12px] text-slate-400 font-medium">
                Showing page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total registrations)
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer font-bold"
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
                  className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer font-bold"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedRegIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white px-5 py-3 rounded-[6px] shadow-2xl z-40 flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-300 border border-slate-850">
          <span className="text-[12px] font-semibold text-slate-300 whitespace-nowrap">
            {selectedRegIds.length} {selectedRegIds.length === 1 ? 'registration' : 'registrations'} selected
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenGenerateModal(false)}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-950 font-semibold rounded-[6px] text-xs transition-all shadow-sm cursor-pointer border-none"
            >
              Release Selected Passes
            </button>
            
            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            <button
              onClick={() => setSelectedRegIds([])}
              className="p-1 text-slate-450 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Release Passes Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-205">
          <div className="bg-white rounded-[6px] p-6.5 max-w-[390px] w-full border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative animate-in zoom-in-95 duration-200 text-[#1A1C1E]">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-655 transition-colors p-1 cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>
            
            <div className="mb-5">
              <div className="w-9 h-9 rounded-[6px] bg-orange-50 border border-orange-100 flex items-center justify-center mb-3.5 text-[#FF9900]">
                <Ticket size={16} />
              </div>
              <h2 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                {isGeneratingAll ? 'Release All Passes' : 'Release Selected Passes'}
              </h2>
              <p className="text-[13px] text-slate-500 mt-2 font-normal leading-relaxed">
                {isGeneratingAll 
                  ? 'Generate secure event entry passes for all registered and confirmed participants.'
                  : `Generate secure event entry passes for the ${selectedRegIds.length} selected participant${selectedRegIds.length === 1 ? '' : 's'}.`
                }
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4 mb-5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmailOption}
                  onChange={(e) => setSendEmailOption(e.target.checked)}
                  className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] mt-0.5 shrink-0 cursor-pointer w-4 h-4"
                />
                <div>
                  <span className="block text-[13.5px] font-semibold text-slate-800 leading-tight">Email ticket passes</span>
                  <span className="block text-[11.5px] text-slate-500 font-normal mt-1 leading-normal">Send entry credentials to participants immediately</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createAnnouncementOption}
                  onChange={(e) => setCreateAnnouncementOption(e.target.checked)}
                  className="rounded border-slate-350 text-[#FF9900] focus:ring-[#FF9900] mt-0.5 shrink-0 cursor-pointer w-4 h-4"
                />
                <div>
                  <span className="block text-[13.5px] font-semibold text-slate-800 leading-tight">Post event announcement</span>
                  <span className="block text-[11.5px] text-slate-500 font-normal mt-1 leading-normal">Notify attendees via a public announcement on this platform</span>
                </div>
              </label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-grow py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 border border-slate-200/50 rounded-[6px] text-[13px] font-semibold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTickets}
                disabled={generateMutation.isPending}
                className="flex-grow py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[6px] text-[13px] font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 border-none"
              >
                {generateMutation.isPending ? 'Generating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
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
