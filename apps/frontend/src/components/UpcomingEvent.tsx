"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";
import { useEvents } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";
import { getPosterSrcAndPosition } from "@/lib/utils";

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
    <GlassCard
      className="p-0 overflow-hidden flex flex-col lg:flex-row h-full border border-orange-100/70 shadow-sm rounded-xl"
      hoverEffect={false}
      style={{
        background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)"
      }}
    >
      {/* Poster */}
      {(() => {
        const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.banner_url);
        return (
          <div className="relative w-full lg:w-[42%] aspect-[4/5] lg:max-h-[360px] overflow-hidden bg-slate-50 rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl lg:rounded-br-none">
            <img
              src={imgPosterSrc}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-750 hover:scale-103 rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl lg:rounded-br-none"
              style={{ objectPosition: imgPosterPosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Upcoming Event
              </span>
            </div>
          </div>
        );
      })()}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 min-h-0 bg-transparent">
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-[19px] md:text-[21px] font-bold text-slate-800 tracking-tight leading-snug">
            {event.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-500 line-clamp-3">
            {event.short_description}
          </p>

          {/* Details List */}
          <div className="space-y-3.5 mt-1 text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-orange-100/50 flex items-center justify-center text-slate-500 flex-shrink-0">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Date</span>
                <span className="text-sm font-semibold text-slate-700 mt-0.5">{event._date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-orange-100/50 flex items-center justify-center text-slate-500 flex-shrink-0">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Time</span>
                <span className="text-sm font-semibold text-slate-700 mt-0.5">{event._date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-orange-100/50 flex items-center justify-center text-slate-500 flex-shrink-0">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Venue</span>
                <span className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Register CTA */}
        <div className="mt-auto pt-4">
          <Link
            href={`/events/${event.event_id}`}
            className="group w-full py-2.5 rounded-lg font-bold text-sm md:text-[14px] tracking-wide text-white transition-all duration-150 flex items-center justify-center gap-1.5 bg-[#FF9900] hover:bg-[#FFA524] shadow-sm hover:shadow"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

