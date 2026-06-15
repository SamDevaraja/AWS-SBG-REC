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
} from 'lucide-react';
import type { Event, EventStatus, EventMode } from '@/lib/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    PUBLISHED: { label: 'Published', className: 'bg-blue-100 text-blue-700' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'bg-emerald-100 text-emerald-700' },
    REGISTRATION_CLOSED: { label: 'Registration Closed', className: 'bg-amber-100 text-amber-700' },
    ONGOING: { label: 'Ongoing', className: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-600' },
  };
  return map[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'bg-violet-100 text-violet-700' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-100 text-orange-700' },
    HYBRID: { label: 'Hybrid', className: 'bg-cyan-100 text-cyan-700' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-100 text-slate-500' };
  return map[mode] || { label: mode, className: 'bg-slate-100 text-slate-500' };
}

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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const canPublish = event.status === 'DRAFT';
  const canCloseRegistration = event.status === 'REGISTRATION_OPEN' || event.status === 'PUBLISHED';
  const canArchive =
    event.status !== 'ARCHIVED' && event.status !== 'COMPLETED' && event.status !== 'DRAFT';
  const canDelete = event.status === 'DRAFT' || event.status === 'ARCHIVED';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-[8px] hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-slate-200 rounded-[8px] shadow-lg py-1">
          <button
            onClick={() => {
              onAction('edit', event.id);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </button>
          {canPublish && (
            <button
              onClick={() => {
                onAction('publish', event.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              <Globe className="h-3.5 w-3.5" />
              Publish
            </button>
          )}
          {canCloseRegistration && (
            <button
              onClick={() => {
                onAction('closeRegistration', event.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              <XCircle className="h-3.5 w-3.5" />
              Close Registration
            </button>
          )}
          {canArchive && (
            <button
              onClick={() => {
                onAction('archive', event.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          )}
          {canDelete && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onAction('delete', event.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden animate-pulse"
          >
            <div className="bg-slate-900 h-40" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-4 w-16 rounded-[6px] bg-slate-100" />
                <div className="h-4 w-16 rounded-[6px] bg-slate-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-slate-100" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-slate-100" />
                <div className="h-3 w-32 rounded bg-slate-100" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-3 w-16 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Venue
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Registrations
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-slate-100 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-20 rounded-[6px] bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-10 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-4 rounded bg-slate-100 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-slate-300 rounded-[10px] p-12 text-center">
      <div className="mx-auto bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <ImageIcon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-800 mb-1">No events found</h3>
      <p className="text-xs text-slate-500 mb-4">Get started by creating your first event.</p>
      <Link
        href="/core/events/create"
        className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
      >
        <Plus className="h-3.5 w-3.5" />
        Create Event
      </Link>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading } = useEvents({
    page,
    limit: 12,
    search: search || undefined,
    ...(category && { category }),
    ...(statusFilter && { status: statusFilter }),
    ...(modeFilter && { mode: modeFilter }),
  });

  const deleteEventMutation = useDeleteEvent();

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.archiveEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.publishEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const closeRegistrationMutation = useMutation({
    mutationFn: (id: string) => api.closeRegistration(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const handleAction = useCallback(
    (action: string, eventId: string) => {
      switch (action) {
        case 'edit':
          router.push(`/core/events/edit/${eventId}`);
          break;
        case 'publish':
          publishMutation.mutate(eventId);
          break;
        case 'archive':
          archiveMutation.mutate(eventId);
          break;
        case 'closeRegistration':
          closeRegistrationMutation.mutate(eventId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this event?')) {
            deleteEventMutation.mutate(eventId);
          }
          break;
      }
    },
    [router, publishMutation, archiveMutation, closeRegistrationMutation, deleteEventMutation],
  );

  const events = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Events</h1>
          <Link
            href="/core/events/create"
            className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Event
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-slate-200 rounded-[8px] text-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              >
                <option value="">All Categories</option>
                <option value="Workshop">Workshop</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="AI/ML">AI/ML</option>
                <option value="DevOps">DevOps</option>
                <option value="Analytics">Analytics</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Mode Filter */}
            <div className="relative">
              <select
                value={modeFilter}
                onChange={(e) => {
                  setModeFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              >
                <option value="">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex border border-slate-200 rounded-[8px] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-[#232F3E] text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition ${
                  viewMode === 'list'
                    ? 'bg-[#232F3E] text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const sc = statusConfig(event.status);
              const mc = modeConfig(event.mode);
              const regCount = event.registrations?.length ?? 0;
              const seatsLeft = event.capacity != null ? event.capacity - regCount : null;

              return (
                <div
                  key={event.id}
                  className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {/* Poster */}
                  <div className="bg-slate-900 h-40 flex items-center justify-center relative">
                    <img
                      src={event.posterImage || '/default-event-poster.png'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <ActionsDropdown event={event} onAction={handleAction} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {event.category && (
                        <span className="inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#232F3E]/10 text-[#232F3E]">
                          {event.category}
                        </span>
                      )}
                      <span
                        className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${mc.className}`}
                      >
                        {mc.label}
                      </span>
                    </div>

                    {event.date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                    )}

                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <span
                        className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="h-3 w-3" />
                        {regCount}
                        {seatsLeft != null && (
                          <span className="text-slate-400">/ {event.capacity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => {
                    const sc = statusConfig(event.status);
                    const regCount = event.registrations?.length ?? 0;

                    return (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={event.posterImage || '/default-event-poster.png'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                              {event.category && (
                                <span className="inline-block rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[#232F3E]/10 text-[#232F3E] mt-0.5">
                                  {event.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {event.date ? formatDate(event.date) : '—'}
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                          {event.venue || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${sc.className}`}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">{regCount}</td>
                        <td className="px-5 py-3">
                          <ActionsDropdown event={event} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && events.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[32px] h-8 rounded-[8px] text-xs font-medium transition ${
                        p === page
                          ? 'bg-[#232F3E] text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
