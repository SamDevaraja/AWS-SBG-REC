'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Ticket, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Plus, 
  UserCheck,
  Edit
} from 'lucide-react';
import { useEvents } from '@/lib/hooks';
import type { EventStatus, Event } from '@/lib/types';
import GlassCard from '@/components/GlassCard';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    },
    PUBLISHED: {
      label: 'Published',
      className: 'bg-blue-50 text-blue-700 border border-blue-100',
    },
    REGISTRATION_OPEN: {
      label: 'Registration Open',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    REGISTRATION_CLOSED: {
      label: 'Registration Closed',
      className: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
    ONGOING: {
      label: 'Ongoing',
      className: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    },
    ARCHIVED: {
      label: 'Archived',
      className: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    },
  };
  return map[status] || { label: status, className: 'bg-slate-100 text-slate-600 border border-slate-200' };
}

function CoreHeroBanner() {
  const [greeting, setGreeting] = useState("Hello");
  const [userName, setUserName] = useState("Administrator");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.fullName) setUserName(parsed.fullName);
        else if (parsed.email) setUserName(parsed.email);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Glow effect blobs to shine through glassmorphic cards */}
      <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-48 h-48 bg-brand-orange/20 rounded-full blur-[70px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-52 h-52 bg-brand-blue/15 rounded-full blur-[75px] pointer-events-none z-0" />

      {/* Glassmorphic welcome banner */}
      <div className="relative w-full rounded-[22px] border border-white/50 bg-white/45 backdrop-blur-[24px] shadow-xl shadow-black/[0.03] overflow-hidden z-10">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)",
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full min-h-[220px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Welcome Text Content */}
          <div className="relative z-10 flex-1 flex flex-col items-start text-slate-800">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-semibold mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin" style={{ animationDuration: "4s" }} />
              <span className="text-slate-700 tracking-wide">Core Administration Hub</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-display text-slate-900 drop-shadow-sm mb-3">
              {greeting}, {userName} !
            </h1>

            <p className="text-slate-600 max-w-2xl text-[14px] leading-relaxed mb-6">
              Welcome to the Event Management Console. Build upcoming activities, configure agendas and speakers, track attendee registrations, and monitor check-in statistics in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/core/events/create">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold text-xs shadow-lg shadow-brand-orange/20 flex items-center gap-2 group transition-all"
                >
                  <Plus className="w-4 h-4 animate-pulse" />
                  <span>Create New Event</span>
                </motion.button>
              </Link>

              <Link href="/core/analytics">
                <button
                  className="px-6 py-2.5 rounded-xl bg-white/60 border border-white/80 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all hover:bg-white/85 shadow-sm"
                >
                  <BarChart3 className="w-4 h-4 text-brand-orange" />
                  <span>System Analytics</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



const RecentEventSkeleton = () => (
  <div className="border border-slate-200/50 bg-white/70 backdrop-blur-md rounded-[22px] shadow-sm overflow-hidden animate-pulse min-h-[380px] flex flex-col justify-between">
    <div className="bg-slate-100 h-40" />
    <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
      </div>
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
        <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
      </div>
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
      </div>
    </div>
  </div>
);

const RecentEventCard = ({ event }: { event: Event }) => {
  const regCount = event.registrations?.length ?? 0;
  const capacity = event.capacity ?? 0;
  const isUnlimited = !capacity || capacity === 0;
  const progressPercent = isUnlimited ? 0 : Math.round((regCount / capacity) * 100);
  const statusInfo = statusConfig(event.status);

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden p-0 border border-white/20 hover:border-brand-orange/30 group">
      {/* Poster image banner */}
      <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
        <img
          src={event.posterImage || '/default-event-poster.png'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 font-semibold text-[9px] uppercase px-2.5 py-1 rounded-[6px] shadow-sm">
          {event.category || 'General'}
        </span>
        <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase px-2.5 py-1 rounded-[6px] shadow-sm ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Event details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[16px] text-slate-800 line-clamp-1 group-hover:text-brand-orange transition-colors font-display mb-1.5">
            {event.title}
          </h3>
          <p className="text-slate-500 text-xs font-normal line-clamp-2 leading-relaxed mb-4">
            {event.shortDescription || 'No description provided.'}
          </p>

          <div className="space-y-2 mb-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>{event.date ? formatDate(event.date) : 'No Date Set'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{event.venue || 'No Venue Set'} ({event.mode || 'OFFLINE'})</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="space-y-1.5 pt-3 border-t border-slate-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Registrations
              </span>
              <span className="font-semibold text-slate-700">
                {regCount} {isUnlimited ? 'Signed up' : `/ ${capacity}`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 90 ? 'bg-rose-500' : progressPercent >= 75 ? 'bg-brand-orange' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-stretch gap-2">
            <Link href={`/core/events/${event.id}`} className="flex-1 flex">
              <button className="w-full py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer flex items-center justify-center">
                Manage Details
              </button>
            </Link>
            <Link href={`/core/events/edit/${event.id}`} className="flex">
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition cursor-pointer flex items-center justify-center" title="Edit Event">
                <Edit className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default function DashboardPage() {
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 3,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const recentEvents = eventsData?.data ?? [];

  const adminActions = [
    { label: 'Scanner Panel', href: '/core/attendance', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' },
    { label: 'Generate Report', href: '/core/analytics', icon: BarChart3, color: 'text-teal-600 bg-teal-50 border border-teal-100' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '36px 24px 64px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background mesh blob effects */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[10%] w-80 h-80 bg-brand-blue/8 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[15%] w-72 h-72 bg-brand-orange/8 rounded-full blur-[120px] pointer-events-none z-0" />

      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Welcome Hero Banner */}
        <CoreHeroBanner />

        {/* Shortcuts strip */}
        <div className="mt-6">
          <GlassCard hoverEffect={false} className="border border-white/40 py-4 px-6" style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(16px)", borderLeft: "3px solid rgba(255, 153, 0, 0.5)" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="shrink-0">
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest font-display">Console Utilities</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Quick administrative action shortcuts</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {adminActions.map((action) => (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/70 bg-white/80 shadow-sm hover:bg-white hover:border-brand-orange/30 hover:shadow-md text-xs font-semibold text-slate-700 transition-all duration-200 cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg ${action.color}`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span>{action.label}</span>
                    </motion.button>
                  </Link>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Events Section */}
        <div className="mt-8">
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200/80 to-transparent" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Recent Activity</span>
            <div className="h-px flex-1 bg-gradient-to-l from-slate-200/80 to-transparent" />
          </div>

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-slate-800 font-display flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
                <Calendar className="w-4 h-4 text-brand-orange" />
              </span>
              Recent Events
            </h2>
            <Link
              href="/core/events"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-orange/80 transition-colors group"
            >
              View All Console
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <RecentEventSkeleton key={i} />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <GlassCard hoverEffect={false} className="border border-slate-200/50 py-12 text-center w-full" style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))", backdropFilter: "blur(12px)" }}>
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1 font-display">No events found</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">Get started by creating your first community event.</p>
              <Link href="/core/events/create">
                <button className="bg-brand-orange text-white rounded-xl text-xs font-semibold px-4.5 py-2 hover:bg-brand-orange/90 transition shadow-md shadow-brand-orange/10 cursor-pointer">
                  Create Event
                </button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentEvents.map((event) => (
                <RecentEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
