"use client";

import { LevelGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, GraduationCap } from "lucide-react";

interface CertificationSelectorProps {
  levels: LevelGroup[];
  selectedIds: string[];
  getOrder: (certId: string) => number | null;
  onToggle: (certId: string) => void;
}

const levelBadgeColors: Record<string, string> = {
  Foundational: "bg-[#F1F5F9] text-[#5A6572] border border-[#5A6572]/15",
  Associate: "bg-[#F0F7FF] text-[#0972D3] border border-[#2E90FF]/15",
  Professional: "bg-[#E6F8FA] text-[#00627A] border border-[#00A4B4]/15",
  Specialty: "bg-[#F8F5FF] text-[#5A30A6] border border-[#8C60D6]/15",
};

export function CertificationSelector({
  levels,
  selectedIds,
  getOrder,
  onToggle,
}: CertificationSelectorProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 px-1">
        <GraduationCap size={16} className="text-[#FF9900]" />
        <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider m-0">
          Available AWS Certifications
        </h3>
      </div>
      
      {levels.map((level) => (
        <div 
          key={level.levelName} 
          className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4"
        >
          {/* Header of difficulty level group */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 m-0">
              {level.levelName}
            </h4>
            <span className={`inline-flex items-center rounded-[4px] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              levelBadgeColors[level.levelName] ?? "bg-slate-50 text-slate-500 border border-slate-200"
            }`}>
              {level.certifications.length} Available
            </span>
          </div>

          {/* List of selectables */}
          <div className="grid gap-2 sm:grid-cols-2">
            {level.certifications.map((cert) => {
              const order = getOrder(cert.id);
              const isSelected = order !== null;

              return (
                <button
                  key={cert.id}
                  onClick={() => onToggle(cert.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 border cursor-pointer select-none",
                    isSelected
                      ? "bg-orange-50/15 border-[#FF9900]/50 text-slate-800 shadow-xs"
                      : "bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300/80 text-slate-600"
                  )}
                >
                  {/* Custom Checkbox / Number Sequence circle */}
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-all",
                      isSelected
                        ? "border-[#FF9900]/35 bg-orange-50 text-[#FF9905] shadow-xs"
                        : "border-slate-200 bg-transparent text-slate-400 group-hover:border-slate-405 group-hover:text-slate-500"
                    )}
                  >
                    {isSelected ? (
                      order
                    ) : (
                      <Check className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-700 truncate m-0 leading-tight">
                      {cert.title.replace("AWS Certified ", "")}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                      {cert.examCode}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
