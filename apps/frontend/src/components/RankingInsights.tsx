"use client";

import React from "react";
import GlassCard from "./GlassCard";
import { Sparkles, ArrowRight, Zap, Target } from "lucide-react";

export default function RankingInsights() {
  const currentPoints = 1920;
  const targetPoints = 2010; // Priya Patel (Rank 4)
  const pointsNeeded = targetPoints - currentPoints;
  const progressPercent = Math.round((currentPoints / targetPoints) * 100);

  return (
    <GlassCard className="border border-white/20 h-full flex flex-col justify-between" hoverEffect={false}>
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-foreground font-display">Ranking Insights</h3>
          <p className="text-[11px] text-foreground/50">Your progress breakdown</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="space-y-4 flex-1">
        {/* Progress Bar Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-foreground/60 font-medium">Progress to Rank #4</span>
            <span className="font-medium text-brand-orange">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-orange to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats breakdown Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.03] flex flex-col">
            <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider">Current Percentile</span>
            <span className="text-lg font-semibold text-brand-orange font-display mt-0.5">Top 15%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.03] flex flex-col">
            <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider">Next Rank Goal</span>
            <span className="text-lg font-semibold text-brand-blue font-display mt-0.5">Rank #4</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.03] flex flex-col">
            <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider">Points Needed</span>
            <span className="text-lg font-semibold text-foreground font-display mt-0.5">+{pointsNeeded} pts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.03] flex flex-col">
            <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider">Projected Rank</span>
            <span className="text-lg font-semibold text-emerald-500 font-display mt-0.5">Rank #4</span>
          </div>
        </div>
      </div>

      {/* Footer / Tip */}
      <div className="mt-4 pt-4 border-t border-black/5 flex items-start gap-2 text-[11px] text-foreground/60 leading-normal">
        <Zap className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
        <span>
          <strong>Pro-tip:</strong> Earn <strong>100 points</strong> by registering for the upcoming AWS GenAI Workshop or attending AWS Community Day.
        </span>
      </div>
    </GlassCard>
  );
}

