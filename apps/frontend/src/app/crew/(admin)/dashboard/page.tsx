"use client";

import HeroBanner from "@/components/dashboard/crew/HeroBanner";
import CalendarCard from "@/components/dashboard/crew/CalendarCard";
import RoadmapProgress from "@/components/dashboard/crew/RoadmapProgress";
import Announcements from "@/components/dashboard/crew/Announcements";
import StatsCard from "@/components/StatsCard";
import { workAssignments, attendanceRecords } from "@/lib/data/crewMockData";

function WorkAssignmentsIcon({ className }: { className?: string }) {
  return (
    <img src="/aws-CloudWatch.svg" alt="Work Assignments" className={className} />
  );
}

function AttendanceIcon({ className }: { className?: string }) {
  return (
    <img src="/aws-CloudWatch.svg" alt="Attendance" className={className} />
  );
}

export default function CrewDashboardPage() {
  const pendingWork = workAssignments.filter((w) => w.status !== "approved").length;
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendanceRate = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 py-5 px-4 sm:px-6 lg:px-8">
      {/* Section 1 — Hero Banner */}
      <HeroBanner />

      {/* Section 2 — Stats Row: Work Assignments + Attendance + Calendar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <StatsCard
          label="Work Assignments"
          value={pendingWork}
          subtext="Pending Tasks"
          icon={WorkAssignmentsIcon}
          iconClass="text-brand-orange"
          iconBgClass="bg-brand-orange/10"
          bareIcon
          iconLabel="Work Assignments"
          style={{ background: "rgba(255, 255, 255, 0.92)" }}
        />
        <StatsCard
          label="My Attendance"
          value={`${attendanceRate}%`}
          subtext={`${presentCount} Present`}
          icon={AttendanceIcon}
          iconClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
          bareIcon
          iconLabel="Attendance"
          style={{ background: "rgba(255, 255, 255, 0.92)" }}
        />
        <CalendarCard />
      </section>

      {/* Section 3 — Two column: Roadmap + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <div
            className="flex flex-col flex-1 min-h-[400px] rounded-[22px] p-6 backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }}
          >
            <RoadmapProgress />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <div className="flex flex-col flex-1">
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
}
