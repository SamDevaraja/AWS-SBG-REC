"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";
import { CertificationFormDialog } from "@/components/certifications/certification-form-dialog";
import { CareerRoleFormDialog } from "@/components/career-pathways/career-role-form-dialog";
import { PathwayCard } from "@/components/career-pathways/pathway-card";
import { careerPathwaysService } from "@/services/career-pathways";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Clock,
  DollarSign,
  Loader2,
  User,
  FileText,
  Monitor,
  ArrowRight,
  GraduationCap,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Route,
} from "lucide-react";
import { toast } from "sonner";
import { CertificationLevel, CertificationListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LEVELS = ["All", "Foundational", "Associate", "Professional", "Specialty"];

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

function getCertTheme(examCode: string, level: string) {
  const code = examCode.toUpperCase();
  const lvl = level.toLowerCase();
  
  // Official AWS Brand Palette: Orange (Foundational), Blue (Associate), Charcoal/Navy (Professional), Violet/Purple (Specialty)
  if (lvl === "foundational" || code.startsWith("CLF") || code.startsWith("AIF")) {
    return {
      accent: "from-[#FF9900] to-[#FFB84D]", // AWS Orange
      progress: "bg-[#FF9900]",
      pillBg: "bg-[#FFF8F2] text-[#EC7211] border-[#FF9900]/15",
      badgeClass: "bg-[#FFF8F2] text-[#EC7211] border-[#FF9900]/25",
      hoverBorder: "hover:border-[#FF9900]/30",
      iconColor: "text-[#EC7211]",
      hoverText: "group-hover:text-[#EC7211]",
      hoverBg: "group-hover:bg-[#FFF8F2]",
      hoverPillBorder: "group-hover:border-[#FF9900]/30"
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

  // Specialty
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

function CertCard({
  cert,
  onDelete,
}: {
  cert: CertificationListItem;
  onDelete?: () => void;
}) {
  const level = typeof cert.level === "string" ? cert.level : cert.level?.name || "";
  const theme = getCertTheme(cert.examCode, level);
  const targetRoles = getTargetRoles(cert.slug);
  const domains = (cert.domains || []).slice(0, 2);

  return (
    <Link href={`/core/certifications/${cert.slug}`} className="group block">
      <div className={`relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 pt-7 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:translate-y-[-3px] ${theme.hoverBorder} overflow-hidden h-full will-change-transform`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.accent} rounded-t-2xl`} />

        {/* Admin Delete button (trash icon) */}
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

        <div className="flex items-center">
          <span
            className={`rounded-[6px] px-2.5 py-0.5 text-[9px] font-black tracking-wider border uppercase ${theme.badgeClass}`}
          >
            {level}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-800 tracking-tight leading-tight pr-8">
          {cert.title}
        </h3>

        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-505 font-medium">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{targetRoles}</span>
        </div>

        {/* Attributes: 3 columns + full width Mode to prevent truncation */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <Clock className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">DURATION</span>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap leading-none">
                  {formatDuration(cert.examDuration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <FileText className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">QUESTIONS</span>
                <span className="text-xs font-bold text-slate-700 leading-none">
                  {cert.totalQuestions ?? 65}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 min-w-0">
              <DollarSign className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">COST</span>
                <span className="text-xs font-bold text-slate-700 leading-none">
                  ${cert.examCost ?? 100}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 border border-slate-100/80 p-2 px-3 min-w-0">
            <Monitor className={cn("h-4 w-4 shrink-0", theme.iconColor)} />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none">EXAM MODE</span>
              <span className="text-xs font-bold text-slate-700 leading-none truncate pl-2" title={formatMode(cert.examMode)}>
                {formatMode(cert.examMode)}
              </span>
            </div>
          </div>
        </div>

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
                        className={`h-full ${theme.progress} rounded-full transition-all duration-500`}
                        style={{ width: `${dom.weightage}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {dom.topics.map((topic) => (
                        <span
                          key={topic.id}
                          className="rounded-[6px] bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] text-slate-500 font-semibold whitespace-nowrap"
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

function CertificationsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [addPathOpen, setAddPathOpen] = useState(false);

  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"certifications" | "pathways">("certifications");
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    if (tabParam === "pathways") {
      setActiveTab("pathways");
    } else {
      setActiveTab("certifications");
    }
  }, [tabParam]);

  useEffect(() => {
    if (levelParam) {
      const found = LEVELS.find((l) => l.toLowerCase() === levelParam.toLowerCase());
      if (found) {
        setSelectedLevel(found);
      }
    }
  }, [levelParam]);

  const handleTabChange = (tab: "certifications" | "pathways") => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === "pathways") {
      params.set("tab", "pathways");
    } else {
      params.delete("tab");
    }
    router.replace(`/core/certifications?${params.toString()}`);
  };

  const [deleteTarget, setDeleteTarget] = useState<CertificationListItem | null>(null);

  // Admin list query
  const {
    data: certifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: certificationsService.adminList,
  });

  // Career roles query
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["admin-career-roles"],
    queryFn: careerPathwaysService.listRoles,
  });

  // Dynamic levels from DB
  const { data: dbLevels = [] } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: certificationsService.listLevels,
  });

  // Fallback to correct DB IDs if fetch fails
  const levels = dbLevels && dbLevels.length > 0 ? dbLevels : [
    { id: "3723da5f-b3f7-4913-a742-433f70775386", name: "Foundational", displayOrder: 1 },
    { id: "36800f63-a96d-4ff2-b9f6-b0ded91b429d", name: "Associate", displayOrder: 2 },
    { id: "8660f00b-1534-4e5c-bfd5-b1144585d165", name: "Professional", displayOrder: 3 },
    { id: "40d5ff07-bfaf-4b7a-b6ee-165616e0356b", name: "Specialty", displayOrder: 4 },
  ];

  const createMutation = useMutation({
    mutationFn: certificationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification created");
      setAddOpen(false);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to create certification");
    },
  });

  const createPathMutation = useMutation({
    mutationFn: careerPathwaysService.createRole,
    onSuccess: (data) => {
      toast.success("Career role created");
      queryClient.invalidateQueries({ queryKey: ["admin-career-roles"] });
      setAddPathOpen(false);
      router.push(`/core/career-pathways/${data.id}`);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to create career role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => certificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete certification");
    },
  });

  // Extract count of certifications for each level
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: certifications?.length || 0,
      Foundational: 0,
      Associate: 0,
      Professional: 0,
      Specialty: 0,
    };
    if (certifications) {
      for (const cert of certifications) {
        const lvlName = typeof cert.level === "string" ? cert.level : cert.level.name;
        if (lvlName && lvlName in counts) {
          counts[lvlName]++;
        }
      }
    }
    return counts;
  }, [certifications]);

  // Filter certifications by selected level
  const filteredCertifications = useMemo(() => {
    if (!certifications) return [];
    if (selectedLevel.toLowerCase() === "all") {
      const levelOrder: Record<string, number> = {
        Foundational: 1,
        Associate: 2,
        Professional: 3,
        Specialty: 4,
      };
      return [...certifications].sort((a, b) => {
        const levelA = typeof a.level === "string" ? a.level : a.level?.name || "";
        const levelB = typeof b.level === "string" ? b.level : b.level?.name || "";
        const orderA = levelOrder[levelA] ?? 99;
        const orderB = levelOrder[levelB] ?? 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
    }
    return certifications.filter((cert) => {
      const lvlName = typeof cert.level === "string" ? cert.level : cert.level.name;
      return lvlName.toLowerCase() === selectedLevel.toLowerCase();
    });
  }, [certifications, selectedLevel]);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#1A1C1E] relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-[1440px] w-full mx-auto flex flex-col gap-6 z-10 relative">
      {/* Header Banner */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 95% 5%, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.08) 35%, rgba(255,255,255,0) 65%)',
          borderRadius: '24px',
          padding: '24px'
        }}
        className="border border-[#FFF0E0]/50"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            {/* Pill label */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AWS SBG REC · ADMIN DASHBOARD</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              {activeTab === "certifications" ? "All AWS Certifications" : "Career Pathways"}
            </h1>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: 8, margin: '8px 0 0 0' }}>
              {activeTab === "certifications" 
                ? "Select a difficulty level tab to browse AWS certifications. Each card shows detailed syllabus, duration, and exam weightages."
                : "Manage career roles and build structured cloud certification pathways to guide learners towards high-demand industry jobs."}
            </p>
          </div>
          
          {/* Action Buttons Side-by-Side */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {activeTab === "certifications" ? (
              <Button 
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <Plus size={13} className="text-white" />
                Add Certification
              </Button>
            ) : (
              <Button 
                onClick={() => setAddPathOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <Plus size={13} className="text-white" />
                Create Pathway
              </Button>
            )}
          </div>
        </div>
        {/* Orange divider */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
      </section>

      {/* Sleek Modern Tabs Bar */}
      <div className="flex border-b border-slate-200/80 gap-6 mt-2 mb-1 px-1">
        <button
          onClick={() => handleTabChange("certifications")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all relative cursor-pointer border-none bg-transparent",
            activeTab === "certifications"
              ? "text-[#FF9900]"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          AWS Certifications
          {activeTab === "certifications" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900] rounded-full" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("pathways")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all relative cursor-pointer border-none bg-transparent",
            activeTab === "pathways"
              ? "text-[#FF9900]"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          Career Pathways
          {activeTab === "pathways" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900] rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "certifications" ? (
        <>
          {/* Tabs Row */}
          <section>
            <div className="flex flex-wrap gap-3">
              {LEVELS.map((level) => {
                const count = levelCounts[level] ?? 0;
                const isActive = selectedLevel.toLowerCase() === level.toLowerCase();
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={cn(
                      "flex items-center gap-2 rounded-[8px] px-4 py-2 text-xs font-bold border transition-all cursor-pointer shadow-sm",
                      isActive
                        ? "border-[#ff9900] text-slate-800 bg-white ring-1 ring-[#ff9900]/20"
                        : "border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700"
                    )}
                  >
                    <span>{level}</span>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-[6px] h-5 min-w-[20px] px-1.5 text-[10px] font-bold leading-none border",
                        isActive
                          ? "bg-[#FFF8F2] border-[#ff9900]/20 text-[#ff9900]"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Certifications Grid */}
          <section>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
                <p className="mt-4 text-sm text-slate-500 font-semibold">Loading certifications...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-3xl border border-red-100 bg-red-50/20 max-w-md mx-auto my-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100/80 text-[#ba1a1a] mb-4 ring-8 ring-red-50/50">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-2">
                  Connection Failed
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6 max-w-xs">
                  Failed to load certifications. Please check your network connection or server status and try again.
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-[#0B0F19] hover:bg-[#1E293B] text-white border border-[#1e293b]/50 px-5 py-2.5 rounded-[10px] font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 text-white" />
                  Retry Connection
                </Button>
              </div>
            ) : filteredCertifications.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No certifications"
                description="Add your first certification to get started under this level."
                action={
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Certification
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCertifications.map((cert) => (
                  <CertCard 
                    key={cert.id} 
                    cert={cert} 
                    onDelete={() => setDeleteTarget(cert)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Career Pathways Grid */
        <section>
          {rolesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
              <p className="mt-4 text-sm text-slate-500 font-semibold">Loading career pathways...</p>
            </div>
          ) : rolesError ? (
            <div className="flex flex-col items-center justify-center p-8 py-12 text-center rounded-3xl border border-red-100 bg-red-50/20 max-w-md mx-auto my-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <p className="text-sm font-semibold text-red-600">Failed to load career pathways. Please try again.</p>
            </div>
          ) : !roles?.length ? (
            <EmptyState
              icon={Route}
              title="No career pathways"
              description="Create your first career role to get started."
              action={
                <Button onClick={() => setAddPathOpen(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-[6px] text-[12px] font-semibold transition-all shadow-sm mt-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Pathway
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <PathwayCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add Certification Dialog */}
      <CertificationFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        levels={levels}
        isLoading={createMutation.isPending}
      />

      <CareerRoleFormDialog
        open={addPathOpen}
        onOpenChange={setAddPathOpen}
        onSubmit={(data) => createPathMutation.mutate(data)}
        isLoading={createPathMutation.isPending}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteTarget?.title}&rdquo;? 
              This will remove all associated domains and topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-750 text-white px-5 h-9 rounded-[10px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}

export default function CertificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading certifications directory...</p>
      </div>
    }>
      <CertificationsPageContent />
    </Suspense>
  );
}
