"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { careerPathwaysService } from "@/services/api";
import {
  ArrowLeft,
  GraduationCap,
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const levelConfig: Record<string, { badgeClass: string; color: string; hoverBorder: string; hoverText: string }> = {
  Foundational: { 
    badgeClass: "bg-[#FFF8F2] text-[#EC7211] border-[#FF9900]/25 hover:bg-[#FFF8F2]", 
    color: "#FF9900",
    hoverBorder: "group-hover:border-[#FF9900]/30",
    hoverText: "group-hover:text-[#EC7211]"
  },
  Associate: { 
    badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25 hover:bg-[#F0F7FF]", 
    color: "#0972D3",
    hoverBorder: "group-hover:border-[#0972D3]/30",
    hoverText: "group-hover:text-[#0972D3]"
  },
  Professional: { 
    badgeClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/25 hover:bg-[#EFF6FF]", 
    color: "#1D4ED8",
    hoverBorder: "group-hover:border-[#1D4ED8]/30",
    hoverText: "group-hover:text-[#1D4ED8]"
  },
  Specialty: { 
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25 hover:bg-[#F8F5FF]", 
    color: "#5A30A6",
    hoverBorder: "group-hover:border-[#5A30A6]/30",
    hoverText: "group-hover:text-[#5A30A6]"
  },
};

export default function CareerPathwayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: pathway, isLoading, error } = useQuery({
    queryKey: ["career-pathway", slug],
    queryFn: () => careerPathwaysService.getBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading pathway details...</p>
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-32 text-center">
        <p className="text-slate-500 font-medium">Career pathway not found.</p>
        <Link 
          href="/certifications#career-pathways" 
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-[#ff9900] hover:underline uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pathways
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24">
      {/* Header Navigation Bar - Simple & Dedicated */}
      <header className="bg-white border-b border-slate-200/80 py-4 shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Breadcrumbs & Title Stack */}
          <div className="flex flex-col gap-1 min-w-0">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <Link 
                href="/certifications" 
                className="hover:text-slate-800 transition-colors flex items-center gap-1 text-slate-400 font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Pathways</span>
              </Link>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-850 font-semibold truncate max-w-[200px] sm:max-w-none">
                {pathway.name}
              </span>
            </nav>

            <div className="flex items-center gap-2.5 mt-1 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 p-1.5 shadow-sm">
                <Compass className="h-5 w-5 text-[#ff9900]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight truncate leading-tight">
                  {pathway.name}
                </h1>
                <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5 max-w-[600px]">
                  {pathway.description}
                </p>
              </div>
            </div>
          </div>

          {/* Level Badges & Count */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold bg-slate-100 border border-slate-200/80 rounded-[4px] px-2 py-0.5 shadow-sm">
              {pathway.pathway.length} Certifications
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Pathway Progression Timeline (Width: 8/12) */}
          <div className="lg:col-span-8">
            <h2 className="text-base font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2 mb-6">
              Certification Pathway
            </h2>
            
            {pathway.pathway.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-400 font-medium">
                No certifications in this pathway yet.
              </div>
            ) : (
              <div className="relative space-y-0 pl-2">
                {/* Vertical timeline track line */}
                <div className="absolute left-[29px] top-4 bottom-4 w-0.5 bg-slate-200" />

                {pathway.pathway
                  .sort((a, b) => a.pathOrder - b.pathOrder)
                  .map((item, idx) => {
                    const levelName = item.certification.level?.name ?? "Foundational";
                    const config = levelConfig[levelName] ?? levelConfig.Foundational;

                    return (
                      <div key={item.certification.id} className="relative flex gap-6 pb-8 last:pb-0">
                        {/* Step indicator */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-sm font-black shadow-sm"
                            style={{ borderColor: config.color, color: config.color }}
                          >
                            {idx + 1}
                          </div>
                        </div>

                        {/* Card */}
                        <div className="flex-1">
                          <Link
                            href={`/certifications/${item.certification.slug}`}
                            className="group block"
                          >
                            <div className={cn(
                              "relative flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]",
                              config.hoverBorder
                            )}>
                              {/* Left Accent Bar */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" 
                                style={{ backgroundColor: config.color }}
                              />

                              <div className="flex items-center gap-4 pl-1.5 min-w-0">
                                {/* Badge Image */}
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-2 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105">
                                  {item.certification.badgeImageUrl ? (
                                    <img
                                      src={item.certification.badgeImageUrl}
                                      alt={item.certification.title}
                                      className="h-full w-full object-contain animate-fade-in"
                                    />
                                  ) : (
                                    <GraduationCap className="h-6 w-6 text-slate-400" />
                                  )}
                                </div>

                                {/* Texts */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <Badge variant="outline" className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded-[4px] uppercase border whitespace-nowrap", config.badgeClass)}>
                                      {levelName}
                                    </Badge>
                                    <span className="text-[9px] text-slate-500 font-mono tracking-wider font-bold bg-slate-100 border border-slate-200/80 rounded-[4px] px-1.5 py-0.5 shadow-sm whitespace-nowrap">
                                      {item.certification.examCode}
                                    </span>
                                  </div>
                                  <h3 className={cn(
                                    "text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-snug transition-colors duration-300",
                                    config.hoverText
                                  )}>
                                    {item.certification.title}
                                  </h3>
                                </div>
                              </div>

                              {/* Right Chevron */}
                              <div className="flex items-center shrink-0 pr-1">
                                <ArrowRight className={cn(
                                  "h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1",
                                  config.hoverText
                                )} />
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Opportunities Sidebar (Width: 4/12) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#ff9900]" />
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">Career Opportunities</h2>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Complete this pathway to unlock eligibility and build competence for high-demand roles:
              </p>

              {pathway.opportunities.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No opportunities listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pathway.opportunities
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((opp) => (
                      <span 
                        key={opp.id} 
                        className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10.5px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100/80 cursor-default"
                      >
                        {opp.title}
                      </span>
                    ))}
                </div>
              )}

              <Separator className="my-5 border-slate-100" />
              
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <p className="text-[11px] text-slate-500 font-bold leading-normal">
                  Requires {pathway.pathway.length} {pathway.pathway.length === 1 ? 'Certification' : 'Certifications'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Follow the step-by-step track to achieve this career profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
