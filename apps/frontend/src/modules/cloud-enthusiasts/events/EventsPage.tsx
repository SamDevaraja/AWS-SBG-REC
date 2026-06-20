'use client';

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvents } from '../shared/hooks/useCloudEnthusiasts';
import { Event } from '../shared/types';
import { EC2ConsoleLoader, AnimatedEmptyState, ErrorAlert } from '../shared/components/Animations';
import {
  Search, Filter, Users, Calendar, MapPin,
  LayoutGrid, List, Clock, ArrowRight,
  HelpCircle
} from 'lucide-react';
import { EVENT_CATEGORIES, AVAILABILITY_FILTERS } from '../../../context/mockData';
import { getPosterSrcAndPosition } from '@/lib/utils';

/**
 * Debounce hook — delays updating a value until the user stops typing.
 * Prevents firing a network request on every keystroke.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const TruncatedDescription = ({
  description,
  eventId,
  className = "text-slate-500 text-xs leading-relaxed",
  linkSizeClass = "text-xs"
}: {
  description: string;
  eventId: string;
  className?: string;
  linkSizeClass?: string;
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(() => {
      checkTruncation();
    });
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [description]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`${className} line-clamp-3 ${isTruncated ? 'pr-14' : ''}`}
      >
        {description}
      </p>
      {isTruncated && (
        <span className={`absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-8 text-[#FF9900] hover:text-orange-600 font-semibold ${linkSizeClass} transition-colors`}>
          <Link href={`/events/${eventId}`}>
            show more..
          </Link>
        </span>
      )}
    </div>
  );
};

export default function EventsPage() {
  const router = useRouter();

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#chat') {
        router.replace('/chat');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [router]);

  // Raw input state — updates immediately for a responsive UI feel
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounced value — only this drives network requests (300ms delay)
  const search = useDebounce(searchInput, 300);

  const { data: events, isLoading, error, refetch, isRefetching } = useEvents({
    search,
    category,
    availability,
  });

  const categories = EVENT_CATEGORIES;

  const clearFilters = () => {
    setSearchInput('');
    setCategory('All');
    setAvailability('All');
  };

  // Sort: upcoming first (nearest date → soonest) then ended last (most-recently-ended → bottom)
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    const upcoming = events
      .filter(e => e.event_status !== 'Ended')
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
    const ended = events
      .filter(e => e.event_status === 'Ended')
      .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());
    return [...upcoming, ...ended];
  }, [events]);

  return (
    <section className="w-full min-h-screen py-7 px-8 bg-white flex flex-col items-center">

      <div className="max-w-7xl w-full flex flex-col gap-4 z-10">

        {/* ── Hero Banner ── */}
        <div style={{ background: 'radial-gradient(ellipse at 95% 5%, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.08) 35%, rgba(255,255,255,0) 65%)', borderRadius: '24px', padding: '24px', marginBottom: 4 }}>
          {/* Pill label */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AWS SBG REC · Events Directory</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Cloud Events &amp; Workshops
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>
            Browse active cloud bootcamps, security workshops, and expert sessions. Reserve your seat instantly.
          </p>
          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </div>

        {/* ── Single-row Filter Bar ── */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">

          {/* Search — grows to fill available space */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, description, or venue..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] font-normal transition-all text-slate-700"
            />
          </div>

          {/* Category Filter */}
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="relative shrink-0">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all appearance-none"
            >
              {AVAILABILITY_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>

          {/* Vertical divider */}
          <div className="w-px h-6 bg-slate-200 shrink-0" />

          {/* Event count */}
          <p className="text-[12px] font-medium text-slate-500 whitespace-nowrap shrink-0">
            {isLoading ? 'Loading...' : sortedEvents.length > 0
              ? <span><strong className="text-slate-700">{sortedEvents.length}</strong> event{sortedEvents.length !== 1 ? 's' : ''}{isRefetching && <span className="ml-1.5 text-[10px] text-[#FF9900]">(syncing...)</span>}</span>
              : null
            }
          </p>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-[10px] border border-slate-200/50 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[8px] transition ${viewMode === 'grid' ? 'bg-white text-[#232F3E] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[8px] transition ${viewMode === 'list' ? 'bg-white text-[#232F3E] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>


        {/* ── Grid / States ── */}
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Retrieving Active Events...</p>
          </div>
        ) : error ? (
          <ErrorAlert message={(error as Error).message} onRetry={refetch} />
        ) : sortedEvents.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <HelpCircle size={36} className="text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700 mb-1">No events found</h4>
            <p className="text-slate-400 text-[12px] max-w-sm mx-auto mb-4">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-[11px] font-semibold text-[#FF9900] hover:underline transition"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event) => (
              <EventListRow key={event.event_id} event={event} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventCard — memo-wrapped to skip re-renders when sibling cards change state
// ─────────────────────────────────────────────────────────────────────────────
const EventCard = memo(function EventCard({ event }: { event: Event }) {
  const { event_id, title, short_description, category, mode, start_datetime, venue, event_status, max_capacity, registered = 0, banner_url } = event;
  const seatsLeft = Math.max(0, max_capacity - registered);
  const isFull = seatsLeft === 0;
  const isEnded = event_status === 'Ended';
  const isOngoing = event_status === 'Ongoing';

  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!isEnded) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isEnded]);

  // Memoize expensive date formatting — only recomputes when start_datetime changes
  const { formattedDate, startTimeStr } = useMemo(() => {
    const d = new Date(start_datetime);
    return {
      formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      startTimeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [start_datetime]);

  const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(banner_url);

  return (
    <div
      ref={cardRef}
      className={`group rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full relative cursor-pointer ${
        isEnded
          ? 'bg-slate-900 border border-slate-500 hover:border-[#FF9900]/50 hover:shadow-[0_0_0_3px_rgba(255,153,0,0.12),0_8px_24px_rgba(255,153,0,0.10)] hover:-translate-y-1 ended-blur'
          : 'bg-white border border-slate-300 hover:border-[#FF9900]/50 hover:shadow-[0_0_0_3px_rgba(255,153,0,0.12),0_8px_24px_rgba(255,153,0,0.10)] hover:-translate-y-1'
      }`}
    >

      {isEnded ? (
        /* ── ENDED: Full-card dark layout ── */
        <div className="relative flex flex-col h-full">
          {/* Banner as full background */}
          <div className="absolute inset-0">
            <img
              src={imgPosterSrc}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ objectPosition: imgPosterPosition }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            {/* Heavy dark overlay so text is readable */}
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Content overlaid on dark bg */}
          <div className="relative z-10 p-5 flex flex-col gap-3 h-full">

            {/* Category badge */}
            <span className="self-start bg-white/20 text-white font-semibold text-[10px] uppercase tracking-wide px-3 py-1 rounded-full border border-white/30">
              {category}
            </span>

            {/* Title */}
            <h3 className="font-bold text-[22px] line-clamp-2 font-display leading-snug text-white">
              {title}
            </h3>

            {/* Description */}
            {short_description && (
              <TruncatedDescription
                description={short_description}
                eventId={event_id}
                className="text-[12px] leading-relaxed text-white/70"
                linkSizeClass="text-[11px]"
              />
            )}

            {/* Date / Time / Venue */}
            <div className="pt-3 border-t border-white/15 flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-2 text-[13px] font-medium text-white/85">
                  <Calendar className="w-4 h-4 shrink-0 text-white/60" />
                  <span className="truncate">{formattedDate}</span>
                </span>
                <span className="flex items-center gap-2 text-[13px] font-medium text-white/85">
                  <Clock className="w-4 h-4 shrink-0 text-white/60" />
                  <span className="truncate">{startTimeStr} · {mode}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-white/85">
                <MapPin className="w-4 h-4 shrink-0 text-white/60" />
                <span className="truncate">{venue}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-white/15 flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full border border-white/25">Event Ended</span>
              <span className="text-[10px] text-white/65 font-medium">{registered} registered</span>
            </div>

            <button disabled className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/60 font-semibold text-[12px] cursor-not-allowed">
              Event Closed
            </button>

          </div>

          {/* Completed stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 translate-y-10">
            <div className={`completed-stamp on-dark ${inView ? 'animate-stamp' : 'opacity-0'}`}>
              Completed
            </div>
          </div>
        </div>

      ) : (
        /* ── ACTIVE: Tall banner with overlaid title, compact footer ── */
        <>
          {/* Tall banner — title + category float over it */}
          <div className="relative h-56 w-full overflow-hidden bg-slate-900 shrink-0">
            <img
              src={imgPosterSrc}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition: imgPosterPosition }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />

            {/* Strong bottom gradient so title is always readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Category pill — top left */}
            <span className="absolute top-3 left-3 bg-white/15 text-white font-semibold text-[10px] uppercase tracking-wide px-3 py-1 rounded-full border border-white/25 backdrop-blur-sm">
              {category}
            </span>

            {/* Ongoing LIVE badge — top right */}
            {isOngoing && (
              <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/25 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/40 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}

            {/* Title overlaid at bottom of banner */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-[20px] line-clamp-2 font-display leading-snug text-white group-hover:text-[#FF9900] transition-colors duration-200 drop-shadow-sm">
                {title}
              </h3>
            </div>
          </div>

          {/* Compact footer */}
          <div className="p-4 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #ede9e1 100%)' }}>

            {/* Date / Time / Venue chips */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-stone-700">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                  <span className="truncate">{formattedDate}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-stone-700">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                  <span className="truncate">{startTimeStr} · {mode}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-stone-700">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                <span className="truncate">{venue}</span>
              </div>
            </div>

            {/* Seats + CTA row */}
            <div className="flex items-center gap-3 pt-2 border-t border-stone-300">
              <div className="flex-1">
                {isFull ? (
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">Sold Out</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full w-fit">
                    <Users className="w-3 h-3" />
                    {seatsLeft} / {max_capacity} left
                  </span>
                )}
              </div>
              <Link
                href={`/events/${event_id}`}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold text-[12px] flex items-center gap-1.5 transition-all duration-200 group/btn"
              >
                View
                <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EventListRow — memo-wrapped
// ─────────────────────────────────────────────────────────────────────────────
const EventListRow = memo(function EventListRow({ event }: { event: Event }) {
  const { event_id, title, short_description, category, mode, start_datetime, venue, event_status, max_capacity, registered = 0, banner_url } = event;
  const seatsLeft = Math.max(0, max_capacity - registered);
  const isFull = seatsLeft === 0;
  const isEnded = event_status === 'Ended';

  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!isEnded) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [isEnded]);

  const formattedDate = useMemo(
    () => new Date(start_datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    [start_datetime]
  );

  const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(banner_url);

  return (
    <div
      ref={rowRef}
      className={`group bg-white border border-slate-200/60 rounded-xl p-4 hover:border-slate-300/85 hover:shadow-md hover:shadow-slate-100 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden ${isEnded ? 'ended-blur' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={imgPosterSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            style={{ objectPosition: imgPosterPosition }}
          />
          <div className="absolute inset-0 bg-black/10" />
          {isEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
              <div className={`completed-stamp-mini ${inView ? 'animate-stamp-mini' : 'opacity-0'}`}>
                Completed
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
              {category}
            </span>
            <span className="bg-[#232F3E]/10 text-[#232F3E] text-[9px] font-semibold px-2.5 py-0.5 rounded-full">
              {mode}
            </span>
          </div>

          <h3 className={`font-semibold text-[13px] transition truncate mb-0.5 font-display ${isEnded ? 'text-slate-400' : 'text-slate-800 group-hover:text-[#FF9900]'}`}>
            {title}
          </h3>
          {short_description && (
            <TruncatedDescription
              description={short_description}
              eventId={event_id}
              className="text-slate-400 text-[11px] font-normal leading-normal mb-1"
              linkSizeClass="text-[11px]"
            />
          )}
          <div className="flex flex-wrap items-center text-slate-500 gap-x-3.5 gap-y-0.5 text-[10px] font-normal">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{venue}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{registered} / {max_capacity}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-slate-100 pt-2.5 sm:border-t-0 sm:pt-0 shrink-0">
        <div className="text-left sm:text-right">
          <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-widest mb-0.5">Availability</p>
          {isEnded ? (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Ended</span>
          ) : isFull ? (
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">Sold Out</span>
          ) : (
            <span className="text-[11px] font-semibold text-teal-600 font-mono">{seatsLeft} seats</span>
          )}
        </div>

        {isEnded ? (
          <button
            disabled
            className="text-[11px] font-semibold px-4 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed"
          >
            Closed
          </button>
        ) : (
          <Link
            href={`/events/${event_id}`}
            className="text-[11px] font-semibold px-4 py-2 bg-[#1A1C1E] hover:bg-[#232F3E] text-white rounded-xl transition-colors duration-200"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
});
