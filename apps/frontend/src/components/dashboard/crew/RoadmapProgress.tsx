"use client";

import { CheckCircle, Clock, Lock } from "lucide-react";
import { roadmapItems } from "@/lib/data/crewMockData";
import type { RoadmapItem } from "@/lib/types/crew";

const levelBadge: Record<RoadmapItem["level"], string> = {
  Beginner: "bg-brand-teal/10 text-brand-teal",
  Intermediate: "bg-brand-orange/10 text-brand-orange",
  Advanced: "bg-brand-blue/10 text-brand-blue",
};

function statusIcon(item: RoadmapItem) {
  if (item.completed)
    return <CheckCircle className="h-5 w-5 text-brand-teal" />;
  if (item.inProgress) return <Clock className="h-5 w-5 text-brand-orange" />;
  return <Lock className="h-5 w-5 text-foreground/30" />;
}

function progressPercent(item: RoadmapItem): number {
  if (item.completed) return 100;
  if (item.inProgress) return 50;
  return 0;
}

export default function RoadmapProgress() {
  return (
    <div className="flex flex-col h-full select-none">
      <h2 className="text-lg font-bold font-display text-foreground">
        My Roadmap Progress
      </h2>

      <div className="mt-4 flex-1 grid grid-rows-3 gap-3">
        {roadmapItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl bg-white/30 backdrop-blur-sm p-5 border border-white/30"
          >
            <div>{statusIcon(item)}</div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-foreground">
                  {item.title}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelBadge[item.level]}`}
                >
                  {item.level}
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-orange to-amber-500 transition-all"
                  style={{ width: `${progressPercent(item)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-foreground/50">
                {progressPercent(item)}% Complete
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
