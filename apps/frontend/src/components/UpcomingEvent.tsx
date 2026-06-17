"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import GlassCard from "./GlassCard";
import { useEvents } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";

export default function UpcomingEvent() {
  const { data: realEvents = [], isLoading } = useEvents();

  // Pick the next upcoming event (earliest date >= today)
  const today = new Date();
  const upcoming = realEvents
    .map(e => ({ ...e, _date: new Date(e.start_datetime) }))
    .filter(e => e._date >= today)
    .sort((a, b) => a._date.getTime() - b._date.getTime());

  const event = upcoming.length > 0 ? upcoming[0] : null;

  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-medium text-foreground font-display">Loading Events...</h3>
      </GlassCard>
    );
  }

  if (!event) {
    return (
      <GlassCard style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4 text-brand-blue">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-foreground font-display">No Upcoming Events</h3>
        <p className="text-sm text-foreground/50 mt-1.5 max-w-xs">
          Check back later for new workshops, meetups, and conferences.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0 overflow-hidden flex flex-col lg:flex-row h-full border border-white/30" hoverEffect={false} style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }}>
      {/* Poster */}
      <div className="relative w-full lg:w-[42%] aspect-[4/5] overflow-hidden bg-slate-50">
        <img
          src={event.banner_url || "/default-event-poster.jpg"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full bg-brand-orange text-white text-xs font-medium uppercase tracking-wider">
            Upcoming
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-2xl font-semibold text-foreground font-display tracking-tight mb-1.5">
            {event.title}
          </h3>
          <p className="text-base text-foreground/70 leading-relaxed mb-4 line-clamp-3">
            {event.short_description}
          </p>

          {/* Details List */}
          <div className="space-y-3 mb-4 text-base text-foreground/85">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider leading-none">Date</span>
                <span className="font-semibold text-foreground/90 mt-0.5">{event._date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider leading-none">Time</span>
                <span className="font-semibold text-foreground/90 mt-0.5">{event._date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider leading-none">Venue</span>
                <span className="font-semibold text-foreground/90 mt-0.5 truncate">{event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Register CTA */}
        <div>
          <Link
            href={`/events/${event.event_id}`}
            className="w-full py-3.5 rounded-xl font-semibold text-base shadow-md transition-all duration-300 flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/95 text-white hover:shadow-brand-orange/15 hover:-translate-y-0.5"
          >
            <span>Register Now</span>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

