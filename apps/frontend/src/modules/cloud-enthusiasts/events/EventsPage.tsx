'use client';

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import Link from 'next/link';
import { useEvents } from '../shared/hooks/useCloudEnthusiasts';
import { Event } from '../shared/types';
import { EC2ConsoleLoader, AnimatedEmptyState, ErrorAlert } from '../shared/components/Animations';
import { Search, Filter, Users, Calendar, MapPin, LayoutGrid, List, Clock, ArrowRight } from 'lucide-react';
import { EVENT_CATEGORIES, AVAILABILITY_FILTERS } from '../../../context/mockData';

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

export default function EventsPage() {
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

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-xl mx-auto">
        
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-semibold text-2xl text-slate-900 mb-1 font-display">
              Cloud Events &amp; Workshops
            </h1>
            <p className="text-slate-500 max-w-xl text-xs sm:text-sm font-normal">
              Browse through active cloud bootcamps, security workshops, and expert sessions. Reserve your seat instantly.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="mb-4 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input — bound to raw state for instant feedback */}
            <div className="md:col-span-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4 shrink-0" />
              </span>
              <input
                type="text"
                placeholder="Search by name, description, or venue..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-[8px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20 focus:border-[#0073bb] text-sm font-normal transition"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Filter className="h-4 w-4 shrink-0" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-10 pr-8 py-2.5 border border-slate-200 bg-white rounded-[8px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20 focus:border-[#0073bb] text-sm font-normal appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>

            {/* Availability Filter */}
            <div className="md:col-span-3 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Users className="h-4 w-4 shrink-0" />
              </span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="block w-full pl-10 pr-8 py-2.5 border border-slate-200 bg-white rounded-[8px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20 focus:border-[#0073bb] text-sm font-normal appearance-none cursor-pointer"
              >
                {AVAILABILITY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>

          </div>
        </div>

        {/* View mode bar */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-[12px] font-normal text-slate-400">
            {events && events.length > 0 ? (
              <span>Showing {events.length} active events</span>
            ) : null}
            {isRefetching && <span className="ml-2 text-[10px] font-medium text-[#232F3E]">(Syncing...)</span>}
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-[10px] border border-slate-200/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[8px] transition ${viewMode === 'grid' ? 'bg-white text-[#232F3E] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[8px] transition ${viewMode === 'list' ? 'bg-white text-[#232F3E] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Events Grid/List Presentation */}
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
          <div className="space-y-3.5">
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
// EventCard — memo-wrapped to skip re-renders when sibling cards change state
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

  return (
    <div 
      ref={cardRef}
      className={`group bg-white border border-slate-200 rounded-[10px] overflow-hidden shadow-sm flex flex-col h-full relative premium-glow-container ${isEnded ? 'ended-blur' : ''}`}
    >
      {/* Banner — lazy load offscreen images */}
      <div className="h-40 w-full relative overflow-hidden bg-slate-900 shrink-0">
        <img
          src={banner_url}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        <span className="absolute top-3 left-3 bg-white/95 text-slate-800 font-medium text-[10px] uppercase px-2.5 py-1 rounded-[6px] shadow-sm">
          {category}
        </span>
        
        {isEnded ? null : isFull ? (
          <span className="absolute top-3 right-3 bg-rose-600 text-white font-medium text-[10px] uppercase px-2.5 py-1 rounded-[6px] shadow-sm">
            Sold Out
          </span>
        ) : (
          <span className="absolute top-3 right-3 bg-amber-500 text-slate-900 font-medium text-[10px] uppercase px-2.5 py-1 rounded-[6px] shadow-sm">
            {seatsLeft} Seats Left
          </span>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-lg text-slate-800 line-clamp-1 mb-1.5 group-hover:text-[#232F3E] transition-colors duration-200 font-display">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-normal line-clamp-2 mb-4 leading-relaxed">
            {short_description}
          </p>

          <div className="space-y-2 mb-4 text-sm font-normal text-slate-600 border-t border-slate-50 pt-3.5">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
              <span>{startTimeStr} ({mode})</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Users className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
              <span>{registered} / {max_capacity} Registered</span>
            </div>
          </div>
        </div>

        <div>
          {isEnded ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 font-medium py-2 rounded-[8px] cursor-not-allowed text-xs"
            >
              Event Closed
            </button>
          ) : (
            <Link
              href={`/events/${event_id}`}
              className="w-full flex items-center justify-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 rounded-[8px] shadow-sm text-xs"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

  // Memoize date formatting
  const formattedDate = useMemo(
    () => new Date(start_datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    [start_datetime]
  );

  return (
    <div 
      ref={rowRef}
      className={`group bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden ${isEnded ? 'ended-blur' : ''}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* Thumbnail — lazy load */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-[8px] overflow-hidden shrink-0 relative">
          <img
            src={banner_url}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top"
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
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="bg-slate-100 text-slate-700 text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-[6px]">
              {category}
            </span>
            <span className="bg-[#232F3E]/10 text-[#232F3E] text-[10px] font-medium px-2.5 py-0.5 rounded-[6px]">
              {mode}
            </span>
          </div>
          
          <h3 className="font-medium text-base text-[#232F3E] group-hover:text-[#1a232f] transition truncate mb-0.5 font-display">
            {title}
          </h3>
          <p className="text-slate-400 text-xs font-normal line-clamp-1 mb-1 leading-normal">
            {short_description}
          </p>
          <div className="flex flex-wrap items-center text-slate-500 gap-x-3.5 gap-y-0.5 text-[10px] font-normal">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#232F3E]" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#232F3E]" />
              <span className="truncate max-w-[150px]">{venue}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Seats & Action Right Column */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-slate-50 pt-2.5 sm:border-t-0 sm:pt-0 shrink-0">
        <div className="text-left sm:text-right">
          <p className="text-slate-400 text-[10px] font-normal uppercase tracking-wider">Availability</p>
          {isEnded ? (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-[6px]">Completed</span>
          ) : isFull ? (
            <span className="text-xs font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-[6px]">Sold Out</span>
          ) : (
            <span className="text-xs font-medium text-teal-600 font-mono">{seatsLeft} seats</span>
          )}
        </div>

        {isEnded ? (
          <button
            disabled
            className="text-xs font-semibold px-3 py-2 rounded-[8px] bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed pointer-events-none"
          >
            Completed
          </button>
        ) : (
          <Link
            href={`/events/${event_id}`}
            className="text-xs font-medium px-4.5 py-2 bg-[#232F3E] text-white shadow-sm rounded-[8px]"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
});
