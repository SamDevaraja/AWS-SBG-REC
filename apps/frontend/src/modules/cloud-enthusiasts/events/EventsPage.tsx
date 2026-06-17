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
    <div className="bg-transparent min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-display">
            Cloud Events & Workshops
          </h1>
          <p className="mt-1 text-slate-500 text-sm max-w-xl font-normal leading-relaxed">
            Explore and register for upcoming bootcamps, workshops, and cloud sessions.
          </p>
        </div>

        {/* ── Search & Filter Toolbar ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-4xl">
            {/* Search */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search events by name, venue, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-lg text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm transition"
              />
            </div>

            {/* Category select */}
            <div className="relative shrink-0 sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm appearance-none cursor-pointer transition"
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Availability */}
            <div className="relative shrink-0 sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Users className="h-4 w-4" />
              </span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm appearance-none cursor-pointer transition"
              >
                {AVAILABILITY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* View Toggles & Count */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-400 font-medium">
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
                  className="text-[11px] font-semibold text-[#FF9900] hover:text-orange-600 transition"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/50 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === 'grid' ? 'bg-white text-[#232F3E] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === 'list' ? 'bg-white text-[#232F3E] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
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

// ─────────────────────────────────────────────────────────────────────────────
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
      className={`group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col h-full relative transition-all duration-300 ${isEnded ? 'ended-blur opacity-85' : ''}`}
    >
      {/* Banner */}
      <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 shrink-0">
        {banner_url ? (
          <img
            src={banner_url}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500 ease-out"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-[10px] text-slate-400">No banner</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Solid dark mask at the bottom of the banner to hide pre-baked image details */}
        <div className="absolute inset-x-0 bottom-0 h-9 bg-slate-950/90 flex items-center justify-between px-3.5 z-10 select-none">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider ${mode === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
            {mode === 'ONLINE' ? 'Virtual' : 'In-Person'}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[18px] sm:text-[20px] text-slate-950 line-clamp-2 mb-1.5 font-display leading-tight min-h-[50px]">
              {title}
            </h3>
            <p className="text-slate-500 text-[11px] font-normal line-clamp-2 leading-relaxed min-h-[34px]">
              {short_description}
            </p>
          </div>

          {/* Meta info single line (un-boxed) */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium py-1 w-full min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="shrink-0">{formattedDate}</span>
              <span className="text-slate-350 shrink-0">•</span>
              <span className="shrink-0">{startTimeStr}</span>
              <span className="text-slate-350 shrink-0">•</span>
              <span className="truncate text-slate-450" title={venue}>{venue}</span>
            </div>
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 pt-3.5">
            <span className="text-slate-400 font-medium">Availability</span>
            {isEnded ? (
              <span className="text-slate-450 font-bold text-[10px] uppercase tracking-wider">Closed</span>
            ) : isFull ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 text-[10px] uppercase tracking-wider">Sold Out</span>
            ) : (
              <span className="text-emerald-750 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 text-[10px] uppercase tracking-wider">{seatsLeft} seats remaining</span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {isEnded ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 font-semibold py-2.5 rounded-lg cursor-not-allowed text-xs"
            >
              Event Completed
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 font-semibold py-2.5 rounded-lg cursor-not-allowed text-xs"
            >
              Fully Booked
            </button>
          ) : (
            <Link
              href={`/events/${event_id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-[#232F3E] hover:bg-[#1a2535] text-white font-semibold py-2.5 rounded-lg shadow-sm text-xs transition-all duration-200 group/btn"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
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
      className={`group bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 relative overflow-hidden transition-all duration-200 shadow-xs ${isEnded ? 'ended-blur opacity-85' : ''}`}
    >
      {/* Thumbnail */}
      <div className="w-full md:w-32 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative">
        {banner_url ? (
          <img
            src={banner_url}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-[10px] text-slate-400">No banner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <span className="absolute top-2 left-2 bg-[#232F3E]/90 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
          {category}
        </span>
        
        <span className={`absolute bottom-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider ${
          mode === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
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
      <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-950 font-display text-[17px] truncate leading-snug">
              {title}
            </h3>
            {isFull && !isEnded && (
              <span className="bg-rose-50 text-rose-700 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-rose-100 shrink-0">
                Full
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[11px] font-normal leading-relaxed line-clamp-1 mt-0.5">
            {short_description}
          </p>
        </div>

        {/* Metadata single line */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate mt-2.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="shrink-0">{formattedDate}</span>
          <span className="text-slate-300 shrink-0">•</span>
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="shrink-0">{startTimeStr}</span>
          <span className="text-slate-300 shrink-0">•</span>
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[250px]" title={venue}>{venue}</span>
        </div>
      </div>

      {/* Right section: Action & Availability */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-slate-100 md:border-l md:border-t-0 md:pl-6 pt-3 md:pt-0 shrink-0 md:w-44">
        <div className="text-right">
          {isEnded ? (
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Closed</span>
          ) : isFull ? (
            <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 text-[10px] uppercase tracking-wider">Sold Out</span>
          ) : (
            <span className="text-emerald-750 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 text-[10px] uppercase tracking-wider">{seatsLeft} seats left</span>
          )}
        </div>

        <div className="shrink-0 w-24 md:w-full mt-1">
          {isEnded ? (
            <button
              disabled
              className="w-full text-center text-xs font-semibold py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
            >
              Ended
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full text-center text-xs font-semibold py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
            >
              Full
            </button>
          ) : (
            <Link
              href={`/events/${event_id}`}
              className="w-full flex items-center justify-center gap-1 bg-[#232F3E] hover:bg-[#1a2535] text-white text-xs font-semibold py-2 rounded-lg shadow-sm transition group/btn"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});
