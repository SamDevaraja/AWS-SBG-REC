'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCrewEvents } from '@/lib/hooks';
import { Search, Calendar, MapPin, Users, QrCode, ChevronRight, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventStatus, EventMode } from '@/lib/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string; dot: string }> = {
    DRAFT: { label: 'Draft', className: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
    PUBLISHED: { label: 'Published', className: 'text-blue-700 bg-blue-50/50 border-blue-200', dot: 'bg-blue-500' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'text-emerald-700 bg-emerald-50/50 border-emerald-200', dot: 'bg-emerald-500' },
    REGISTRATION_CLOSED: { label: 'Registration Closed', className: 'text-amber-700 bg-amber-50/50 border-amber-200', dot: 'bg-amber-500' },
    ONGOING: { label: 'Ongoing', className: 'text-[#d87c00] bg-orange-50/50 border-orange-200', dot: 'bg-[#d87c00]' },
    COMPLETED: { label: 'Completed', className: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
    ARCHIVED: { label: 'Archived', className: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
  };
  return map[status] || { label: status, className: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'text-violet-700 bg-violet-50/50 border-violet-100' },
    OFFLINE: { label: 'Offline', className: 'text-[#d87c00] bg-orange-50/40 border-orange-100' },
    HYBRID: { label: 'Hybrid', className: 'text-cyan-700 bg-cyan-50/50 border-cyan-100' },
  };
  if (!mode) return { label: '—', className: 'text-slate-500 bg-slate-50 border border-slate-200' };
  return map[mode] || { label: mode, className: 'text-slate-500 bg-slate-50 border border-slate-200' };
}

export default function AssignedEventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: events, isLoading } = useCrewEvents();
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

  const filteredEvents = (events ?? []).filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );  return (
    <div className="min-h-screen bg-slate-50/30 py-6 px-4 sm:py-8 sm:px-6 font-sans relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-5 relative z-10">

        {/* ── Page Header Card ── */}
        <div className="bg-white border border-slate-200/80 rounded-[4px] p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#FF9900]/5 to-transparent rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Assigned Role Controls</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Operation View</span>
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Assigned Events
              </h1>
              <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                Browse and monitor your operational assignments and event setups.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 rounded-[4px] text-sm px-4 py-2.5 pl-10 outline-none focus:border-slate-350 transition-all font-semibold text-slate-800 shadow-2xs"
                />
              </div>
              
              {canCreateEvent && (
                <Link
                  href="/crew/events/create"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#232F3E] hover:bg-[#1a232f] text-white px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-[4px] shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} className="shrink-0" />
                  Create Event (Delegated)
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-[4px] shadow-xs h-28 animate-pulse flex items-center p-5 gap-5"
              >
                <div className="w-20 h-20 rounded-[4px] bg-slate-100 shrink-0" />
                <div className="flex-grow space-y-3">
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/4 rounded bg-slate-100" />
                </div>
                <div className="w-24 h-9 rounded-[4px] bg-slate-100 shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div 
            className="border border-dashed border-slate-200 bg-white rounded-[4px] p-12 text-center shadow-xs max-w-xl mx-auto w-full mt-6"
          >
            <div className="mx-auto bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <ImageIcon className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No events found</h3>
            <p className="text-sm text-slate-500 font-medium">
              There are currently no operational events assigned or matching your search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEvents.map((event, index) => {
                const sc = statusConfig(event.status as EventStatus);
                const mc = modeConfig(event.mode);

                return (
                  <motion.div
                    key={event.id || (event as any).event_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
                    className="bg-white rounded-[4px] p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-[0.5px] transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
                  >
                    {/* Left: Thumbnail Image */}
                    <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-[4px] border border-slate-150 overflow-hidden relative shadow-inner">
                      <img
                        src={event.posterImage || '/default-event-poster.png'}
                        alt={event.title || 'Event Poster'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Center: Main Information */}
                    <div className="flex-grow min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.75 rounded-[3px] border text-[11px] font-extrabold uppercase tracking-wider ${sc.className}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </div>
                        {/* Mode badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.75 rounded-[3px] border text-[11px] font-extrabold uppercase tracking-wider ${mc.className}`}>
                          {mc.label}
                        </span>
                        {/* Assigned role badge */}
                        <span className="inline-flex items-center px-2.5 py-0.75 rounded-[3px] text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200/60">
                          Role: {event.assignedRole}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-slate-850 truncate leading-snug hover:text-[#FF9900] transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-semibold">
                        {event.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center gap-1.5 max-w-[240px]">
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{event.attendeeCount} registered</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto pt-3.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 sm:ml-auto">
                      <Link
                        href={`/crew/events/${event.id || (event as any).event_id}`}
                        className="flex-grow sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-850 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs hover:border-slate-350"
                      >
                        Details
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/crew/scanner?eventId=${event.id || (event as any).event_id}`);
                        }}
                        className="flex-grow sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[4px] bg-[#232F3E] hover:bg-[#1a232f] text-white text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        <QrCode className="w-4 h-4" />
                        Scanner
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
