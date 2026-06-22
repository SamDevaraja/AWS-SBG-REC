"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CertificationListItem } from "@/lib/types";
import {
  Clock,
  DollarSign,
  FileText,
  Monitor,
  User,
  Trash2,
  ArrowRight,
  Award,
} from "lucide-react";

// Formatting helpers
function formatDuration(duration?: string): string {
  if (!duration) return "90 min";
  return duration.replace(" minutes", " min").replace(" minute", " min");
}

function formatMode(mode?: string): string {
  if (!mode) return "Online or Pearson VUE";
  const m = mode.toLowerCase();
  if (m.includes("online proctored") || m.includes("pearson vue") || m.includes("online or pearson vue")) {
    return "Online or Pearson VUE";
  }
  return mode;
}

// Target roles for certifications
function getTargetRoles(slug: string): string {
  const roles: Record<string, string> = {
    "aws-cloud-practitioner": "Sales, marketing, finance, project managers, managers",
    "aws-ai-practitioner": "Business analyst, IT support, marketing, product/project manager",
    "aws-machine-learning-engineer-associate": "Machine learning engineer, data scientist, software engineer",
    "aws-solutions-architect-associate": "Solutions architect, cloud engineer, systems administrator",
    "aws-developer-associate": "Software developer, application engineer, cloud developer",
    "aws-data-engineer-associate": "Data engineer, data architect, business intelligence developer",
    "aws-cloudops-engineer-associate": "SysOps administrator, DevOps engineer, systems architect",
    "aws-generative-ai-developer-professional": "GenAI developer, software developer, AI research engineer",
    "aws-solutions-architect-professional": "Senior solutions architect, principal cloud designer",
    "aws-devops-engineer-professional": "DevOps engineer, cloud infrastructure manager, SRE",
    "aws-advanced-networking-specialty": "Network architect, cloud network engineer, systems engineer",
    "aws-security-specialty": "Security analyst, security engineer, compliance specialist",
  };
  return roles[slug] ?? "Cloud professionals, IT specialists";
}

// Styling/theme config mapping based on level or examCode
function getCertTheme(examCode: string, level: string) {
  const code = examCode.toUpperCase();
  const lvl = level.toLowerCase();
  
  // Official AWS Brand Palette: Orange (Foundational), Blue (Associate), Charcoal/Navy (Professional), Violet/Purple (Specialty)
  
  if (lvl === "foundational" || code.startsWith("CLF") || code.startsWith("AIF")) {
    return {
      accent: "from-[#4F46E5] to-[#818CF8]", // Indigo
      progress: "bg-[#4F46E5]",
      pillBg: "bg-[#EEF2FF] text-[#4F46E5] border-[#818CF8]/15",
      badgeClass: "bg-[#EEF2FF] text-[#4F46E5] border-[#818CF8]/25",
      hoverBorder: "hover:border-[#4F46E5]/30",
      iconColor: "text-[#4F46E5]",
      hoverText: "group-hover:text-[#4F46E5]",
      hoverBg: "group-hover:bg-[#EEF2FF]",
      hoverPillBorder: "group-hover:border-[#4F46E5]/30"
    };
  }

  if (lvl === "associate" || code.startsWith("MLA") || code.startsWith("SAP") || code.startsWith("DVA") || code.startsWith("DEA")) {
    return {
      accent: "from-[#0972D3] to-[#2E90FF]", // AWS Blue
      progress: "bg-[#0972D3]",
      pillBg: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/15",
      badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25",
      hoverBorder: "hover:border-[#0972D3]/30",
      iconColor: "text-[#0972D3]",
      hoverText: "group-hover:text-[#0972D3]",
      hoverBg: "group-hover:bg-[#F0F7FF]",
      hoverPillBorder: "group-hover:border-[#2E90FF]/30"
    };
  }

  if (lvl === "professional" || code.startsWith("SAP") || code.startsWith("DOP")) {
    return {
      accent: "from-[#1D4ED8] to-[#1E3A8A]", // Deep Navy Blue
      progress: "bg-[#1D4ED8]",
      pillBg: "bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/15",
      badgeClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/25",
      hoverBorder: "hover:border-[#1D4ED8]/30",
      iconColor: "text-[#1D4ED8]",
      hoverText: "group-hover:text-[#1D4ED8]",
      hoverBg: "group-hover:bg-[#EFF6FF]",
      hoverPillBorder: "group-hover:border-[#1D4ED8]/30"
    };
  }

  // Specialty (e.g. Advanced Networking, Security)
  return {
    accent: "from-[#5A30A6] to-[#8C60D6]", // AWS Specialty Purple
    progress: "bg-[#5A30A6]",
    pillBg: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/15",
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25",
    hoverBorder: "hover:border-[#5A30A6]/30",
    iconColor: "text-[#5A30A6]",
    hoverText: "group-hover:text-[#5A30A6]",
    hoverBg: "group-hover:bg-[#F8F5FF]",
    hoverPillBorder: "group-hover:border-[#5A30A6]/30"
  };
}

function getSecondaryBadge(title: string, examCode: string, levelName: string): string {
  const code = examCode.toUpperCase();
  const t = title.toLowerCase();
  if (code.startsWith("AIF") || code.startsWith("AIP") || t.includes("ai")) return "AI";
  if (code.startsWith("MLA") || t.includes("machine learning") || t.includes("ml")) return "ML";
  if (t.includes("developer") || t.includes("dev")) return "DEV";
  if (t.includes("architect")) return "ARCHITECT";
  if (t.includes("data")) return "DATA";
  if (t.includes("security")) return "SECURITY";
  if (t.includes("networking")) return "NETWORKING";
  if (t.includes("cloudops") || t.includes("sysops") || t.includes("devops")) return "OPS";
  return levelName.toUpperCase();
}

interface CertificationCardProps {
  certification: CertificationListItem;
  onDelete?: () => void;
}

export function CertificationCard({ certification, onDelete }: CertificationCardProps) {
  const levelName = typeof certification.level === "string" ? certification.level : certification.level.name;
  const theme = getCertTheme(certification.examCode, levelName);
  const targetRoles = getTargetRoles(certification.slug);
  const secondaryBadge = getSecondaryBadge(certification.title, certification.examCode, levelName);
  const domains = (certification.domains || []).slice(0, 2);

  return (
    <Link href={`/core/certifications/${certification.slug}`} className="group block">
      <div className={cn(
        "relative flex flex-col rounded-2xl border border-slate-300 bg-white p-5 pt-7 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:translate-y-[-3px] overflow-hidden h-full will-change-transform",
        theme.hoverBorder
      )}>
        {/* Top colored border */}
        <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", theme.accent)} />

        {/* Delete button (trash icon) */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100 cursor-pointer z-10"
            title="Delete Certification"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Badges Row */}
        <div className="flex items-center gap-2">
          <span className={cn("rounded-[6px] px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider border uppercase", theme.badgeClass)}>
            {levelName.toUpperCase()}
          </span>
          <span className="rounded-[6px] px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider border bg-slate-50 text-slate-555 border-slate-300">
            {secondaryBadge}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-bold text-slate-800 tracking-tight leading-tight pr-8">
          {certification.title}
        </h3>

        {/* Target Roles */}
        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-505 font-medium">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{targetRoles}</span>
        </div>

        {/* Stats Grid: Hybrid 3-column + full-width to prevent truncation */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <Clock className={cn("h-4 w-4 shrink-0", theme.iconColor || "text-slate-455")} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">DURATION</span>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap leading-none">
                  {formatDuration(certification.examDuration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <FileText className={cn("h-4 w-4 shrink-0", theme.iconColor || "text-slate-455")} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">QUESTIONS</span>
                <span className="text-xs font-bold text-slate-700 leading-none">
                  {certification.totalQuestions ?? 65}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <DollarSign className={cn("h-4 w-4 shrink-0", theme.iconColor || "text-slate-455")} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">COST</span>
                <span className="text-xs font-bold text-slate-700 leading-none">
                  ${certification.examCost ?? 100}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 px-3 min-w-0">
            <Monitor className={cn("h-4 w-4 shrink-0", theme.iconColor || "text-slate-455")} />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none">EXAM MODE</span>
              <span className="text-xs font-bold text-slate-700 leading-none truncate pl-2" title={formatMode(certification.examMode)}>
                {formatMode(certification.examMode)}
              </span>
            </div>
          </div>
        </div>

        {/* Domains Section */}
        {domains.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-3">
                EXAM DOMAINS
              </div>

              <div className="space-y-4">
                {domains.map((dom) => (
                  <div key={dom.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                      <span className="truncate pr-2">{dom.name}</span>
                      <span className={cn("rounded-[4px] px-1.5 py-0.5 text-[9px] font-black leading-none border", theme.pillBg)}>
                        {dom.weightage}%
                      </span>
                    </div>

                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", theme.progress)}
                        style={{ width: `${dom.weightage}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(dom.topics || []).map((topic) => (
                        <span
                          key={topic.id}
                          className="rounded-[6px] bg-slate-50 border border-slate-100/80 px-2 py-0.5 text-[9px] text-slate-500 font-semibold whitespace-nowrap"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors duration-300">
                <span className={cn("text-slate-500 transition-colors duration-300", theme.hoverText)}>View Details</span>
                <ArrowRight className={cn("h-3 w-3 text-slate-400 transition-all duration-300 group-hover:translate-x-0.5", theme.hoverText)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
