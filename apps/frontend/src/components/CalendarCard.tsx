"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Clock, MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
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
  
  // Previous month details
  const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonthIdx + 1, 0).getDate();

  // Day interface
  interface CalendarDayInfo {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  }

  const cells: CalendarDayInfo[] = [];

  // Add previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      month: prevMonthIdx,
      year: prevMonthYear,
      isCurrentMonth: false,
    });
  }

  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  // Add next month days to fill grid (42 cells)
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
  let nextMonthDay = 1;
  while (cells.length < 42) {
    cells.push({
      day: nextMonthDay++,
      month: nextMonthIdx,
      year: nextMonthYear,
      isCurrentMonth: false,
    });
  }

  /* ── filtered events for current month ── */
  const monthEvents = realEvents.filter(evt => {
    const d = parseEventDate(evt.start_datetime);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  // Filter events by selected day if one is active, otherwise show all month events
  const displayedEvents = selectedDay !== null
    ? monthEvents.filter(evt => parseEventDate(evt.start_datetime).getDate() === selectedDay)
    : monthEvents;

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
        className="glass-panel rounded-[22px] overflow-hidden p-4 border border-white/25 cursor-pointer select-none transition-all duration-[250ms] ease-out"
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
            <span className="text-xs font-bold text-foreground/50 tracking-wider uppercase">Calendar</span>
            <span className="text-xl font-bold text-foreground font-display tracking-tight mt-1">
              {MONTHS[today.getMonth()].slice(0, 3)} {today.getFullYear()}
            </span>
            <span className="text-xs font-semibold text-brand-orange mt-1">
              {upcomingCount} upcoming event{upcomingCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div
            onMouseEnter={() => setIconHovered(true)}
            onMouseLeave={() => setIconHovered(false)}
          >
            <AwsCloudWatchIcon className={`w-18 h-18 transition-transform duration-200 ${iconHovered ? "scale-110" : ""}`} />
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 w-full max-w-[430px] rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[88vh] bg-white border border-slate-200/80"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <AwsCloudWatchIcon className="w-9 h-9" />
                  <div>
                    <h2 className="text-base font-bold text-slate-800 leading-none">
                      Community Calendar
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                      Click a highlighted date to filter events
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40 transition-all cursor-pointer"
                  aria-label="Close calendar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Month / Year navigation ── */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm transition-all cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>

                {/* Month + Year shown together */}
                <span className="text-[15px] font-bold text-slate-700 font-display tracking-tight">
                  {MONTHS[viewMonth]} {viewYear}
                </span>

                <button
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm transition-all cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* ── Day-of-week headers ── */}
              <div className="grid grid-cols-7 px-6 pb-2.5 border-b border-slate-100 flex-shrink-0">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* ── Day grid ── */}
              <div className="grid grid-cols-7 px-6 py-4 gap-y-2.5 gap-x-1.5 flex-shrink-0">
                {cells.map((cell, idx) => {
                  const { day, month, year, isCurrentMonth } = cell;
                  const key = `${year}-${month}-${day}`;
                  const dayEvents = eventMap[key] ?? [];
                  const hasEvent = dayEvents.length > 0;
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
                  const isSelected = selectedDay === day && hasEvent && isCurrentMonth;

                  return (
                    <div key={`${key}-${idx}`} className="relative flex flex-col items-center">
                      <button
                        onClick={() => {
                          if (!isCurrentMonth) return;
                          if (!hasEvent) return;
                          setSelectedDay(prev => (prev === day ? null : day));
                        }}
                        disabled={!isCurrentMonth}
                        className={[
                          "w-9 h-9 flex flex-col items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 select-none relative",
                          !isCurrentMonth
                            ? "text-slate-300 opacity-40 cursor-default"
                            : isSelected
                              ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/40 scale-105"
                              : isToday
                                ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/30 font-bold"
                                : hasEvent
                                  ? "text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10 border border-brand-orange/20 cursor-pointer"
                                  : "text-slate-500 hover:bg-slate-50 cursor-default",
                        ].join(" ")}
                        aria-label={hasEvent ? `View events on ${MONTHS[month]} ${day}` : undefined}
                      >
                        <span>{day}</span>
                        {/* Event Dot */}
                        {hasEvent && (
                          <span 
                            className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-brand-orange"}`}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── Events list for the current month ── */}
              <div className="overflow-y-auto flex-1 px-6 py-5 bg-[#F8FAFC] border-t border-slate-100 custom-scrollbar">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {selectedDay !== null ? `Events on ${MONTHS[viewMonth]} ${selectedDay}` : "Events this Month"}
                  </p>
                  {selectedDay !== null && (
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-[10px] font-bold text-brand-orange hover:text-[#FFA524] hover:underline uppercase tracking-wider cursor-pointer border-none bg-transparent p-0"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {isLoading ? (
                    <p className="text-xs text-slate-400 py-2">Loading events...</p>
                  ) : displayedEvents.length > 0 ? (
                    displayedEvents.map(evt => {
                      const d = parseEventDate(evt.start_datetime);
                      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button
                          key={evt.event_id}
                          onClick={() => {
                            closeModal();
                            const basePath = pathname.startsWith('/crew') ? '/crew/events' : pathname.startsWith('/core') ? '/core/events' : '/events';
                            router.push(`${basePath}/${evt.event_id || (evt as any).id}`);
                          }}
                          className="group flex items-center justify-between gap-4 w-full text-left rounded-[12px] p-3 transition-all duration-200 cursor-pointer bg-white border border-slate-100 shadow-sm hover:border-brand-orange/40 hover:shadow-md hover:shadow-brand-orange/5"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-brand-orange" />
                            <div className="min-w-0">
                              <span className="font-bold text-sm text-slate-700 block truncate group-hover:text-brand-orange transition-colors leading-tight">
                                {evt.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                                  {timeStr}
                                </span>
                                <span className="text-slate-200 text-[10px]">•</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded-[4px]">
                                  {evt.mode || "In-Person"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-orange/10 group-hover:border-brand-orange/20 group-hover:text-brand-orange transition-all flex-shrink-0">
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-white border border-dashed border-slate-200 rounded-[12px]">
                      <CalendarDays className="w-7 h-7 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="text-xs text-slate-400 italic font-medium">
                        No events scheduled for this period.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

