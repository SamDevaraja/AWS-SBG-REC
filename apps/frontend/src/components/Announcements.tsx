"use client";

import React from "react";
import GlassCard from "./GlassCard";
import { Bell, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnnouncements } from "@/lib/hooks";

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
    <GlassCard
      className="flex flex-col h-full border border-orange-100/70 shadow-sm rounded-xl !p-5 min-h-[300px]"
      hoverEffect={false}
      style={{
        background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)"
      }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/70 border border-orange-100/50 flex items-center justify-center text-slate-500">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">
            Community Announcements
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          {announcements.length} updates
        </span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex-1 space-y-3 pr-1 max-h-[380px] overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-slate-250 rounded" />
                <div className="h-3 w-16 bg-slate-250 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-slate-250 rounded mb-2" />
              <div className="h-3 w-full bg-slate-250 rounded" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
          <Bell className="w-7 h-7 text-slate-300 mb-2" />
          <h4 className="text-[13.5px] font-bold text-slate-700">No Announcements Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[210px] leading-relaxed">
            Watch this space for the latest updates.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 max-h-[380px] custom-scrollbar space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="group p-3.5 rounded-lg transition-all relative border border-slate-100 bg-white/50 hover:bg-white hover:border-orange-200/50 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase border", typeBadge(ann.type))}>
                    {typeLabel(ann.type)}
                  </span>
                  {ann.event?.title && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      @{ann.event.title}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {formatDate(ann.createdAt)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#FF9900] transition-colors flex items-center gap-1">
                <span>{ann.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-[#FF9900]" />
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 whitespace-pre-line">
                {ann.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
