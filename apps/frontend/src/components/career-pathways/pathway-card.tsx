"use client";

import Link from "next/link";
import { CareerRoleListItem } from "@/lib/types";
import { Route, GraduationCap, BriefcaseBusiness, ArrowRight } from "lucide-react";

interface PathwayCardProps {
  role: CareerRoleListItem;
}

export function PathwayCard({ role }: PathwayCardProps) {
  return (
    <Link href={`/core/career-pathways/${role.id}`} className="group block h-full">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#FF9900]/70 hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col relative h-full p-6 pt-7">

        {/* Header section */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 transition-colors duration-300 group-hover:bg-orange-50 group-hover:text-[#FF9900] group-hover:border-[#FF9900]/20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <Route className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight group-hover:text-[#FF9900] transition-colors duration-300 truncate">
              {role.name}
            </h3>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-slate-50 border border-slate-200/60 text-[9px] font-mono text-slate-500 select-all">
                ROLE: <span className="text-slate-400 font-bold">{role.id.substring(0, 8).toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12.5px] font-normal text-slate-505 leading-relaxed flex-1 mt-4 line-clamp-3 min-h-[54px]">
          {role.description || "No description provided for this career role pathway."}
        </p>

        {/* Info & Action Footer Row */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 text-[10.5px] font-semibold transition-all duration-200 group-hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
              <span>Certs</span>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold leading-none shrink-0">
                {role._count.certifications}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 text-[10.5px] font-semibold transition-all duration-200 group-hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />
              <span>Opps</span>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 text-[10px] font-bold leading-none shrink-0">
                {role._count.opportunities}
              </span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#FF9900] transition-colors duration-300">
            <span>Manage</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#FF9900] group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}
