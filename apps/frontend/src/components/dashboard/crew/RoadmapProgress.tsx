"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Lock,
  Zap,
  BookOpen,
  ChevronRight,
  Loader2,
  Trophy,
  Map,
} from "lucide-react";
import {
  learningService,
  progressService,
  type TopicSummary,
} from "@/services/roadmap.api";

const statusConfig = {
  COMPLETED: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar: "from-emerald-400 to-emerald-500",
    label: "Completed",
  },
  IN_PROGRESS: {
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "from-amber-400 to-orange-400",
    label: "In Progress",
  },
  NOT_STARTED: {
    icon: <Lock className="h-5 w-5 text-slate-400" />,
    badge: "bg-slate-100 text-slate-500 border border-slate-200",
    bar: "from-slate-300 to-slate-300",
    label: "Not Started",
  },
};

export default function RoadmapProgress() {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [xp, setXp] = useState(0);
  const [continueModule, setContinueModule] = useState<{
    name: string;
    topicSlug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [topicData, continueData, progressData] = await Promise.all([
          learningService.getTopicList(),
          learningService.getContinueModule(),
          progressService.getMyProgress(),
        ]);
        if (!active) return;
        setTopics(topicData);
        setContinueModule(continueData.module);
        setXp(progressData.currentXP);
      } catch (err: any) {
        if (!active) return;
        setError("Failed to load roadmap progress.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const totalModules = topics.reduce((s, t) => s + t.totalModules, 0);
  const completedModules = topics.reduce((s, t) => s + t.completedModules, 0);
  const overallPercent = totalModules > 0
    ? Math.round((completedModules / totalModules) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full select-none gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-foreground tracking-tight">
            My Roadmap Progress
          </h2>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
            <Zap className="w-3 h-3 text-amber-500 fill-current" />
            <span className="text-[11px] font-black text-amber-700">{xp} XP</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center gap-3 py-10">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold animate-pulse">
            Loading your progress...
          </span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Overall progress bar */}
          {totalModules > 0 && (
            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600">
                  Overall Progress
                </span>
                <span className="text-xs font-black text-slate-800">
                  {completedModules} / {totalModules} Modules
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                {overallPercent}% Complete
              </p>
            </div>
          )}

          {/* Topic cards */}
          <div className="flex flex-col gap-3 flex-1">
            {topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <BookOpen className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-semibold text-slate-400">
                  No topics available yet.
                </p>
              </div>
            ) : (
              topics.map((topic) => {
                const cfg =
                  statusConfig[topic.status] ?? statusConfig.NOT_STARTED;
                const pct =
                  topic.totalModules > 0
                    ? Math.round(
                        (topic.completedModules / topic.totalModules) * 100
                      )
                    : 0;
                const isActive =
                  continueModule?.topicSlug === topic.slug;

                return (
                  <div
                    key={topic.id}
                    className={`flex items-center gap-4 rounded-2xl p-4 border transition-all ${
                      isActive
                        ? "bg-white/60 border-amber-300/50 shadow-md shadow-amber-500/5"
                        : "bg-white/30 border-white/30"
                    }`}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">{cfg.icon}</div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {topic.name}
                        </p>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white whitespace-nowrap flex-shrink-0 animate-pulse">
                            CURRENT
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] font-semibold text-slate-500">
                          {topic.completedModules} / {topic.totalModules} modules
                        </p>
                        <p className="text-[10px] font-bold text-slate-600">
                          {pct}%
                        </p>
                      </div>
                    </div>

                    {/* Go arrow */}
                    {topic.unlocked && (
                      <Link
                        href={`/learn/${topic.slug}`}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-500 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        title={`Go to ${topic.name}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom CTA */}
          {continueModule && (
            <div className="mt-auto pt-2">
              <Link
                href={`/learn/${continueModule.topicSlug}`}
                className="flex items-center justify-between w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Continue: {continueModule.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
