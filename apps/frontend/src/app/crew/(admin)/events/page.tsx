'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCrewEvents } from '@/lib/hooks';
import { Search, Calendar, MapPin, Users, QrCode, ChevronRight, Image as ImageIcon, Plus } from 'lucide-react';
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
  );

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* Header & Search Area */}
      <div style={{ background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)", borderRadius: '24px', padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {/* Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Crew · Events</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              Assigned Events
            </h1>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>
              Browse and monitor your operational assignments
            </p>
            {canCreateEvent && (
              <div style={{ marginTop: 16 }}>
                <Link
                  href="/crew/events/create"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#232F3E',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 12px rgba(35,47,62,0.15)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  className="hover:bg-[#1a232f] hover:-translate-y-0.5"
                >
                  <Plus style={{ width: 14, height: 14 }} /> Create Event (Delegated)
                </Link>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24, width: '100%', maxWidth: 320 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search events by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', padding: '10px 16px 10px 40px', outline: 'none', transition: 'all 0.2s' }}
              />
            </div>
          </div>
        </div>
        {/* Orange divider */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
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
          className="border border-dashed border-slate-300 rounded-[24px] p-16 text-center shadow-sm max-w-2xl mx-auto w-full mt-10"
          style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }}
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
                style={{ background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.04), rgba(35, 47, 62, 0.06))' }}
                className="rounded-2xl p-3 md:p-4 border border-transparent hover:border-brand-orange/30 shadow-sm hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative"
              >

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
    </div>
  );
}
