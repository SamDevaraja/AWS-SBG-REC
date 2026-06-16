"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, ArrowUpRight, Calendar } from "lucide-react";
import { useAnnouncements } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'bg-blue-100/70 text-blue-800 border-blue-200/50',
    REMINDER: 'bg-amber-100/70 text-amber-800 border-amber-200/50',
    SCHEDULE_CHANGE: 'bg-rose-100/70 text-rose-800 border-rose-200/50',
    URGENT: 'bg-red-100/70 text-red-800 border-red-200/50',
    INFO: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/50',
  };
  return map[type] || 'bg-slate-100/70 text-slate-800 border-slate-200/50';
}

function typeLabel(type: string) {
  return type.replace(/_/g, ' ');
}

export default function Announcements() {
  const { data: announcements = [], isLoading } = useAnnouncements();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full rounded-[22px] p-6 overflow-hidden select-none min-h-[400px] backdrop-blur-md border border-white/20"
      style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.15))" }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-display">
            Announcements
          </h3>
        </div>
        <span className="text-sm text-foreground/50 font-medium">
          {announcements.length} updates
        </span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex-1 space-y-4 pr-1 max-h-[360px] overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-black/5 bg-white/30 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-black/10 rounded" />
                <div className="h-3 w-16 bg-black/10 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-black/10 rounded mb-2" />
              <div className="h-3 w-full bg-black/10 rounded" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-4">
          <Bell className="w-8 h-8 text-foreground/30 mb-2" />
          <h4 className="text-base font-medium text-foreground">No Announcements Yet</h4>
          <p className="text-sm text-foreground/70 mt-1 max-w-[200px]">
            Watch this space for the latest updates.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 max-h-[360px] custom-scrollbar space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="group p-4 rounded-xl transition-all relative border border-white/30 bg-white/20 hover:bg-white/30 hover:border-brand-orange/40 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase border", typeBadge(ann.type))}>
                    {typeLabel(ann.type)}
                  </span>
                  {ann.event?.title && (
                    <span className="text-[10px] font-semibold text-foreground/60">
                      @{ann.event.title}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-foreground/45 flex items-center gap-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {formatDate(ann.createdAt)}
                </span>
              </div>

              <h4 className="text-[15px] font-bold text-foreground group-hover:text-brand-orange transition-colors flex items-center gap-1">
                <span>{ann.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-brand-orange" />
              </h4>

              <p className="text-xs text-foreground/85 leading-relaxed mt-2 whitespace-pre-line">
                {ann.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
