"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { certificationsService } from "@/services/api";
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  DollarSign,
  Monitor,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const levelBadgeConfig: Record<string, { badgeClass: string; color: string }> = {
  Foundational: { 
    badgeClass: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/25 hover:bg-[#F1F5F9]",
    color: "#5A6572"
  },
  Associate: { 
    badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25 hover:bg-[#F0F7FF]",
    color: "#0972D3"
  },
  Professional: { 
    badgeClass: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/25 hover:bg-[#E6F8FA]",
    color: "#0083A0"
  },
  Specialty: { 
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25 hover:bg-[#F8F5FF]",
    color: "#5A30A6"
  }
};

function getAwsOfficialUrl(slug: string): string {
  const suffix = slug.startsWith("aws-") ? slug.replace("aws-", "certified-") : slug;
  return `https://aws.amazon.com/certification/${suffix}/`;
}

export default function CertificationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: cert, isLoading, error } = useQuery({
    queryKey: ["certification", slug],
    queryFn: () => certificationsService.getBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
        <p className="mt-4 text-xs text-slate-500 font-semibold">Loading certification details...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-32 text-center">
        <p className="text-slate-500 font-medium">Certification not found.</p>
        <Link 
          href="/certifications" 
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-[#ff9900] hover:underline uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to certifications
        </Link>
      </div>
    );
  }

  const levelName = typeof cert.level === "string" ? cert.level : cert.level.name;
  const config = levelBadgeConfig[levelName] ?? levelBadgeConfig.Foundational;

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
                href={`/certifications?level=${levelName.toLowerCase()}`}
                className="hover:text-slate-850 transition-colors flex items-center gap-1 text-[#ff9900] font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#ff9900]" />
                <span>Certifications</span>
              </Link>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-400 font-normal">{levelName}</span>
            </nav>

            <div className="flex items-center mt-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight truncate">
                {cert.title}
              </h1>
            </div>
          </div>

          {/* Level Badges & Code */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={cn("text-[9px] font-extrabold px-2 py-0.5 rounded-[4px] uppercase border", config.badgeClass)}>
              {levelName}
            </Badge>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold bg-slate-100 border border-slate-200/80 rounded-[4px] px-1.5 py-0.5 shadow-sm">
              {cert.examCode}
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Domains list (Width: 9/12) */}
          <div className="lg:col-span-9 space-y-6">
            <h2 className="text-base font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">
              Exam Syllabus & Domains
            </h2>

            {(!cert.domains || cert.domains.length === 0) ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-xs text-slate-400 font-medium">No syllabus domains added yet for this certification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...cert.domains]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((domain, idx) => (
                    <div
                      key={domain.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 leading-snug">{domain.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-400 font-medium">
                              Domain Weightage: {domain.weightage}%
                            </p>
                          </div>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-[4px] border", config.badgeClass)}>
                          {domain.weightage}%
                        </span>
                      </div>

                      {/* Weightage Progress Bar */}
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${domain.weightage}%`,
                            backgroundColor: config.color 
                          }}
                        />
                      </div>

                      {domain.topics && domain.topics.length > 0 && (
                        <>
                          <Separator className="my-4 border-slate-100" />
                          <div>
                            <p className="mb-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Syllabus Topics
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {[...domain.topics]
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((topic) => (
                                  <span 
                                    key={topic.id} 
                                    className="inline-flex items-center gap-1 rounded-[6px] bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs text-slate-600 font-medium"
                                  >
                                    <BookOpen className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span>{topic.name}</span>
                                  </span>
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar (Width: 3/12) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            {/* Certification Badge Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 flex items-center justify-center mb-3">
                {cert.badgeImageUrl ? (
                  <img
                    src={cert.badgeImageUrl}
                    alt={cert.title}
                    className="h-full w-full object-contain animate-fade-in"
                  />
                ) : (
                  <GraduationCap className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                AWS Certified
              </span>
              <span className="text-[11px] font-extrabold text-slate-850 tracking-tight leading-snug max-w-[180px]">
                {cert.title.replace("AWS Certified ", "")}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-800 tracking-tight">Exam Details</h2>
              <div className="space-y-3">
                {/* Duration */}
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Duration</p>
                    <p className="text-xs font-bold text-slate-700 leading-none">{cert.examDuration || "90 min"}</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Questions</p>
                    <p className="text-xs font-bold text-slate-700 leading-none">{cert.totalQuestions ?? 65} Questions</p>
                  </div>
                </div>

                {/* Cost */}
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <DollarSign className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Exam Cost</p>
                    <p className="text-xs font-bold text-slate-700 leading-none">${cert.examCost ?? 100} USD</p>
                  </div>
                </div>

                {/* Mode */}
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <Monitor className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Exam Mode</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight">{cert.examMode || "Online or Pearson VUE"}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-2 border-t border-slate-100">
                <a 
                  href={getAwsOfficialUrl(cert.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-slate-950"
                >
                  <span>Official AWS Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
