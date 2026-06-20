'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCrewEvents } from '@/lib/hooks';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  QrCode,
  ClipboardList,
} from 'lucide-react';
import type { Event, EventStatus, EventMode } from '@/lib/types';
import { getPosterSrcAndPosition } from '@/lib/utils';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string; dot: string }> = {
    DRAFT:               { label: 'Draft',               className: 'bg-slate-500/10 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    PUBLISHED:           { label: 'Published',           className: 'bg-blue-500/10 text-blue-700 border-blue-500/20', dot: 'bg-blue-500' },
    REGISTRATION_OPEN:   { label: 'Registration Open',   className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', dot: 'bg-emerald-500' },
    REGISTRATION_CLOSED: { label: 'Reg. Closed',         className: 'bg-amber-500/10 text-amber-700 border-amber-500/20', dot: 'bg-amber-500' },
    ONGOING:             { label: 'Ongoing',             className: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20', dot: 'bg-[#d87c00]' },
    COMPLETED:           { label: 'Completed',           className: 'bg-slate-500/10 text-slate-650 border-slate-500/20', dot: 'bg-slate-400' },
    ARCHIVED:            { label: 'Archived',            className: 'bg-rose-500/10 text-rose-600 border-rose-500/20', dot: 'bg-slate-400' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-500/10 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
}

function categoryConfig(category: string) {
  const map: Record<string, { label: string; className: string }> = {
    Technology: { label: 'Technology', className: 'bg-orange-500/10 text-[#FF9900] border-[#FF9900]/20' },
    Workshop:   { label: 'Workshop',   className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    Bootcamp:   { label: 'Bootcamp',   className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    DevOps:     { label: 'DevOps',     className: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  };
  return map[category] ?? { label: category, className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE:  { label: 'Online',  className: 'bg-violet-50 text-violet-750 border-violet-100' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-50 text-[#d87c00] border-orange-100' },
    HYBRID:  { label: 'Hybrid',  className: 'bg-cyan-50 text-cyan-750 border-cyan-100' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-50 text-slate-500 border-slate-100' };
  return map[mode] ?? { label: mode, className: 'bg-slate-50 text-slate-500 border-slate-100' };
}

/* ── Loading Skeleton ─────────────────────────────────────────── */
function LoadingSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-slate-200 bg-white rounded-[6px] overflow-hidden animate-pulse shadow-sm">
            <div className="bg-slate-100 h-44" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-slate-100 rounded-[4px]" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 rounded-[4px]" />
                <div className="h-5 w-16 bg-slate-100 rounded-[4px]" />
              </div>
              <div className="h-3.5 w-24 bg-slate-100 rounded-[4px]" />
              <div className="h-3.5 w-32 bg-slate-100 rounded-[4px]" />
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <div className="h-8 flex-1 bg-slate-100 rounded-[6px]" />
                <div className="h-8 w-10 bg-slate-100 rounded-[6px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="border border-slate-200 bg-white rounded-[6px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {['Event', 'Date', 'Venue', 'Status', 'Registered', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold text-slate-505 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[32, 24, 28, 20, 10, 4].map((w, j) => (
                  <td key={j} className="px-5 py-3.5">
                    <div className="h-3.5 bg-slate-100 rounded-[4px]" style={{ width: `${w * 4}px` }} />
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

/* ── Empty State ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="border border-dashed border-slate-200 rounded-[6px] p-14 text-center max-w-sm mx-auto my-8 bg-slate-50/50">
      <div className="mx-auto bg-white border border-slate-200 w-12 h-12 rounded-[6px] flex items-center justify-center mb-4 shadow-sm">
        <ImageIcon className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="text-[14px] font-semibold text-slate-800 mb-1">No events found</h3>
      <p className="text-[12.5px] text-slate-400 mb-5">There are no operational events assigned or matching your search.</p>
    </div>
  );
}

export default function AssignedEventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});
  
  const [canCreateEvent, setCanCreateEvent] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const userId = parsed.id;
        if (userId) {
          fetch(`/api/auth/permissions/check?userId=${userId}&permission=create_event`)
            .then((res) => res.json())
            .then((data) => setCanCreateEvent(!!data.hasPermission))
            .catch((err) => console.error(err));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const { data: rawEvents, isLoading } = useCrewEvents();

  const toggleRowExpansion = useCallback((eventId: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  }, []);

  // Filter events client-side
  const filteredEvents = (rawEvents ?? []).filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || event.category === category;
    const matchesStatus = !statusFilter || event.status === statusFilter;
    const matchesMode = !modeFilter || event.mode === modeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMode;
  });

  const limit = 12;
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / limit));
  
  // Reset page when filters change to avoid out of bounds page numbers
  useEffect(() => {
    setPage(1);
  }, [search, category, statusFilter, modeFilter]);

  const paginatedEvents = filteredEvents.slice((page - 1) * limit, page * limit);

  const selectCls = "appearance-none pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12.5px] text-slate-655 cursor-pointer transition-all";

  return (
    <div className="min-h-screen w-full bg-white text-[#1A1C1E] relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-505 mb-2.5">
              <Link href="/crew/dashboard" className="hover:text-[#FF9900] transition-colors font-semibold">Crew</Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Events</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none m-0">
                Assigned Events
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-[4px] text-xs font-semibold">
                {filteredEvents.length}
              </span>
            </div>
            <p className="text-[13px] text-slate-505 font-normal mt-2.5">
              Browse, monitor, and scan tickets for all operational assignments and event setups.
            </p>
          </div>
          
          {canCreateEvent && (
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/crew/events/create"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer text-decoration-none"
              >
                <Plus size={13} />
                Create Event (Delegated)
              </Link>
            </div>
          )}
        </div>

        {/* ── Filters + View Toggle ── */}
        <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Category */}
            <div className="relative shrink-0">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Workshop">Workshop</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="DevOps">DevOps</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Status */}
            <div className="relative shrink-0">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Mode */}
            <div className="relative shrink-0">
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className={selectCls}>
                <option value="">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear */}
            {(search || category || statusFilter || modeFilter) && (
              <button onClick={() => { setSearch(''); setCategory(''); setStatusFilter(''); setModeFilter(''); }}
                className="text-[12px] font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent shrink-0">
                Clear
              </button>
            )}

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px] border border-slate-200 shrink-0">
              {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} title={`${mode} view`}
                  className={`p-1.5 rounded-[4px] transition-all cursor-pointer border-none ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-655 bg-transparent'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'grid' ? (

          /* ── Grid View ── */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event) => {
              const sc = statusConfig(event.status as EventStatus);
              const mc = modeConfig(event.mode);
              const regCount = event.attendeeCount ?? event.registrations?.length ?? 0;
              const capacity = event.capacity;
              const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.posterImage);
              return (
                <div key={event.id} className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#FF9900]/70 hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.22)] hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col relative">
                  {/* Poster */}
                  <div className="h-48 w-full relative bg-slate-900 overflow-hidden rounded-t-[6px]">
                    <img
                      src={imgPosterSrc}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                      style={{ objectPosition: imgPosterPosition }}
                    />
                  </div>
                  {/* Body */}
                  <div className="p-5 pt-4 flex-1 flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                      {/* Title */}
                      <h3 className="text-[18px] font-bold text-slate-850 leading-snug tracking-tight hover:text-[#FF9900] transition-colors line-clamp-2" title={event.title}>
                        {event.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide border ${sc.className}`}>
                          {sc.label}
                        </span>
                        {event.category && (() => {
                          const cat = categoryConfig(event.category);
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border ${cat.className}`}>
                              {cat.label}
                            </span>
                          );
                        })()}

                      </div>

                      {/* Date & Venue */}
                      <div className="flex flex-col gap-1.5 text-[13px] text-slate-555">
                        {event.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                            <span className="font-medium text-slate-600">{formatDate(event.date)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-555">{event.time || '09:30 AM'}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                            <span className="truncate text-slate-600 font-medium" title={event.venue}>{event.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200 flex flex-col gap-3.5 mt-auto">
                    {/* Remaining Seats */}
                    {capacity != null && (() => {
                      const remaining = Math.max(0, capacity - regCount);
                      let statusCls = "bg-slate-500/10 text-slate-700 border-slate-500/20";
                      let dotColor = "bg-slate-450";
                      if (remaining === 0) {
                        statusCls = "bg-rose-500/10 text-rose-700 border-rose-500/20";
                        dotColor = "bg-rose-500";
                      } else if (remaining <= 20) {
                        statusCls = "bg-amber-500/10 text-amber-700 border-amber-500/20";
                        dotColor = "bg-amber-500";
                      } else {
                        statusCls = "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
                        dotColor = "bg-emerald-500";
                      }
                      
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>Seats Remaining</span>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-bold border ${statusCls}`}>
                            <span className={`h-1.5 w-1.5 rounded-[2px] ${dotColor}`} />
                            {remaining}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Footer / Buttons */}
                    <div className="flex items-center justify-between gap-2.5">
                      <Link href={`/crew/events/${event.id}`}
                        style={{ background: '#232F3E' }}
                        className="flex-grow py-2 text-white font-bold text-[12.5px] rounded-[6px] hover:opacity-95 hover:shadow-lg hover:shadow-slate-900/10 transition-all duration-200 text-center text-decoration-none flex items-center justify-center gap-1.5">
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      
                      <Link href={`/crew/scanner?eventId=${event.id}`}
                        style={{ background: '#ffffff', border: '1.5px solid rgba(35,47,62,0.22)' }}
                        className="p-2.5 text-[#232F3E] hover:text-[#FF9900] hover:border-[#FF9900]/40 rounded-[6px] transition-all duration-200 flex items-center justify-center text-decoration-none"
                        title="Scanner">
                        <QrCode className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ── List View ── */
          <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[960px] divide-y divide-slate-200">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 bg-slate-50/80 px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 items-center">
                  <div className="col-span-3">Event</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-3">Venue</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Registered</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                {/* Rows */}
                {paginatedEvents.map((event) => {
                  const sc = statusConfig(event.status as EventStatus);
                  const regCount = event.attendeeCount ?? event.registrations?.length ?? 0;
                  const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.posterImage);
                  return (
                    <div
                      key={event.id}
                      className={`group border-b border-slate-200 last:border-b-0 transition-all duration-300 ${
                        expandedEventIds[event.id] ? 'bg-slate-50/55' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Main Column Grid */}
                      <div 
                        onClick={() => toggleRowExpansion(event.id)}
                        className="grid grid-cols-12 gap-4 items-center px-5 py-4 cursor-pointer"
                      >
                        {/* Event Info */}
                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-[6px] bg-slate-900 shrink-0 overflow-hidden border border-slate-200/50 shadow-sm relative group-hover:scale-102 transition-transform duration-300">
                            <img src={imgPosterSrc} alt={event.title} className="w-full h-full object-cover" style={{ objectPosition: imgPosterPosition }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-[13px] group-hover:text-[#FF9900] transition-colors truncate" title={event.title}>{event.title}</p>
                            {event.category && (() => {
                              const cat = categoryConfig(event.category);
                              return (
                                <span className={`inline-block rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase mt-0.5 tracking-wider border ${cat.className}`}>
                                  {cat.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 min-w-0">
                          {event.date ? (
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-[4px] bg-slate-50 border border-slate-200 text-slate-400 shrink-0">
                                <Calendar size={11.5} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-700 text-[12px] truncate">{formatDate(event.date)}</span>
                                <span className="text-slate-400 text-[10.5px] truncate">{event.time || '09:30 AM'}</span>
                              </div>
                            </div>
                          ) : '—'}
                        </div>

                        {/* Venue */}
                        <div className="col-span-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-[4px] bg-slate-50 border border-slate-200 text-slate-400 shrink-0">
                              <MapPin size={11.5} />
                            </div>
                            <span className="text-[12px] text-slate-600 font-semibold truncate" title={event.venue}>{event.venue || '—'}</span>
                          </div>
                        </div>

                        {/* Status / Mode / Assigned Role */}
                        <div className="col-span-2 flex flex-col gap-1">
                          <div className="flex flex-wrap gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide border ${sc.className}`}>{sc.label}</span>
                          </div>
                        </div>

                        {/* Registered */}
                        <div className="col-span-1 min-w-0">
                          <div className="flex flex-col gap-1 inline-flex w-full">
                            <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-slate-400" />
                              <span className="text-[12.5px] font-bold text-slate-705">{regCount}</span>
                              {event.capacity && (
                                <span className="text-slate-400 text-[11px] font-normal">/ {event.capacity}</span>
                              )}
                            </div>
                            {event.capacity && event.capacity > 0 && (
                              <div className="w-20 h-1 bg-slate-100 rounded-[2px] overflow-hidden">
                                <div 
                                  className="h-full bg-[#FF9900] rounded-[2px] transition-all duration-300" 
                                  style={{ width: `${Math.min((regCount / event.capacity) * 100, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                            <Link 
                              href={`/crew/events/${event.id}`}
                              className="p-1.5 text-slate-500 hover:text-[#FF9900] hover:bg-slate-50 rounded-[6px] border border-slate-200 transition-all cursor-pointer"
                              title="Details"
                            >
                              <ChevronRight size={13.5} />
                            </Link>
                            <Link 
                              href={`/crew/scanner?eventId=${event.id}`}
                              className="p-1.5 text-slate-500 hover:text-[#FF9900] hover:bg-slate-50 rounded-[6px] border border-slate-200 transition-all cursor-pointer"
                              title="Scanner"
                            >
                              <QrCode size={13.5} />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details Container */}
                      <div 
                        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedEventIds[event.id] 
                            ? 'grid-rows-[1fr] opacity-100' 
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="min-h-0">
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/30 text-slate-605">
                            <div className="grid grid-cols-12 gap-6 text-[12.5px]">
                              {/* Left column: Overview / Details */}
                              <div className="col-span-7 space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <ClipboardList size={12} className="text-[#FF9900]" />
                                    About the Event
                                  </h4>
                                  <p className="text-slate-605 leading-relaxed font-normal">
                                    {event.description || event.shortDescription || 'No detailed description provided for this event.'}
                                  </p>
                                </div>
                                
                                {event.speakers && event.speakers.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">Speakers</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {event.speakers.map((speaker: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-[6px] px-2.5 py-1">
                                          {speaker.photo ? (
                                            <img src={speaker.photo} alt={speaker.name} className="w-5 h-5 rounded-[4px] object-cover" />
                                          ) : (
                                            <div className="w-5 h-5 rounded-[4px] bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                              {speaker.name[0]}
                                            </div>
                                          )}
                                          <div className="leading-none">
                                            <span className="font-semibold text-slate-700 text-[11.5px]">{speaker.name}</span>
                                            {speaker.role && (
                                              <span className="text-slate-400 text-[10px] ml-1.5">({speaker.role})</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Center column: Agenda / Event flow if exists */}
                              <div className="col-span-5 border-l border-slate-200/80 pl-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                  <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={12} className="text-[#FF9900]" />
                                    Event Settings
                                  </h4>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
                                    <div>
                                      <span className="block text-slate-400 text-[10.5px]">Attendance Mode</span>
                                      <span className={`inline-block font-semibold text-[11px] px-2 py-0.5 rounded-[4px] border mt-0.5 ${modeConfig(event.mode).className}`}>
                                        {modeConfig(event.mode).label}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block text-slate-400 text-[10.5px]">Registration Form</span>
                                      <span className="font-bold text-slate-705 mt-0.5 inline-block capitalize">{event.registrationFormType?.toLowerCase() || '—'}</span>
                                    </div>
                                    {event.registrationDeadline && (
                                      <div className="col-span-2">
                                        <span className="block text-slate-400 text-[10.5px]">Registration Deadline</span>
                                        <span className="font-semibold text-slate-700 mt-0.5 inline-block">
                                          {formatDate(event.registrationDeadline)} at {new Date(event.registrationDeadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4">
                                  <Link href={`/crew/events/${event.id}`}
                                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11.5px] rounded-[6px] text-center transition-colors text-decoration-none">
                                    View Details
                                  </Link>
                                  <Link href={`/crew/scanner?eventId=${event.id}`}
                                    className="flex-1 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white font-bold text-[11.5px] rounded-[6px] text-center transition-colors text-decoration-none">
                                    Scanner
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && filteredEvents.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-[12px] text-slate-400 font-medium">
              Page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-350 text-slate-505 hover:text-slate-800 disabled:opacity-40 transition-all cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`el-${idx}`} className="text-slate-400 text-xs px-2 select-none">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`min-w-[36px] h-9 rounded-[6px] text-[12.5px] font-bold border transition-all flex items-center justify-center cursor-pointer ${p === page
                        ? 'bg-[#232F3E] border-[#232F3E] text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-350 text-slate-505 hover:text-slate-800 disabled:opacity-40 transition-all cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
