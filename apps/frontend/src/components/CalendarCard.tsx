"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Clock, MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";
import { Event } from "@/modules/cloud-enthusiasts/shared/types";

function AwsCloudWatchIcon({ className }: { className?: string }) {
  return (
    <img
      src="/aws-cloudwatch.svg"
      alt="AWS CloudWatch"
      className={className}
    />
  );
}

// Parse "Jun 20, 2026" → Date object
function parseEventDate(dateStr: string): Date {
  return new Date(dateStr);
}

// Build lookup: "YYYY-M-D" → Event[]
function buildEventMap(evts: Event[]): Record<string, Event[]> {
  const map: Record<string, Event[]> = {};
  for (const evt of evts) {
    const d = parseEventDate(evt.start_datetime);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = [];
    map[key].push(evt);
  }
  return map;
}



const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarCard() {
  const router = useRouter();
  const today = new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [iconHovered, setIconHovered] = useState(false);

  const { data: realEvents = [], isLoading } = useEvents();

  const eventMap = buildEventMap(realEvents);
  const upcomingCount = realEvents.filter(e => parseEventDate(e.start_datetime) >= today).length;

  /* ── month navigation ── */
  const prevMonth = useCallback(() => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  }, [viewMonth]);

  /* ── day grid ── */
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  /* ── filtered events for current month ── */
  const monthEvents = realEvents.filter(evt => {
    const d = parseEventDate(evt.start_datetime);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  /* ── open/close ── */
  const openModal = () => { setSelectedDay(null); setIsOpen(true); };
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* ── Stat Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        onClick={openModal}
        className="glass-panel rounded-[22px] overflow-hidden p-6 border border-white/25 cursor-pointer select-none transition-all duration-[250ms] ease-out"
        style={{ background: "rgba(255, 255, 255, 0.92)" }}
        whileHover={{
          y: -3,
          boxShadow: "-12px 0 28px rgba(105, 145, 255, 0), 12px 0 28px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(15, 23, 42, 0.10)",
          borderColor: "rgba(255, 255, 255, 0.4)",
          transition: { duration: 0.25, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-medium text-foreground/60 tracking-wide uppercase">Calendar</span>
            <span className="text-3xl font-semibold text-foreground font-display tracking-tight mt-1">
              {MONTHS[today.getMonth()].slice(0, 3)} {today.getFullYear()}
            </span>
            <span className="text-xs font-semibold text-foreground/50 mt-1">
              {upcomingCount} upcoming event{upcomingCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div
            className="relative"
            onMouseEnter={() => setIconHovered(true)}
            onMouseLeave={() => setIconHovered(false)}
          >
            <AwsCloudWatchIcon className={`w-21 h-21 transition-transform duration-200 ${iconHovered ? "scale-110" : ""}`} />
            {iconHovered && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-semibold rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none tracking-wider uppercase z-30">
                CloudWatch
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="calendar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-[500px] rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] glass-panel"
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-black/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3.5">
                  <AwsCloudWatchIcon className="w-10 h-10" />
                  <div>
                    <h2 className="text-xl font-semibold text-foreground font-display leading-none">
                      Community Calendar
                    </h2>
                    <p className="text-xs text-foreground/50 mt-1">
                      Click a highlighted date to view its event
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2.5 rounded-xl hover:bg-black/5 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close calendar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Month / Year navigation ── */}
              <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl hover:bg-black/5 transition-colors text-foreground/70 cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Month + Year shown together */}
                <span className="text-lg font-medium text-foreground font-display tracking-tight">
                  {MONTHS[viewMonth]} {viewYear}
                </span>

                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl hover:bg-black/5 transition-colors text-foreground/70 cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* ── Day-of-week headers ── */}
              <div className="grid grid-cols-7 px-8 pb-2 flex-shrink-0">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-foreground/40 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* ── Day grid ── */}
              <div className="grid grid-cols-7 px-8 pb-4 gap-y-2 flex-shrink-0">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;

                  const key = `${viewYear}-${viewMonth}-${day}`;
                  const dayEvents = eventMap[key] ?? [];
                  const hasEvent = dayEvents.length > 0;
                  const isToday =
                    day === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();
                  const isSelected = selectedDay === day && hasEvent;

                  return (
                    <div key={key} className="relative flex flex-col items-center">
                      <button
                        onClick={() => {
                          if (!hasEvent) return;
                          setSelectedDay(prev => (prev === day ? null : day));
                        }}
                        className={[
                          "w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all duration-200 select-none",
                          isSelected
                            ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30 ring-2 ring-brand-orange/40 scale-110"
                            : isToday
                              ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30 font-semibold"
                              : hasEvent
                                ? "text-slate-800 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                                : "text-slate-500 hover:bg-slate-50 cursor-default",
                        ].join(" ")}
                        aria-label={hasEvent ? `View events on ${MONTHS[viewMonth]} ${day}` : undefined}
                      >
                        <span className="mt-0.5">{day}</span>
                        {/* Event Dot */}
                        <span 
                          className={`mt-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : hasEvent ? "bg-brand-orange" : "bg-transparent"}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── Events list for the current month ── */}
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/50 border-t border-slate-200/60 custom-scrollbar">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Events this Month
                </p>
                {isLoading ? (
                  <p className="text-xs text-slate-400 py-2">Loading events...</p>
                ) : monthEvents.length > 0 ? (
                  monthEvents.map(evt => {
                    const d = parseEventDate(evt.start_datetime);
                    const isHighlighted = selectedDay !== null && d.getDate() === selectedDay;
                    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <button
                        key={evt.event_id}
                        onClick={() => {
                          closeModal();
                          router.push(`/events/${evt.event_id}`);
                        }}
                        className={`flex items-start gap-3.5 w-full text-left rounded-[14px] px-4 py-3.5 transition-all duration-300 cursor-pointer ${isHighlighted
                            ? "bg-white border border-brand-orange/40 shadow-md shadow-brand-orange/5 translate-x-1"
                            : "bg-white/60 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                          }`}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-300 ${isHighlighted ? "bg-brand-orange scale-125 shadow-sm shadow-brand-orange/50" : "bg-brand-orange/40"}`} />
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold text-sm truncate block transition-colors duration-200 ${isHighlighted ? "text-brand-orange" : "text-slate-800"}`}>
                            {evt.title}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 block flex items-center gap-1.5 font-medium">
                            <CalendarDays className="w-3 h-3 text-slate-400" />
                            {dateStr} · {timeStr}
                          </span>
                        </div>
                        <ArrowRight className={`w-4 h-4 self-center transition-all duration-300 ${isHighlighted ? "text-brand-orange translate-x-0.5" : "text-slate-300 -translate-x-1 opacity-0 group-hover:opacity-100"}`} />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-foreground/40 italic py-2">
                    No events scheduled for this month.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

