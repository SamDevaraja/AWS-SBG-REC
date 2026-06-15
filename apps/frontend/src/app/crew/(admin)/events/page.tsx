'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCrewEvents } from '@/lib/hooks';
import { Search, Calendar, MapPin, Users, QrCode, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
    DRAFT: { label: 'Draft', className: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400' },
    PUBLISHED: { label: 'Published', className: 'text-blue-700 bg-blue-50', dot: 'bg-blue-500' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500' },
    REGISTRATION_CLOSED: { label: 'Registration Closed', className: 'text-amber-700 bg-amber-50', dot: 'bg-amber-500' },
    ONGOING: { label: 'Ongoing', className: 'text-[#d87c00] bg-brand-orange/10', dot: 'bg-[#d87c00]' },
    COMPLETED: { label: 'Completed', className: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400' },
    ARCHIVED: { label: 'Archived', className: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400' },
  };
  return map[status] || { label: status, className: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'text-violet-700 bg-violet-50 border border-violet-100' },
    OFFLINE: { label: 'Offline', className: 'text-[#d87c00] bg-brand-orange/5 border border-brand-orange/20' },
    HYBRID: { label: 'Hybrid', className: 'text-cyan-700 bg-cyan-50 border border-cyan-100' },
  };
  if (!mode) return { label: '—', className: 'text-slate-500 bg-slate-50 border border-slate-200' };
  return map[mode] || { label: mode, className: 'text-slate-500 bg-slate-50 border border-slate-200' };
}

export default function AssignedEventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: events, isLoading } = useCrewEvents();

  const filteredEvents = (events ?? []).filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col">
      {/* Header & Search Area */}
      <div className="relative w-full mb-8 pt-2">
        {/* Background glow blobs */}
        <div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-64 h-64 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-72 h-72 bg-[#0073bb]/15 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="font-semibold text-2xl text-slate-900 mb-1 font-display">
              Assigned Events
            </h1>
            <p className="text-slate-500 max-w-xl text-xs sm:text-sm font-normal">
              Browse and monitor your operational assignments
            </p>
          </div>

          <div className="w-full md:w-[320px] relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search events by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm h-28 animate-pulse flex items-center p-4 gap-4"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-1/4 rounded bg-slate-100" />
              </div>
              <div className="w-24 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-dashed border-slate-300 rounded-[24px] p-16 text-center shadow-sm max-w-2xl mx-auto w-full mt-10"
        >
          <div className="mx-auto bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
            <ImageIcon className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-base font-medium text-slate-800 mb-1 font-display">No events found</h3>
          <p className="text-xs text-slate-500 font-normal">
            There are currently no operational events matching your criteria.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, index) => {
            const sc = statusConfig(event.status as EventStatus);
            const mc = modeConfig(event.mode);

            return (
              <motion.div
                key={event.id || (event as any).event_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -1 }}
                style={{ background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.04), rgba(35, 47, 62, 0.06))' }}
                className="rounded-2xl p-3 md:p-4 border border-transparent hover:border-brand-orange/30 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative"
              >
                {/* Subtle highlight edge */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange opacity-0 group-hover:opacity-100 rounded-l-2xl transition-opacity" />

                {/* Left: Thumbnail Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative shadow-inner">
                  <img
                    src={event.posterImage || '/default-event-poster.png'}
                    alt={event.title || 'Default Poster'}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Center: Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Status Dot + Label */}
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${sc.className}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </div>
                    {/* Mode Label */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${mc.className}`}>
                      {mc.label}
                    </span>
                    {/* Role Label */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide text-[#232F3E] bg-slate-100 border border-slate-200/60">
                      {event.assignedRole}
                    </span>
                  </div>

                  <h3 className="font-medium text-base text-[#232F3E] font-display truncate group-hover:text-[#1a232f] transition-colors mb-0.5">
                    {event.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-[10px] text-slate-500 font-normal">
                    {event.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#232F3E]" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-1 max-w-[150px] sm:max-w-xs md:max-w-[250px]">
                        <MapPin className="h-3.5 w-3.5 text-[#232F3E] shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#232F3E]" />
                      <span>{event.attendeeCount} registered</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/crew/events/${event.id || (event as any).event_id}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] border border-transparent hover:border-brand-orange/30 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium shadow-sm transition-all"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/crew/scanner?eventId=${event.id || (event as any).event_id}`);
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-[8px] bg-[#232F3E] hover:bg-[#1a232f] text-white text-xs font-medium shadow-sm transition-colors"
                  >
                    <QrCode className="w-4 h-4" /> Scanner
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
