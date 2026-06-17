'use client';

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvents } from '../shared/hooks/useCloudEnthusiasts';
import { Event } from '../shared/types';
import { EC2ConsoleLoader, AnimatedEmptyState, ErrorAlert } from '../shared/components/Animations';
import { Search, Filter, Users, Calendar, MapPin, LayoutGrid, List, Clock, ArrowRight, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { EVENT_CATEGORIES, AVAILABILITY_FILTERS } from '../../../context/mockData';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function EventsPage() {
  const router = useRouter();

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#chat') {
        router.replace('/events/chat');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [router]);

  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const search = useDebounce(searchInput, 300);

  const { data: events, isLoading, error, refetch, isRefetching } = useEvents({
    search,
    category,
    availability,
  });

  const categories = EVENT_CATEGORIES;
  const hasActiveFilters = searchInput || category !== 'All' || availability !== 'All';

  const clearFilters = () => {
    setSearchInput('');
    setCategory('All');
    setAvailability('All');
  };

  return (
    <div className="bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-200/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-2 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              AWS Developer Community
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Cloud Events & Workshops
            </h1>
            <p className="mt-1 text-slate-500 text-sm max-w-xl font-normal leading-relaxed">
              Accelerate your cloud journey with hands-on labs, expert-led workshops, and local meetups.
            </p>
          </div>
          
          {/* Quick Stats or Status badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#232F3E] text-white flex items-center justify-center font-bold text-lg">
                {events?.length ?? 0}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Events</div>
                <div className="text-xs font-semibold text-slate-700">Available to Register</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Toolbar ──────────────────── */}
        <div className="bg-white border border-slate-200/70 rounded-xl p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-4xl">
            {/* Search */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search events by name, venue, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-9 pr-4 py-1.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/10 focus:border-[#FF9900] text-xs transition-all"
              />
            </div>

            {/* Category select */}
            <div className="relative shrink-0 sm:w-44">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="h-3.5 w-3.5" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-9 pr-8 py-1.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/10 focus:border-[#FF9900] text-xs appearance-none cursor-pointer transition-all"
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Availability */}
            <div className="relative shrink-0 sm:w-44">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Users className="h-3.5 w-3.5" />
              </span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="block w-full pl-9 pr-8 py-1.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/10 focus:border-[#FF9900] text-xs appearance-none cursor-pointer transition-all"
              >
                {AVAILABILITY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* View Toggles & Count */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {events && events.length > 0
                  ? `${events.length} event${events.length !== 1 ? 's' : ''}`
                  : ''}
              </span>
              {isRefetching && (
                <span className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-[#FF9900] hover:text-orange-600 transition ml-1"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === 'grid' ? 'bg-white text-[#232F3E] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === 'list' ? 'bg-white text-[#232F3E] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="py-16 text-center">
            <EC2ConsoleLoader message="Retrieving active events stream..." />
          </div>
        ) : error ? (
          <ErrorAlert message={(error as Error).message} onRetry={refetch} />
        ) : events?.length === 0 ? (
          <AnimatedEmptyState onClear={clearFilters} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {events?.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {events?.map((event) => (
              <EventListRow key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// EventCard
// ─────────────────────────────────────────────────────────────────────────────
const EventCard = memo(function EventCard({ event }: { event: Event }) {
  const { event_id, title, short_description, category, mode, start_datetime, venue, event_status, max_capacity, registered = 0, banner_url } = event;
  const seatsLeft = Math.max(0, max_capacity - registered);
  const isFull = seatsLeft === 0;
  const isEnded = event_status === 'Ended';

  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!isEnded) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isEnded]);

  const { formattedDate, startTimeStr } = useMemo(() => {
    const d = new Date(start_datetime);
    return {
      formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      startTimeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [start_datetime]);

  return (
    <div
      ref={cardRef}
      className={`group bg-white border border-slate-200/80 hover:border-slate-350 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col h-full relative transition-all duration-300 ease-out ${isEnded ? 'ended-blur opacity-85' : ''}`}
    >
      {/* Banner */}
      <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 shrink-0 border-b border-slate-100">
        {banner_url ? (
          <img
            src={banner_url}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-medium">No banner available</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Frosted Glass overlay bar at the bottom to obscure pre-baked details elegantly */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-slate-950/80 backdrop-blur-xs border-t border-white/5 flex items-center justify-between px-3.5 z-10 select-none">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${mode === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35' : 'bg-blue-500/10 text-blue-400 border border-blue-500/35'}`}>
            {mode === 'ONLINE' ? 'Virtual' : 'In-Person'}
          </span>
          <span className="text-[10px] font-bold text-slate-200 tracking-widest uppercase">
            {category}
          </span>
        </div>
      </div>

      {/* Card Content body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="flex-grow flex flex-col">
          {/* Header/Title & Description container without artificial spaces */}
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors font-display tracking-tight">
              {title}
            </h3>
            {short_description && (
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                {short_description}
              </p>
            )}
          </div>

          {/* Date, Time, Venue metadata line - aligned closely at the bottom of content area */}
          <div className="mt-auto pt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pb-0.5 w-full min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="shrink-0">{formattedDate}</span>
              <span className="text-slate-300 shrink-0">|</span>
              <span className="shrink-0">{startTimeStr}</span>
              <span className="text-slate-300 shrink-0">|</span>
              <span className="truncate text-slate-450" title={venue}>{venue}</span>
            </div>
          </div>
        </div>

        {/* Bottom Booking Area */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-slate-400 text-[11px] font-medium">Availability</span>
            {isEnded ? (
              <span className="text-slate-450 font-bold text-[9px] uppercase tracking-wider">Closed</span>
            ) : isFull ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100/80 text-[9px] uppercase tracking-wider">Sold Out</span>
            ) : (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/80 text-[9px] uppercase tracking-wider">{seatsLeft} seats remaining</span>
            )}
          </div>

          {isEnded ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 font-semibold py-2 rounded-lg cursor-not-allowed text-xs transition-colors"
            >
              Event Completed
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 font-semibold py-2 rounded-lg cursor-not-allowed text-xs transition-colors"
            >
              Fully Booked
            </button>
          ) : (
            <Link
              href={`/events/${event_id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-[#232F3E] hover:bg-[#1a2535] text-white font-semibold py-2 rounded-lg shadow-xs text-xs transition-all duration-200 group/btn"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </Link>
          )}
        </div>
      </div>

      {isEnded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className={`completed-stamp ${inView ? 'animate-stamp' : 'opacity-0'}`}>
            Completed
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EventListRow
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
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
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

  return (
    <div
      ref={rowRef}
      className={`group bg-white border border-slate-200/80 hover:border-slate-350 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-4 relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-sm ${isEnded ? 'ended-blur opacity-85' : ''}`}
    >
      {/* Thumbnail */}
      <div className="w-full md:w-32 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative border border-slate-100/80 shadow-xs">
        {banner_url ? (
          <img
            src={banner_url}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-[9px] text-slate-400 font-medium">No banner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
        
        <span className="absolute top-1.5 left-2 bg-slate-950/85 backdrop-blur-xs text-white text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
          {category}
        </span>
        
        <span className={`absolute bottom-1.5 left-2 text-[7px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider ${
          mode === 'ONLINE' ? 'bg-emerald-500/95 text-white' : 'bg-blue-500/95 text-white'
        }`}>
          {mode === 'ONLINE' ? 'Virtual' : 'In-Person'}
        </span>

        {isEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 z-30">
            <div className={`completed-stamp-mini ${inView ? 'animate-stamp-mini' : 'opacity-0'}`}>
              Completed
            </div>
          </div>
        )}
      </div>

      {/* Middle section: Titles & Description & Metadata */}
      <div className="flex-grow min-w-0 flex flex-col justify-between h-full py-0.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 font-display text-[15px] sm:text-[16px] tracking-tight group-hover:text-amber-600 transition-colors truncate leading-snug">
              {title}
            </h3>
            {isFull && !isEnded && (
              <span className="bg-rose-50 text-rose-700 text-[8px] font-semibold px-1.5 py-0.5 rounded-full border border-rose-100 shrink-0">
                Full
              </span>
            )}
          </div>
          {short_description && (
            <p className="text-slate-500 text-[11px] font-normal leading-relaxed line-clamp-1">
              {short_description}
            </p>
          )}
        </div>

        {/* Metadata single line */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate mt-2 pb-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="shrink-0">{formattedDate}</span>
            <span className="text-slate-300 shrink-0">|</span>
            <span className="shrink-0">{startTimeStr}</span>
            <span className="text-slate-300 shrink-0">|</span>
            <span className="truncate text-slate-450" title={venue}>{venue}</span>
          </div>
        </div>
      </div>

      {/* Right section: Action & Availability */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t border-slate-100 md:border-l md:border-t-0 md:pl-6 pt-3 md:pt-0 shrink-0 md:w-44">
        <div className="text-right">
          {isEnded ? (
            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Closed</span>
          ) : isFull ? (
            <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[9px] uppercase tracking-wider">Sold Out</span>
          ) : (
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[9px] uppercase tracking-wider">{seatsLeft} seats remaining</span>
          )}
        </div>

        <div className="shrink-0 w-24 md:w-full mt-0.5">
          {isEnded ? (
            <button
              disabled
              className="w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
            >
              Ended
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
            >
              Full
            </button>
          ) : (
            <Link
              href={`/events/${event_id}`}
              className="w-full flex items-center justify-center gap-1 bg-[#232F3E] hover:bg-[#1a2535] text-white text-xs font-semibold py-1.5 rounded-lg shadow-xs transition-all duration-200 group/btn"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});
