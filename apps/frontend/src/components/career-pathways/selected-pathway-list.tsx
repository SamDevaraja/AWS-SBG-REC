"use client";

import { useQuery } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";
import { Button } from "@/components/ui/button";
import { X, Route, ArrowRight } from "lucide-react";

interface SelectedPathwayListProps {
  selectedIds: string[];
  onRemove: (certId: string) => void;
  onClear: () => void;
}

const levelBadgeColors: Record<string, string> = {
  Foundational: "bg-[#F1F5F9] text-[#5A6572] border border-[#5A6572]/20",
  Associate: "bg-[#F0F7FF] text-[#0972D3] border border-[#2E90FF]/20",
  Professional: "bg-[#E6F8FA] text-[#00627A] border border-[#00A4B4]/20",
  Specialty: "bg-[#F8F5FF] text-[#5A30A6] border border-[#8C60D6]/20",
};

function getLevelName(level: string | { name: string }): string {
  return typeof level === "string" ? level : level.name;
}

export function SelectedPathwayList({
  selectedIds,
  onRemove,
  onClear,
}: SelectedPathwayListProps) {
  const { data: allCerts } = useQuery({
    queryKey: ["admin-certifications-for-pathway"],
    queryFn: certificationsService.adminList,
    refetchOnMount: true,
    staleTime: 0,
  });

  const selectedCerts = selectedIds
    .map((id, index) => {
      const cert = allCerts?.find((c) => c.id === id);
      return cert ? { ...cert, order: index + 1 } : null;
    })
    .filter(Boolean);

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 m-0">
          <Route size={14} className="text-[#FF9900]" />
          Pathway Sequence
          {selectedIds.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 bg-orange-50 text-[#FF9900] rounded-[4px] text-[10px] font-bold">
              {selectedIds.length} Certs
            </span>
          )}
        </h3>
        {selectedIds.length > 0 && (
          <button 
            onClick={onClear}
            className="text-[11.5px] font-bold text-[#FF9900] hover:text-orange-700 transition-colors border-none bg-transparent cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedCerts.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-200/60 rounded-xl bg-slate-50/50">
          <div className="mx-auto w-9 h-9 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center mb-3 shadow-xs">
            <Route className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <p className="text-[12.5px] font-semibold text-slate-700 m-0">No certifications selected</p>
          <p className="text-[11.5px] text-slate-400 mt-1 mb-0 max-w-[240px] mx-auto leading-normal">
            Click certifications from the directory list to build a structured learning pathway.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 relative">
          {selectedCerts.map((cert, index) => {
            if (!cert) return null;
            const isLast = index === selectedCerts.length - 1;
            const lvlName = getLevelName(cert.level);

            return (
              <div key={cert.id} className="relative flex flex-col">
                <div className="group flex items-center gap-3.5 rounded-lg border border-slate-300 bg-white p-3.5 hover:border-[#FF9900]/45 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all duration-200">
                  {/* Step Number Circle */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#FF9900]/35 bg-orange-50 text-[#FF9905] text-[11px] font-bold shadow-xs">
                    {cert.order}
                  </div>
                  
                  {/* Title details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate m-0 leading-tight">
                      {cert.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">{cert.examCode}</span>
                  </div>

                  {/* Level Badge */}
                  <span className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                    levelBadgeColors[lvlName] ?? "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}>
                    {lvlName}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(cert.id)}
                    className="h-6 w-6 shrink-0 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    title="Remove from pathway"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Connecting arrow indicator between steps */}
                {!isLast && (
                  <div className="flex justify-center my-0.5 py-0.5">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
