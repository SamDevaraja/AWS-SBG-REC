"use client";

import React, { useState } from "react";
import StatsCard from "@/components/StatsCard";
import UpcomingEvent from "@/components/UpcomingEvent";
import Announcements from "@/components/Announcements";
import LeaderboardTable from "@/components/LeaderboardTable";
import GlassCard from "@/components/GlassCard";
import { useTickets, useEvents } from "@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts";
import {
  DynamicHeroBanner,
  DynamicCalendarCard,
} from "@/components/dynamic";

function AwsEventBridgeIcon({ className }: { className?: string }) {
  return (
    <img
      src="/aws-EventBridge.svg"
      alt="AWS EventBridge"
      className={className}
    />
  );
}

function AwsTrustedAdvisorIcon({ className }: { className?: string }) {
  return (
    <img
      src="/aws-TrustedAdvisor.svg"
      alt="AWS Trusted Advisor"
      className={className}
    />
  );
}

export default function Home() {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { data: tickets = [] } = useTickets();
  const { data: events = [] } = useEvents();

  const today = new Date();
  const upcomingCount = events.filter(e => new Date(e.start_datetime) >= today).length;
  return (
    <div className="p-5 md:p-8 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col gap-8 w-full">
        {/* 1. Welcome Hero Banner */}
        <DynamicHeroBanner onViewLeaderboardClick={() => setLeaderboardOpen(true)} />

        {/* 2. Statistics Section (3 columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <StatsCard
            label="Points"
            value="—"
            subtext="Community Points (Coming Soon)"
            icon={AwsTrustedAdvisorIcon}
            iconClass="text-600"
            bareIcon
            iconLabel="Trusted Advisor"
            onClick={() => setLeaderboardOpen(true)}
            delay={0.1}
            style={{ background: "rgba(255, 255, 255, 0.92)" }}
          />
          <StatsCard
            label="Events Attended"
            value={tickets.length.toString()}
            subtext={`${upcomingCount} Upcoming Community Events`}
            icon={AwsEventBridgeIcon}
            iconClass="text-600"
            bareIcon
            iconLabel="EventBridge"
            href="/events"
            delay={0.1}
            style={{ background: "rgba(255, 255, 255, 0.92)" }}
          />
          <DynamicCalendarCard />
        </section>

        {/* 3. Content Section (Upcoming Event | Announcements) */}
        <section id="events" className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8 items-stretch">
          {/* Left Side: Upcoming Event (60%) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1">
              <UpcomingEvent />
            </div>
          </div>

          {/* Right Side: Announcements (40%) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex-1">
              <Announcements />
            </div>
          </div>
        </section>
      </div>
      {leaderboardOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setLeaderboardOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl">
            <GlassCard className="overflow-hidden p-0 leaderboard-modal-panel" hoverEffect={false}>
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground font-display">Leaderboard</h3>
                <button onClick={() => setLeaderboardOpen(false)} className="text-foreground/60 p-2 rounded-lg hover:bg-black/5">Close</button>
              </div>
              <div className="p-4">
                <LeaderboardTable />
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
