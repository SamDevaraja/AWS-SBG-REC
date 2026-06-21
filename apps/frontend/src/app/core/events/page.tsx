'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvents, useDeleteEvent } from '@/lib/hooks';
import * as api from '@/lib/api';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Globe,
  XCircle,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Ticket,
  ClipboardList,
  CheckCircle,
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
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT:               { label: 'Draft',               className: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    PUBLISHED:           { label: 'Published',           className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    REGISTRATION_OPEN:   { label: 'Registration Open',   className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    REGISTRATION_CLOSED: { label: 'Reg. Closed',         className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    ONGOING:             { label: 'Ongoing',             className: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' },
    COMPLETED:           { label: 'Completed',           className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    ARCHIVED:            { label: 'Archived',            className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-500/10 text-slate-600 border-slate-200' };
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
    ONLINE:  { label: 'Online',  className: 'bg-violet-50 text-violet-700 border-violet-100' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    HYBRID:  { label: 'Hybrid',  className: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-50 text-slate-500 border-slate-100' };
  return map[mode] ?? { label: mode, className: 'bg-slate-50 text-slate-500 border-slate-100' };
}

/* ── Actions Dropdown ─────────────────────────────────────────── */
function ActionsDropdown({
  event,
  onAction,
}: {
  event: Event;
  onAction: (action: string, eventId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const canPublish = event.status === 'DRAFT';
  const canCloseRegistration = event.status === 'REGISTRATION_OPEN' || event.status === 'PUBLISHED';
  const canArchive = !['ARCHIVED', 'COMPLETED', 'DRAFT'].includes(event.status);
  const canDelete = ['DRAFT', 'ARCHIVED'].includes(event.status);
  const canComplete = !['COMPLETED', 'ARCHIVED', 'DRAFT'].includes(event.status);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`h-8 w-8 rounded-[6px] hover:bg-slate-100 active:bg-slate-200/80 transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none ${open ? 'bg-slate-100 text-[#FF9900]' : 'text-slate-500'}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-[6px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.1)] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 origin-top-right">
          {[
            { action: 'edit', icon: Edit, label: 'Edit Event', show: true },
          ].filter(i => i.show).map(({ action, icon: Icon, label }) => (
            <button key={action} onClick={() => { onAction(action, event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              {label}
            </button>
          ))}

          {canPublish && (
            <button onClick={() => { onAction('publish', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              Publish
            </button>
          )}
          {canCloseRegistration && (
            <button onClick={() => { onAction('closeRegistration', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <XCircle className="h-3.5 w-3.5 text-slate-400" />
              Close Registration
            </button>
          )}
          {canComplete && (
            <button onClick={() => { onAction('complete', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
              Complete Event
            </button>
          )}
          {canArchive && (
            <button onClick={() => { onAction('archive', event.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Archive className="h-3.5 w-3.5 text-slate-400" />
              Archive
            </button>
          )}
          {canDelete && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { onAction('delete', event.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
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
              {['Event', 'Date', 'Venue', 'Status', 'Registrations', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
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
      <p className="text-[12.5px] text-slate-400 mb-5">Get started by creating your first event.</p>
      <Link href="/core/events/create"
        className="inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-[6px] text-[12.5px] font-semibold px-4 py-2.5 hover:bg-slate-800 shadow-sm transition">
        <Plus className="h-3.5 w-3.5" />
        Create Event
      </Link>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = useCallback((eventId: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  }, []);

  const queryClient = useQueryClient();

  const { data, isLoading } = useEvents({
    page, limit: 12,
    search: search || undefined,
    ...(category && { category }),
    ...(statusFilter && { status: statusFilter }),
    ...(modeFilter && { mode: modeFilter }),
  });

  const deleteEventMutation = useDeleteEvent();
  const archiveMutation = useMutation({ mutationFn: (id: string) => api.archiveEvent(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const publishMutation = useMutation({ mutationFn: (id: string) => api.publishEvent(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const closeRegistrationMutation = useMutation({ mutationFn: (id: string) => api.closeRegistration(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });
  const completeMutation = useMutation({ mutationFn: (id: string) => api.updateEvent(id, { status: 'COMPLETED' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });

  const handleAction = useCallback((action: string, eventId: string) => {
    switch (action) {
      case 'edit': router.push(`/core/events/edit/${eventId}`); break;
      case 'publish': publishMutation.mutate(eventId); break;
      case 'archive': archiveMutation.mutate(eventId); break;
      case 'closeRegistration': closeRegistrationMutation.mutate(eventId); break;
      case 'complete': completeMutation.mutate(eventId); break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this event?')) deleteEventMutation.mutate(eventId);
        break;
    }
  }, [router, publishMutation, archiveMutation, closeRegistrationMutation, deleteEventMutation, completeMutation]);

  const events = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const selectCls = "appearance-none pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all";

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#1A1C1E] relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 z-10 relative">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/core/dashboard" className="hover:text-[#FF9900] transition-colors font-semibold">Admin</Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Events</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none m-0">
                Events
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-[4px] text-xs font-semibold">
                {data?.total ?? 0}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              Create, manage, and track all community activities, registrations, and scheduling configurations.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/core/registrations"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer text-decoration-none"
            >
              <ClipboardList size={13} className="text-slate-500" />
              All Registrations
            </Link>
            <Link
              href="/core/events/create"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer text-decoration-none"
            >
              <Plus size={13} />
              Create Event
            </Link>
          </div>
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Category */}
            <div className="relative shrink-0">
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className={selectCls}>
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
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Mode */}
            <div className="relative shrink-0">
              <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1); }} className={selectCls}>
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
              <button onClick={() => { setSearch(''); setCategory(''); setStatusFilter(''); setModeFilter(''); setPage(1); }}
                className="text-[12px] font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent shrink-0">
                Clear
              </button>
            )}

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px] border border-slate-200 shrink-0">
              {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} title={`${mode} view`}
                  className={`p-1.5 rounded-[4px] transition-all cursor-pointer border-none ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650 bg-transparent'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'grid' ? (

          /* ── Grid View ── */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const sc = statusConfig(event.status);
              const mc = modeConfig(event.mode);
              const regCount = event.registrations?.length ?? 0;
              const capacity = event.capacity;
              const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.posterImage);
              return (
                <div key={event.id} className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#FF9900]/70 hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.22)] hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col relative">
                  {/* Poster (Premium full-bleed cover image) */}
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

                    {/* Title & Details Group wrapper */}
                    <div className="flex flex-col gap-3">
                      {/* Header with Title and Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[18px] font-bold text-slate-850 leading-snug tracking-tight hover:text-[#FF9900] transition-colors line-clamp-2" title={event.title}>
                          {event.title}
                        </h3>
                        <div className="shrink-0 pt-0.5">
                          <ActionsDropdown event={event} onAction={handleAction} />
                        </div>
                      </div>

                      {/* Badges Row (Status, Category) */}
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

                      {/* Date & Venue details */}
                      <div className="flex flex-col gap-1.5 text-[13px] text-slate-500">
                        {event.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                            <span className="font-medium text-slate-600">{formatDate(event.date)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">{event.time || '09:30 AM'}</span>
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

                  {/* Card Footer Container */}
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
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/core/registrations?eventId=${event.id}`}
                        className="flex-1 h-10 bg-[#232F3E] hover:bg-[#1a232f] text-white font-semibold text-sm rounded-lg transition-all duration-200 text-decoration-none flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
                        <Users className="h-4 w-4" />
                        <span>Registrations</span>
                      </Link>
                      
                      <Link href={`/core/tickets?eventId=${event.id}`}
                        className="group flex-1 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-355 text-slate-700 font-semibold text-sm rounded-lg transition-all duration-200 text-decoration-none flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98]">
                        <Ticket className="h-4 w-4 text-slate-500 group-hover:scale-105 transition-transform" />
                        <span>View Tickets</span>
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
                  <div className="col-span-1">Registrations</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                 {/* Rows */}
                 {events.map((event) => {
                   const sc = statusConfig(event.status);
                   const regCount = event.registrations?.length ?? 0;
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

                        {/* Status */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide border ${sc.className}`}>{sc.label}</span>
                        </div>

                        {/* Registrations */}
                        <div className="col-span-1 min-w-0">
                          <Link 
                            href={`/core/registrations?eventId=${event.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex flex-col gap-1 hover:opacity-85 transition-opacity inline-flex w-full"
                          >
                            <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-slate-400" />
                              <span className="text-[12.5px] font-bold text-slate-700">{regCount}</span>
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
                          </Link>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                            <Link 
                              href={`/core/tickets?eventId=${event.id}`}
                              className="p-1.5 text-slate-500 hover:text-[#FF9900] hover:bg-slate-50 rounded-[6px] border border-slate-200 transition-all cursor-pointer"
                              title="View Tickets"
                            >
                              <Ticket size={13.5} />
                            </Link>
                            <ActionsDropdown event={event} onAction={handleAction} />
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
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/30 text-slate-600">
                            <div className="grid grid-cols-12 gap-6 text-[12.5px]">
                              {/* Left column: Overview / Details */}
                              <div className="col-span-7 space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <ClipboardList size={12} className="text-[#FF9900]" />
                                    About the Event
                                  </h4>
                                  <p className="text-slate-600 leading-relaxed font-normal">
                                    {event.description || event.shortDescription || 'No detailed description provided for this event.'}
                                  </p>
                                </div>
                                
                                {event.speakers && event.speakers.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">Speakers</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {event.speakers.map((speaker, idx) => (
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
                                      <span className="font-bold text-slate-700 mt-0.5 inline-block capitalize">{event.registrationFormType?.toLowerCase()}</span>
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
                                  <Link href={`/core/events/edit/${event.id}`}
                                    className="group flex-1 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-[11.5px] rounded-[6px] transition-all duration-200 text-decoration-none flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-[0.98]">
                                    <Edit className="h-3.5 w-3.5 text-slate-400 group-hover:scale-105 transition-transform" />
                                    <span>Edit Event</span>
                                  </Link>
                                  <Link href={`/core/registrations?eventId=${event.id}`}
                                    className="flex-1 h-8 bg-[#232F3E] hover:bg-[#1a232f] text-white font-semibold text-[11.5px] rounded-[6px] transition-all duration-200 text-decoration-none flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Registrations</span>
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
        {!isLoading && events.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-[12px] text-slate-400 font-medium">
              Page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all cursor-pointer">
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
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
