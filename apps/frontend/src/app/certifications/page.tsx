"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { certificationsService, careerPathwaysService } from "@/services/api";
import { CertificationListItem, LearnerPathwayDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Clock,
  DollarSign,
  Loader2,
  User,
  FileText,
  Monitor,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  { id: "cloud-architect", label: "Architect" },
  { id: "devops-engineer", label: "DevOps" },
  { id: "security-engineer", label: "Security" },
  { id: "data-engineer", label: "Data" },
  { id: "ml-engineer", label: "ML" },
  { id: "ai-engineer", label: "AI" },
  { id: "cloud-developer", label: "Developer" },
  { id: "networking-engineer", label: "Networking" },
];

const getTierColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "foundational": return "#5A6572";
    case "associate": return "#0972D3";
    case "professional": return "#0083A0";
    case "specialty": return "#5A30A6";
    default: return "#94A3B8";
  }
};

const getTierLabel = (level: string) => {
  switch (level.toLowerCase()) {
    case "foundational": return "Foundational";
    case "associate": return "Associate";
    case "professional": return "Professional";
    case "specialty": return "Specialty";
    default: return level;
  }
};

const shortenName = (name: string) => {
  return name.replace("AWS Certified ", "");
};

const LEVELS = ["All", "Foundational", "Associate", "Professional", "Specialty"];

const easeOut = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

const certItemVariants = {
  hidden: { opacity: 0, x: -15, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      delay: 0.1 + i * 0.08,
    },
  }),
};

const connectorVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 240,
      damping: 20,
      delay: 0.08 + i * 0.08,
    },
  }),
};

const arrowVariants = {
  hidden: { x: -6, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.12 + i * 0.08, duration: 0.2, ease: easeOut },
  }),
};

const careerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 26, delay: 0.25 },
  },
};

const oppVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.28 + i * 0.04, duration: 0.25, ease: easeOut },
  }),
};

const ROLE_DETAILS: Record<string, { role: string; path: string[]; salary: string }> = {
  "cloud-architect": {
    role: "A Cloud Architect designs and manages cloud infrastructure. They select suitable AWS services, ensure scalability, security, reliability, and optimize cloud costs for organizations.",
    path: [
      "AWS Certified Cloud Practitioner (recommended for beginners)",
      "AWS Certified Solutions Architect – Associate",
      "AWS Certified Solutions Architect – Professional"
    ],
    salary: "₹15 LPA – ₹35 LPA"
  },
  "devops-engineer": {
    role: "A DevOps Engineer automates software development and deployment processes, manages CI/CD pipelines, monitors applications, and improves collaboration between development and operations teams.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Developer – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified DevOps Engineer – Professional"
    ],
    salary: "₹6 LPA – ₹20 LPA"
  },
  "security-specialist": {
    role: "A Security Specialist protects cloud environments from cyber threats by implementing security policies, managing access controls, monitoring vulnerabilities, and ensuring compliance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified Security – Specialty"
    ],
    salary: "₹8 LPA – ₹25 LPA"
  },
  "data-engineer": {
    role: "A Data Engineer builds and maintains data pipelines, processes large volumes of data, and prepares data for analytics and business insights.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Data Engineer – Associate"
    ],
    salary: "₹7 LPA – ₹22 LPA"
  },
  "ml-engineer": {
    role: "An ML Engineer develops, trains, test, deploys, and maintains machine learning models for various applications.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified Data Engineer – Associate",
      "AWS Certified Machine Learning – Specialty"
    ],
    salary: "₹8 LPA – ₹25 LPA"
  },
  "ai-engineer": {
    role: "An AI Engineer designs and develops AI-powered applications using technologies such as Generative AI, Natural Language Processing, and Computer Vision.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified AI Practitioner",
      "AWS Certified Machine Learning – Specialty"
    ],
    salary: "₹10 LPA – ₹30 LPA"
  },
  "cloud-developer": {
    role: "A Cloud Developer develops, tests, and deploys cloud-native applications using AWS services while ensuring scalability and performance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Developer – Associate"
    ],
    salary: "₹5 LPA – ₹18 LPA"
  },
  "networking-engineer": {
    role: "A Networking Engineer designs, configures, and maintains network infrastructure, VPNs, routers, switches, and cloud networking services.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified SysOps Administrator – Associate",
      "AWS Certified Advanced Networking – Specialty"
    ],
    salary: "₹4 LPA – ₹15 LPA"
  },
  "cloud-support-engineer": {
    role: "A Cloud Support Engineer troubleshoots issues related to cloud infrastructure, networking, storage, and applications, ensuring smooth cloud operations.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹4 LPA – ₹12 LPA"
  },
  "site-reliability-engineer": {
    role: "A Site Reliability Engineer ensures that applications and services are highly available, reliable, and scalable through automation and monitoring.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate",
      "AWS Certified DevOps Engineer – Professional"
    ],
    salary: "₹10 LPA – ₹28 LPA"
  },
  "cloud-systems-administrator": {
    role: "A Cloud Systems Administrator manages cloud servers, operating systems, backups, monitoring tools, and system performance.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹5 LPA – ₹15 LPA"
  },
  "cloud-consultant": {
    role: "A Cloud Consultant advises organizations on cloud adoption, migration strategies, architecture design, and cost optimization.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate",
      "AWS Certified Solutions Architect – Professional"
    ],
    salary: "₹10 LPA – ₹30 LPA"
  },
  "cloud-migration-engineer": {
    role: "A Cloud Migration Engineer plans and executes the migration of applications, databases, and workloads from on-premises infrastructure to AWS cloud.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate"
    ],
    salary: "₹7 LPA – ₹18 LPA"
  },
  "database-administrator": {
    role: "A Cloud Database Administrator manages cloud databases, performs backups and recovery, optimizes performance, and ensures database security.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate or AWS Certified Data Engineer – Associate",
      "AWS Certified Database – Specialty"
    ],
    salary: "₹6 LPA – ₹20 LPA"
  },
  "cloud-operations-engineer": {
    role: "A Cloud Operations Engineer monitors cloud infrastructure, automates operational tasks, and ensures smooth day-to-day cloud operations.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified SysOps Administrator – Associate"
    ],
    salary: "₹6 LPA – ₹18 LPA"
  },
  "finops-engineer": {
    role: "A FinOps Engineer monitors and optimizes cloud spending, analyzes cloud usage, and helps organizations reduce cloud costs efficiently.",
    path: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate"
    ],
    salary: "₹8 LPA – ₹20 LPA"
  }
};

function getRoleDetails(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes("architect")) return ROLE_DETAILS["cloud-architect"];
  if (norm.includes("devops")) return ROLE_DETAILS["devops-engineer"];
  if (norm.includes("security")) return ROLE_DETAILS["security-specialist"];
  if (norm.includes("data")) return ROLE_DETAILS["data-engineer"];
  if (norm.includes("machine learning") || norm.includes("ml-engineer") || norm.includes("ml engineer") || norm.includes("ml")) return ROLE_DETAILS["ml-engineer"];
  if (norm.includes("ai engineer") || norm.includes("ai-engineer") || norm.includes("ai")) return ROLE_DETAILS["ai-engineer"];
  if (norm.includes("developer")) return ROLE_DETAILS["cloud-developer"];
  if (norm.includes("networking")) return ROLE_DETAILS["networking-engineer"];
  if (norm.includes("support")) return ROLE_DETAILS["cloud-support-engineer"];
  if (norm.includes("reliability") || norm.includes("sre")) return ROLE_DETAILS["site-reliability-engineer"];
  if (norm.includes("systems administrator") || norm.includes("sysadmin")) return ROLE_DETAILS["cloud-systems-administrator"];
  if (norm.includes("consultant")) return ROLE_DETAILS["cloud-consultant"];
  if (norm.includes("migration")) return ROLE_DETAILS["cloud-migration-engineer"];
  if (norm.includes("database") || norm.includes("dba")) return ROLE_DETAILS["database-administrator"];
  if (norm.includes("operations")) return ROLE_DETAILS["cloud-operations-engineer"];
  if (norm.includes("finops")) return ROLE_DETAILS["finops-engineer"];
  
  return {
    role: "A cloud computing specialist focused on design, implementation, and optimization of cloud infrastructure and services.",
    path: [],
    salary: "N/A"
  };
}

function RoleSection({
  path,
  dbBadgeMap,
}: {
  path: LearnerPathwayDetail;
  dbBadgeMap: Record<string, string>;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const certs = path.pathway as any[];
  const details = getRoleDetails(path.name);

  return (
    <div className="w-full [perspective:1200px] min-h-[460px] sm:min-h-[440px] relative">
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* FRONT FACE */}
        <div 
          onClick={() => setIsFlipped(true)}
          className={cn(
            "w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center transition-all duration-300 h-full cursor-pointer hover:shadow-md hover:border-slate-300/80",
            isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center mb-8 w-full relative">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              {path.name}
            </h3>
            <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              {path.description}
            </p>
          </div>

          <div 
            className={cn(
              "flex flex-nowrap items-start gap-2 sm:gap-3 w-full overflow-x-auto py-2.5 px-1",
              certs.length <= 2 
                ? "justify-center" 
                : certs.length === 3 
                  ? "justify-start lg:justify-center" 
                  : "justify-start"
            )}
          >
            {certs.map((pathItem: any, i: number) => {
              const cert = pathItem.certification;
              const tierColor = getTierColor(cert.level.name);
              const badgeUrl = cert.badgeImageUrl || dbBadgeMap[cert.slug];
              return (
                <React.Fragment key={cert.id}>
                  {i > 0 && (
                    <motion.div
                      className="flex items-start justify-center w-6 sm:w-8 shrink-0 select-none h-[100px] sm:h-[120px]"
                      variants={connectorVariants}
                      custom={i}
                    >
                      <motion.span
                        className="flex h-full items-center justify-center text-slate-300"
                        variants={arrowVariants}
                        custom={i}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        </div>
                      </motion.span>
                    </motion.div>
                  )}
                  
                  <Link 
                    href={`/certifications/${cert.slug}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="group/cert w-full max-w-[100px] sm:max-w-[120px] flex flex-col items-center gap-2 text-center no-underline text-inherit shrink-0"
                  >
                    <motion.div
                      className="w-full flex flex-col items-center gap-2"
                      variants={certItemVariants}
                      custom={i}
                    >
                      <div
                        className="w-full aspect-square rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer shadow-sm relative group-hover/cert:border-[var(--tier-color)] group-hover/cert:-translate-y-0.5 group-hover/cert:scale-[1.02] group-hover/cert:shadow-md"
                        style={{ "--tier-color": tierColor } as React.CSSProperties}
                      >
                        <div className="w-[75%] h-[75%] flex items-center justify-center">
                          {badgeUrl ? (
                            <img
                              src={badgeUrl}
                              alt={cert.title}
                              className="w-full h-full object-contain block transition-transform duration-300 group-hover/cert:scale-[1.08]"
                            />
                          ) : (
                            <GraduationCap size={32} style={{ color: tierColor }} />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 w-full">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-snug line-clamp-2 min-h-[32px] flex items-center justify-center">
                          {shortenName(cert.title)}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: tierColor }}>
                          {getTierLabel(cert.level.name)}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          <motion.div
            className="w-full mt-6 pt-5 border-t border-slate-100"
            variants={careerVariants}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-3">
                <BriefcaseBusiness size={13} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Career Opportunities</span>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-1.5">
                {path.opportunities.map((opp: any, i: number) => (
                  <motion.span
                    key={opp.id}
                    variants={oppVariants}
                    custom={i}
                    className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100/80 cursor-default"
                  >
                    {opp.title}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BACK FACE */}
        <div 
          onClick={() => setIsFlipped(false)}
          className={cn(
            "absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between transition-all duration-300 cursor-pointer hover:shadow-md",
            isFlipped ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full relative flex items-start justify-between">
            <div className="flex-1 text-left">
              <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Role Profile</span>
              <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight mt-0.5">
                {path.name}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex-1 flex flex-col gap-4 text-left overflow-y-auto premium-scrollbar pr-1 max-h-[220px] sm:max-h-[240px]">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Description</span>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                {details.role}
              </p>
            </div>

            {details.path.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Recommended Certifications</span>
                <ul className="space-y-1.5">
                  {details.path.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-bold leading-normal">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mb-1">Average Salary in India</span>
                <span className="text-[13px] font-extrabold text-slate-800 leading-none">
                  {details.salary}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Formatting helpers
function formatDuration(duration?: string): string {
  if (!duration) return "90 min";
  return duration.replace(" minutes", " min").replace(" minute", " min");
}

// Format the mode to match the reference picture
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
      accent: "from-[#5A6572] to-[#788896]", // AWS Foundational Slate Gray / Silver
      progress: "bg-[#5A6572]",
      pillBg: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/15",
      badgeClass: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/25",
      hoverBorder: "hover:border-[#5A6572]/30",
      iconColor: "text-[#5A6572]",
      hoverText: "group-hover:text-[#5A6572]",
      hoverBg: "group-hover:bg-[#F1F5F9]",
      hoverPillBorder: "group-hover:border-[#5A6572]/30"
    };
  }

  if (lvl === "associate" || code.startsWith("MLA") || code.startsWith("SAA") || code.startsWith("DVA") || code.startsWith("DEA")) {
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
      accent: "from-[#00A4B4] to-[#00627A]", // AWS Professional Teal
      progress: "bg-[#0083A0]",
      pillBg: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/15",
      badgeClass: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/25",
      hoverBorder: "hover:border-[#0083A0]/30",
      iconColor: "text-[#00627A]",
      hoverText: "group-hover:text-[#00627A]",
      hoverBg: "group-hover:bg-[#E6F8FA]",
      hoverPillBorder: "group-hover:border-[#00A4B4]/30"
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

function CertCard({ cert }: { cert: CertificationListItem }) {
  const level = typeof cert.level === 'string' ? cert.level : cert.level?.name || '';
  const theme = getCertTheme(cert.examCode, level);
  const targetRoles = getTargetRoles(cert.slug);
  const domains = (cert.domains || []).slice(0, 2);

  return (
    <Link href={`/certifications/${cert.slug}`} className="group block">
      <div className={`relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 pt-7 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:translate-y-[-3px] ${theme.hoverBorder} overflow-hidden h-full will-change-transform`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.accent} rounded-t-2xl`} />

        <div className="flex items-center">
          <span
            className={`rounded-[6px] px-2.5 py-0.5 text-[9px] font-black tracking-wider border uppercase ${theme.badgeClass}`}
          >
            {level}
          </span>
        </div>

        <h3 className={cn("mt-3 text-lg font-bold text-slate-800 tracking-tight leading-tight transition-colors duration-300", theme.hoverText)}>
          {cert.title}
        </h3>

        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-505 font-medium">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{targetRoles}</span>
        </div>

        {/* Attributes: 3 columns for short values, full width row below for Mode to prevent truncation */}
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
  const { data: certifications, isLoading, error, refetch } = useQuery({
    queryKey: ["certifications"],
    queryFn: certificationsService.list,
  });

  const { data: dbPathways, isLoading: pathwaysLoading } = useQuery({
    queryKey: ["career-pathways"],
    queryFn: careerPathwaysService.list,
  });

  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");

  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    if (levelParam) {
      const found = LEVELS.find((l) => l.toLowerCase() === levelParam.toLowerCase());
      if (found) {
        setSelectedLevel(found);
      }
    }
  }, [levelParam]);
  const [activeTab, setActiveTab] = useState<"certifications" | "pathways">("certifications");

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
        const lvl = typeof cert.level === 'string' ? cert.level : cert.level?.name;
        if (lvl && lvl in counts) {
          counts[lvl]++;
        }
      }
    }
    return counts;
  }, [certifications]);

  const levelOrder: Record<string, number> = {
    Foundational: 1,
    Associate: 2,
    Professional: 3,
    Specialty: 4,
  };

  const sortedCertifications = certifications
    ? [...certifications].sort((a, b) => {
        const levelA = typeof a.level === 'string' ? a.level : a.level?.name || '';
        const levelB = typeof b.level === 'string' ? b.level : b.level?.name || '';
        const orderA = levelOrder[levelA] ?? 99;
        const orderB = levelOrder[levelB] ?? 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.displayOrder - b.displayOrder;
      })
    : [];

  const filteredCertifications = useMemo(() => {
    if (selectedLevel.toLowerCase() === "all") {
      return sortedCertifications;
    }
    return sortedCertifications.filter((cert) => {
      const lvl = typeof cert.level === 'string' ? cert.level : cert.level?.name;
      return lvl && lvl.toLowerCase() === selectedLevel.toLowerCase();
    });
  }, [sortedCertifications, selectedLevel]);

  const dbBadgeMap = useMemo(() => {
    if (!certifications) return {};
    const map: Record<string, string> = {};
    for (const c of certifications) {
      if (c.badgeImageUrl) {
        map[c.slug] = c.badgeImageUrl;
      }
    }
    return map;
  }, [certifications]);

  const sortedPaths = useMemo(() => {
    if (!dbPathways) return [];
    return [...dbPathways].sort((a, b) => {
      const idxA = ROLES.findIndex(r => r.id === a.slug);
      const idxB = ROLES.findIndex(r => r.id === b.slug);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [dbPathways]);

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20">
      <div className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Header Banner */}
        <section
          style={{
            background: 'radial-gradient(ellipse at 95% 5%, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.08) 35%, rgba(255,255,255,0) 65%)',
            borderRadius: '24px',
            padding: '24px'
          }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              {/* Pill label */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AWS SBG REC · Certifications Directory</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                {activeTab === "certifications" ? "All AWS Certifications" : "AWS Career Pathways"}
              </h1>
              <p style={{ fontSize: '14px', color: '#475569', marginTop: 8, margin: '8px 0 0 0' }}>
                {activeTab === "certifications"
                  ? "Select a difficulty level tab to browse AWS certifications. Each card shows detailed syllabus, duration, and exam weightages."
                  : "See how AWS certifications stack up to guide your path to high-demand cloud roles."}
              </p>
            </div>

            {/* Custom Tab Switcher inside the Header Banner */}
            <div className="shrink-0 self-start lg:self-center mt-2 lg:mt-0">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-sm">
                <button
                  onClick={() => setActiveTab("certifications")}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer select-none tracking-tight",
                    activeTab === "certifications"
                      ? "text-slate-950"
                      : "text-slate-550 hover:text-slate-800"
                  )}
                >
                  {activeTab === "certifications" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/40 z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <GraduationCap className={cn("h-4 w-4 shrink-0 relative z-10 transition-colors", activeTab === "certifications" ? "text-[#ff9900]" : "text-slate-500")} />
                  <span className="relative z-10">AWS Certifications</span>
                </button>
                <button
                  onClick={() => setActiveTab("pathways")}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer select-none tracking-tight",
                    activeTab === "pathways"
                      ? "text-slate-950"
                      : "text-slate-550 hover:text-slate-800"
                  )}
                >
                  {activeTab === "pathways" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/40 z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <BriefcaseBusiness className={cn("h-4 w-4 shrink-0 relative z-10 transition-colors", activeTab === "pathways" ? "text-[#ff9900]" : "text-slate-500")} />
                  <span className="relative z-10">Career Pathways</span>
                </button>
              </div>
            </div>
          </div>
          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </section>

        <AnimatePresence mode="wait">
          {activeTab === "certifications" ? (
            <motion.div
              key="certifications-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* Tabs Row */}
              <div className="flex flex-wrap gap-3">
                {LEVELS.map((level) => {
                  const count = levelCounts[level] ?? 0;
                  const isActive = selectedLevel.toLowerCase() === level.toLowerCase();
                  
                  const LEVEL_THEMES: Record<string, {
                    activeBorder: string;
                    activeRing: string;
                    activeText: string;
                    badgeActiveBg: string;
                    badgeActiveBorder: string;
                    badgeActiveText: string;
                    hoverClass: string;
                  }> = {
                    all: {
                      activeBorder: "border-[#FF9900]",
                      activeRing: "ring-[#FF9900]/20",
                      activeText: "text-slate-800",
                      badgeActiveBg: "bg-[#FFF8F2]",
                      badgeActiveBorder: "border-[#FF9900]/20",
                      badgeActiveText: "text-[#FF9900]",
                      hoverClass: "hover:text-[#FF9900] hover:border-[#FF9900]/30 hover:bg-[#FFF8F2]/30",
                    },
                    foundational: {
                      activeBorder: "border-[#5A6572]",
                      activeRing: "ring-[#5A6572]/20",
                      activeText: "text-[#5A6572]",
                      badgeActiveBg: "bg-[#F1F5F9]",
                      badgeActiveBorder: "border-[#5A6572]/20",
                      badgeActiveText: "text-[#5A6572]",
                      hoverClass: "hover:text-[#5A6572] hover:border-[#5A6572]/30 hover:bg-[#F1F5F9]/30",
                    },
                    associate: {
                      activeBorder: "border-[#0972D3]",
                      activeRing: "ring-[#0972D3]/20",
                      activeText: "text-[#0972D3]",
                      badgeActiveBg: "bg-[#F0F7FF]",
                      badgeActiveBorder: "border-[#2E90FF]/20",
                      badgeActiveText: "text-[#0972D3]",
                      hoverClass: "hover:text-[#0972D3] hover:border-[#0972D3]/30 hover:bg-[#F0F7FF]/30",
                    },
                    professional: {
                      activeBorder: "border-[#00A4B4]",
                      activeRing: "ring-[#00A4B4]/20",
                      activeText: "text-[#00627A]",
                      badgeActiveBg: "bg-[#E6F8FA]",
                      badgeActiveBorder: "border-[#00A4B4]/20",
                      badgeActiveText: "text-[#00627A]",
                      hoverClass: "hover:text-[#00627A] hover:border-[#00A4B4]/30 hover:bg-[#E6F8FA]/30",
                    },
                    specialty: {
                      activeBorder: "border-[#5A30A6]",
                      activeRing: "ring-[#5A30A6]/20",
                      activeText: "text-[#5A30A6]",
                      badgeActiveBg: "bg-[#F8F5FF]",
                      badgeActiveBorder: "border-[#8C60D6]/20",
                      badgeActiveText: "text-[#5A30A6]",
                      hoverClass: "hover:text-[#5A30A6] hover:border-[#5A30A6]/30 hover:bg-[#F8F5FF]/30",
                    },
                  };

                  const theme = LEVEL_THEMES[level.toLowerCase()] ?? LEVEL_THEMES.all;

                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={cn(
                        "flex items-center gap-2 rounded-[8px] px-4 py-2 text-xs font-bold border transition-all cursor-pointer",
                        isActive
                          ? `${theme.activeBorder} ${theme.activeText} bg-white ring-1 ${theme.activeRing}`
                          : `border-slate-200 text-slate-500 bg-white hover:bg-slate-50 ${theme.hoverClass}`
                      )}
                    >
                      <span>{level}</span>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-[6px] h-5 min-w-[20px] px-1.5 text-[10px] font-bold leading-none border",
                          isActive
                            ? `${theme.badgeActiveBg} ${theme.badgeActiveBorder} ${theme.badgeActiveText}`
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cert Grid */}
              <div>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading certifications...</p>
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
                  <div className="py-20 text-center text-muted-foreground">
                    No certifications available for this level.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCertifications.map((cert) => (
                      <CertCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pathways-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* Career Pathways Grid */}
              <div>
                {pathwaysLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff9900]" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading pathways...</p>
                  </div>
                ) : sortedPaths.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground w-full">
                    No pathways available yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
                    {sortedPaths.map((path) => (
                      <RoleSection key={path.id} path={path} dbBadgeMap={dbBadgeMap} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
