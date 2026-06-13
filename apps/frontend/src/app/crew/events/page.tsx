'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCrewEvents } from '@/lib/hooks';
import { Search, Calendar, MapPin, Users, QrCode, Info, Image as ImageIcon } from 'lucide-react';
import type { EventStatus, EventMode } from '@/lib/types';

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

export default function AssignedEventsPage() {
  const [search, setSearch] = useState('');
  const { data: events, isLoading } = useCrewEvents();

  const filteredEvents = (events ?? []).filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">Assigned Events</h1>
          <p className="text-sm text-slate-500">
            Browse and monitor the events you are assigned to as operational staff
          </p>
        </div>

        {/* Search */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assigned events by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-[8px] text-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden animate-pulse"
              >
                <div className="bg-slate-200 h-40" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-50" />
                  <div className="h-4 w-2/3 rounded bg-slate-50" />
                  <div className="h-8 w-full rounded bg-slate-100 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white rounded-[10px] p-12 text-center">
            <div className="mx-auto bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-800 mb-1">No assigned events found</h3>
            <p className="text-xs text-slate-500">
              There are no operational events matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const sc = statusConfig(event.status as EventStatus);
              const mc = modeConfig(event.mode);

              return (
                <div
                  key={event.id}
                  className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Poster */}
                    <div className="bg-slate-900 h-40 flex items-center justify-center relative">
                      {event.posterImage ? (
                        <img
                          src={event.posterImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <ImageIcon className="h-8 w-8 text-slate-600" />
                          <span className="text-[10px] text-slate-500">No Image</span>
                        </div>
                      )}
                      <span className="absolute top-2 right-2 inline-block rounded-md bg-[#232F3E] text-white px-2 py-0.5 text-[10px] font-mono shadow-sm">
                        {event.assignedRole}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
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
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(event.date)}
                        </div>
                      )}

                      {event.venue && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span
                          className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${sc.className}`}
                        >
                          {sc.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{event.attendeeCount} registered</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center justify-center gap-1 border border-slate-200 hover:bg-white text-[#232F3E] rounded-[6px] text-xs font-semibold px-3 py-2 transition"
                    >
                      <Info className="h-3.5 w-3.5" /> Details
                    </Link>
                    <Link
                      href={`/scanner?eventId=${event.id}`}
                      className="inline-flex items-center justify-center gap-1 bg-[#232F3E] text-white hover:bg-[#161e27] rounded-[6px] text-xs font-semibold px-3 py-2 shadow-sm transition"
                    >
                      <QrCode className="h-3.5 w-3.5" /> Scanner
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
