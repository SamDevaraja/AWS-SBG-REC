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
  HelpCircle, ChevronDown
} from 'lucide-react';
import { EVENT_CATEGORIES, AVAILABILITY_FILTERS } from '../../../context/mockData';
import { getPosterSrcAndPosition } from '@/lib/utils';

const getCategoryStyle = (category: string) => {
  const c = category.toUpperCase();
  if (c.includes('TECH') || c.includes('WORK')) {
    return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
  }
  if (c.includes('HEALTH') || c.includes('WELL')) {
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  }
  if (c.includes('BUSI') || c.includes('START')) {
    return 'bg-orange-500/10 text-[#FF9900] border-[#FF9900]/20';
  }
  return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
};

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

  const selectCls = "appearance-none pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[12.5px] text-slate-600 cursor-pointer transition-all";

  return (
    <section className="w-full min-h-screen py-6 px-4 sm:py-8 sm:px-8 bg-[#F8F9FA] flex flex-col items-center">

      <div className="max-w-[1600px] w-full flex flex-col gap-6 z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/" className="hover:text-[#FF9900] transition-colors font-semibold">Home</Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#FF9900] font-semibold">Events</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none m-0">
                Cloud Events &amp; Workshops
              </h1>
              <span className="px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-[4px] text-xs font-semibold">
                {sortedEvents.length}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              Browse active cloud bootcamps, security workshops, and expert sessions. Reserve your seat instantly.
            </p>
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-[6px] text-[13px] text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative shrink-0">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectCls}
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Availability Filter */}
            <div className="relative shrink-0">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={selectCls}
              >
                {AVAILABILITY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear */}
            {(searchInput !== '' || category !== 'All' || availability !== 'All') && (
              <button
                onClick={clearFilters}
                className="text-[12px] font-semibold text-[#FF9900] hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent shrink-0"
              >
                Clear
              </button>
            )}

            {/* Event Count */}
            <p className="text-[12px] font-medium text-slate-500 whitespace-nowrap shrink-0 m-0 flex items-center">
              {isLoading ? 'Loading...' : sortedEvents.length > 0
                ? <span><strong className="text-slate-700 font-semibold">{sortedEvents.length}</strong> event{sortedEvents.length !== 1 ? 's' : ''}{isRefetching && <span className="ml-1.5 text-[10px] text-[#FF9900]">(syncing...)</span>}</span>
                : null
              }
            </p>

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px] border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[4px] transition cursor-pointer border-none ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650 bg-transparent'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[4px] transition cursor-pointer border-none ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650 bg-transparent'}`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>


        {/* ── Grid / States ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-[6px] overflow-hidden animate-pulse shadow-sm">
                <div className="bg-slate-100 h-48" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-100 rounded-[4px]" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-slate-100 rounded-[4px]" />
                    <div className="h-5 w-16 bg-slate-100 rounded-[4px]" />
                  </div>
                  <div className="h-3.5 w-24 bg-slate-100 rounded-[4px]" />
                  <div className="h-3.5 w-32 bg-slate-100 rounded-[4px]" />
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <div className="h-10 flex-1 bg-slate-100 rounded-[6px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorAlert message={(error as Error).message} onRetry={refetch} />
        ) : sortedEvents.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-[6px] p-14 text-center max-w-sm mx-auto my-8 bg-slate-50/50">
            <div className="mx-auto bg-white border border-slate-200 w-12 h-12 rounded-[6px] flex items-center justify-center mb-4 shadow-sm">
              <HelpCircle className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-[14px] font-semibold text-slate-800 mb-1">No events found</h3>
            <p className="text-[12.5px] text-slate-400 mb-5">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-[6px] text-[12.5px] font-semibold px-4 py-2.5 hover:bg-slate-800 shadow-sm transition"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto">
              <div className="min-w-[960px] divide-y divide-slate-200">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 bg-slate-50/80 px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 items-center">
                  <div className="col-span-4">Event</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-3">Venue</div>
                  <div className="col-span-2">Availability</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                {/* Rows */}
                {sortedEvents.map((event) => (
                  <EventListRow key={event.event_id} event={event} />
                ))}
              </div>
            </div>
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
      className={`group rounded-[6px] overflow-hidden transition-all duration-300 flex flex-col h-full relative cursor-pointer ${
        isEnded
          ? 'bg-slate-900 border border-slate-500 hover:border-[#FF9900]/50 hover:shadow-[0_0_0_3px_rgba(255,153,0,0.12),0_8px_24px_rgba(255,153,0,0.10)] hover:-translate-y-1 ended-blur'
          : 'bg-white border border-slate-200 hover:border-[#FF9900]/70 hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.22)] hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
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

            <button disabled className="w-full py-2.5 rounded-[6px] bg-white/10 border border-white/20 text-white/60 font-semibold text-[12px] cursor-not-allowed">
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
        /* ── ACTIVE: Fullbleed layout matching core/events ── */
        <>
          {/* Poster (Premium full-bleed cover image) */}
          <div className="h-48 w-full relative bg-slate-900 overflow-hidden rounded-t-[6px]">
            <img
              src={imgPosterSrc}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
              style={{ objectPosition: imgPosterPosition }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>

          {/* Body */}
          <div className="p-5 pt-4 flex-1 flex flex-col gap-3 bg-white">
            <div className="flex flex-col gap-3">
              {/* Title */}
              <h3 className="text-[18px] font-bold text-slate-800 leading-snug tracking-tight hover:text-[#FF9900] transition-colors line-clamp-2" title={title}>
                {title}
              </h3>

              {/* Badges Row (Live status, Category) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {isOngoing && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
                {category && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border ${getCategoryStyle(category)}`}>
                    {category}
                  </span>
                )}
              </div>

              {/* Date & Venue details */}
              <div className="flex flex-col gap-1.5 text-[13px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                  <span className="font-medium text-slate-600">{formattedDate}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{startTimeStr} · {mode}</span>
                </div>
                {venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#FF9900]/80 shrink-0" />
                    <span className="truncate text-slate-600 font-medium" title={venue}>{venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer Container */}
          <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200 flex flex-col gap-3.5 mt-auto rounded-b-[6px]">
            {/* Seats remaining */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Seats Remaining</span>
              </div>
              {isFull ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-bold border bg-rose-500/10 text-rose-700 border-rose-500/20">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-rose-500" />
                  Fully Booked
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-bold border ${
                  seatsLeft <= 20
                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${seatsLeft <= 20 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {seatsLeft} / {max_capacity}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <Link
              href={`/events/${event_id}`}
              className="w-full h-10 bg-[#232F3E] hover:bg-[#1a232f] text-white font-semibold text-sm rounded-[6px] transition-all duration-200 text-decoration-none flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
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
  const { event_id, title, category, mode, start_datetime, venue, event_status, max_capacity, registered = 0, banner_url } = event;
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
      ref={rowRef}
      className={`grid grid-cols-12 gap-4 items-center px-5 py-4.5 transition-all duration-200 relative overflow-hidden ${
        isEnded 
          ? 'bg-slate-50/45 opacity-65 hover:opacity-100 hover:bg-slate-50/75' 
          : 'hover:bg-slate-50'
      }`}
    >
      {/* Event Info */}
      <div className="col-span-4 flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-[6px] bg-slate-900 shrink-0 overflow-hidden border border-slate-200/50 shadow-sm relative duration-300">
          <img src={imgPosterSrc} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgPosterPosition }} />
          {isEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 z-30">
              <span className="text-[7.5px] font-bold text-white uppercase tracking-wider bg-black/40 px-1 py-0.5 rounded-[2px]">Done</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className={`font-bold text-[13.5px] transition-colors truncate mb-1 leading-snug ${isEnded ? 'text-slate-500' : 'text-slate-800 hover:text-[#FF9900]'}`} title={title}>
            {title}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border ${getCategoryStyle(category)}`}>
              {category}
            </span>
            <span className="bg-[#232F3E]/5 text-[#232F3E] text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-[4px] border border-[#232F3E]/10 tracking-wider">
              {mode}
            </span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-400 shrink-0">
            <Calendar size={13} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-700 text-[12.5px] truncate">{formattedDate}</span>
            <span className="text-slate-400 text-[11px] font-medium mt-0.5">{startTimeStr}</span>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="col-span-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-400 shrink-0">
            <MapPin size={13} />
          </div>
          <span className="text-[12.5px] text-slate-600 font-bold truncate" title={venue}>{venue || '—'}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="col-span-2 min-w-0">
        <div className="flex flex-col gap-1.5 inline-flex w-full">
          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
            <Users size={13} className="text-slate-400" />
            {isEnded ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Concluded
              </span>
            ) : (
              <>
                <span>{registered}</span>
                <span className="text-slate-400 text-[11px] font-normal">/ {max_capacity}</span>
              </>
            )}
          </div>
          {max_capacity > 0 && (
            <div className="w-28 h-1.5 bg-slate-100 border border-slate-200/50 rounded-[3px] overflow-hidden">
              <div 
                className={`h-full rounded-[3px] transition-all duration-300 ${
                  isEnded ? 'bg-slate-350' : isFull ? 'bg-rose-500' : 'bg-[#FF9900]'
                }`} 
                style={{ width: `${Math.min((registered / max_capacity) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Button */}
      <div className="col-span-1 text-right">
        {isEnded ? (
          <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-455 border border-slate-200/60 rounded-[6px] text-[12px] font-bold w-20 h-9 select-none">
            Closed
          </span>
        ) : (
          <Link
            href={`/events/${event_id}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#232F3E] hover:bg-[#1a232f] text-white rounded-[6px] text-[12px] font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer text-decoration-none w-20 h-9"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
});
