"use client";

import React from "react";
import { attendanceRecords } from "@/lib/data/crewMockData";

export default function AttendanceTracker() {
  const presentCount = attendanceRecords.filter(
    (r) => r.status === "present"
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status === "absent"
  ).length;
  const rate = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full select-none">
      <h2 className="text-lg font-bold font-display text-foreground">
        My Attendance
      </h2>

      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-brand-teal px-3 py-1 text-[10px] font-semibold text-white">
          Present {presentCount}
        </span>
        <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold text-white">
          Absent {absentCount}
        </span>
        <span className="rounded-full bg-brand-orange px-3 py-1 text-[10px] font-semibold text-white">
          Rate {rate}%
        </span>
      </div>

      <div className="mt-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-1 space-y-2 flex-1">
        {attendanceRecords.map((record) => (
          <div
            key={record.eventId}
            className="flex items-center justify-between rounded-lg bg-white/30 backdrop-blur-sm p-3 border border-white/30"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  record.type === "class"
                    ? "bg-brand-blue"
                    : "bg-brand-orange"
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {record.eventTitle}
                </p>
                <p className="text-xs text-foreground/50">
                  {record.date} ·{" "}
                  <span className="capitalize">{record.type}</span>
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                record.status === "present"
                  ? "bg-brand-teal/10 text-brand-teal"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {record.status === "present" ? "Present" : "Absent"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
