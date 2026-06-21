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
      <div className="relative flex flex-col rounded-xl border border-slate-300 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out hover:shadow-[0_12px_30px_-6px_rgba(35,47,62,0.08),0_0_15px_rgba(255,153,0,0.15)] hover:translate-y-[-3px] hover:border-[#FF9900]/70 overflow-hidden h-full will-change-transform">
        {/* Icon & Details */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 transition-colors duration-300 group-hover:bg-orange-50 group-hover:text-[#FF9900] group-hover:border-[#FF9900]/20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <Route className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight transition-colors duration-300">
            {role.name}
          </h3>
        </div>

        {/* Description */}
        <p className="mt-4 text-xs font-normal text-slate-500 leading-relaxed flex-1">
          {role.description}
        </p>

        {/* Info Row */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
              <span>{role._count.certifications} Certs</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />
              <span>{role._count.opportunities} Opps</span>
            </div>
          </div>

          {/* Action indicator link */}
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-[#FF9900] transition-colors duration-300">
            <span>Manage</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#FF9900] group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}
