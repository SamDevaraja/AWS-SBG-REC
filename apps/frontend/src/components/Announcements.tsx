"use client";

import React from "react";
import GlassCard from "./GlassCard";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Announcements() {
  return (
    <GlassCard className="flex flex-col h-full border border-white/20 min-h-[300px]" hoverEffect={false} style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.15))" }}>
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-medium text-foreground font-display">
            Community Announcements
          </h3>
        </div>
        <span className="text-sm text-foreground/50 font-medium">
          0 updates
        </span>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-4">
        <Bell className="w-8 h-8 text-foreground/30 mb-2" />
        <h4 className="text-base font-medium text-foreground">No Announcements Yet</h4>
        <p className="text-sm text-foreground/70 mt-1 max-w-[200px]">
          Watch this space for the latest updates.
        </p>
      </div>
    </GlassCard>
  );
}

