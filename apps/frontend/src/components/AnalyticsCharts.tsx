"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import GlassCard from "./GlassCard";
import { pointsProgress, participationTrend, achievementDistribution } from "@/data/analytics";
import { TrendingUp, CalendarRange, PieChartIcon } from "lucide-react";

// Client-side render guard wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[220px] flex items-center justify-center text-sm text-foreground/40 font-medium animate-pulse">
        Loading interactive chart...
      </div>
    );
  }

  return <>{children}</>;
}

export function PointsProgressChart() {
  return (
    <GlassCard className="border border-white/20 flex flex-col h-full" hoverEffect={false}>
      <div className="flex items-center gap-2 pb-4 mb-2 border-b border-black/5">
        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-foreground font-display">Points Progress</h3>
          <p className="text-[11px] text-foreground/50">Weekly points accumulation</p>
        </div>
      </div>

      <div className="w-full h-[220px] text-xs mt-2">
        <ClientOnly>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pointsProgress} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9900" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(0,0,0,0.4)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(0,0,0,0.4)" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  color: "#1A1C1E",
                }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#FF9900"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, stroke: "#FFF", fill: "#FF9900" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>
    </GlassCard>
  );
}

export function ParticipationTrendChart() {
  return (
    <GlassCard className="border border-white/20 flex flex-col h-full" hoverEffect={false}>
      <div className="flex items-center gap-2 pb-4 mb-2 border-b border-black/5">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
          <CalendarRange className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-foreground font-display">Participation Trend</h3>
          <p className="text-[11px] text-foreground/50">Events attended per month</p>
        </div>
      </div>

      <div className="w-full h-[220px] text-xs mt-2">
        <ClientOnly>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.4)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(0,0,0,0.4)" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  color: "#1A1C1E",
                }}
              />
              <Bar dataKey="attended" fill="#0073BB" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>
    </GlassCard>
  );
}

export function AchievementDistributionChart() {
  return (
    <GlassCard className="border border-white/20 flex flex-col h-full" hoverEffect={false}>
      <div className="flex items-center gap-2 pb-4 mb-2 border-b border-black/5">
        <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-foreground font-display">Achievement Distribution</h3>
          <p className="text-[11px] text-foreground/50">Activity percentage weight</p>
        </div>
      </div>

      <div className="w-full h-[220px] text-xs mt-2 flex flex-col justify-center">
        <ClientOnly>
          <div className="flex h-full items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={achievementDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {achievementDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      color: "#1A1C1E",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="w-1/2 flex flex-col gap-2 pl-2">
              {achievementDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-foreground/60 truncate leading-none">
                      {entry.name}
                    </span>
                    <span className="text-xs font-medium text-foreground mt-0.5">
                      {entry.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ClientOnly>
      </div>
    </GlassCard>
  );
}

