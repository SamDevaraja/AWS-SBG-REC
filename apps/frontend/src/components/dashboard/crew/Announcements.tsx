"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, ArrowUpRight } from "lucide-react";
import { announcements } from "@/lib/data/crewMockData";
import { cn } from "@/lib/utils";

const ANN_BACKGROUND = "bg-brand-orange/5";

export default function Announcements() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full rounded-[22px] p-6 overflow-hidden select-none min-h-[400px] backdrop-blur-md"
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

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[360px] custom-scrollbar space-y-4">
        {announcements.map((ann, idx) => (
          <div
            key={ann.id}
            className={cn(
              "group p-3 rounded-xl transition-colors relative cursor-pointer",
              ANN_BACKGROUND,
              idx !== announcements.length - 1 &&
                "border-b border-black/[0.04] pb-4"
            )}
          >
            <h4 className="text-[16px] font-bold text-foreground group-hover:text-brand-orange transition-colors flex items-center gap-1">
              <span>{ann.title}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </h4>

            <p className="text-sm text-foreground/75 leading-relaxed mt-1">
              {ann.description}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
