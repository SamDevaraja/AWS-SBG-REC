"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, FileText, DollarSign, Monitor } from "lucide-react";

/* ─────────────────────────────────────────────
   Full structured certification data
───────────────────────────────────────────── */
type Domain = { title: string; pct: number; topics: string[] };
type CertData = {
  key: string;
  name: string;
  level: "Foundational" | "Associate" | "Professional" | "Specialty";
  category: string;
  duration: string;
  questions: number;
  cost: string;
  mode: string;
  accent: string;
  intended?: string;
  domains: Domain[];
};

const certs: CertData[] = [
  /* ── FOUNDATIONAL ─────────────────────────── */
  {
    key: "cloud-practitioner",
    name: "AWS Certified Cloud Practitioner",
    level: "Foundational",
    category: "Cloud",
    duration: "90 min",
    questions: 65,
    cost: "$100",
    mode: "Online or Pearson VUE",
    accent: "from-[#ff9900] to-[#f6b74d]",
    domains: [
      { title: "Cloud Concepts", pct: 24, topics: ["Benefits of cloud", "AWS value proposition", "Global infrastructure", "Cloud migration", "Cloud economics"] },
      { title: "Security & Compliance", pct: 30, topics: ["Shared responsibility model", "IAM", "Security services", "Compliance", "Monitoring & Auditing"] },
      { title: "Cloud Technology & Services", pct: 34, topics: ["Compute", "Storage", "Database", "Networking", "App Integration", "Containers", "Migration", "Well-Architected Framework"] },
      { title: "Billing, Pricing & Support", pct: 12, topics: ["Pricing models", "Cost management tools", "AWS support plans", "Billing concepts"] },
    ],
  },
  {
    key: "ai-practitioner",
    name: "AWS Certified AI Practitioner",
    level: "Foundational",
    category: "AI",
    duration: "90 min",
    questions: 65,
    cost: "$100",
    mode: "Online or Pearson VUE",
    accent: "from-[#7c3aed] to-[#c084fc]",
    intended: "Business analyst, IT support, marketing, product/project manager",
    domains: [
      { title: "Fundamentals of AI and ML", pct: 20, topics: ["AI concepts", "ML lifecycle", "AWS AI/ML services", "Data concepts"] },
      { title: "Fundamentals of Generative AI", pct: 24, topics: ["Generative AI concepts", "Foundation models", "Use cases & capabilities"] },
      { title: "Applications of Foundation Models", pct: 28, topics: ["Prompt engineering", "RAG", "Fine-tuning", "AWS GenAI services"] },
      { title: "Guidelines for Responsible AI", pct: 14, topics: ["Responsible AI principles", "Bias", "Transparency"] },
      { title: "Security, Compliance & Governance", pct: 14, topics: ["AI security", "Privacy", "Governance frameworks"] },
    ],
  },
  /* ── ASSOCIATE ────────────────────────────── */
  {
    key: "machine-learning-associate",
    name: "AWS Certified Machine Learning – Associate",
    level: "Associate",
    category: "AI / ML",
    duration: "130 min",
    questions: 65,
    cost: "$150",
    mode: "Online or Pearson VUE",
    accent: "from-[#6d28d9] to-[#22c55e]",
    domains: [
      { title: "Data Preparation for ML", pct: 28, topics: ["Data ingestion", "Transformation & validation", "Storage", "Feature engineering"] },
      { title: "ML Model Development", pct: 26, topics: ["Model selection", "Training", "Hyperparameter tuning", "Evaluation"] },
      { title: "Deployment & Orchestration", pct: 22, topics: ["Inference endpoints", "CI/CD for ML", "Orchestration tools"] },
      { title: "Monitoring, Maintenance & Security", pct: 24, topics: ["Model monitoring", "Data/model drift", "Logging", "Security"] },
    ],
  },
  {
    key: "solutions-architect-associate",
    name: "AWS Certified Solutions Architect – Associate",
    level: "Associate",
    category: "Architecture",
    duration: "130 min",
    questions: 65,
    cost: "$150",
    mode: "Online or Pearson VUE",
    accent: "from-[#00a3e0] to-[#60a5fa]",
    domains: [
      { title: "Design Secure Architectures", pct: 30, topics: ["IAM", "Security controls", "Multi-account", "Encryption", "Network security"] },
      { title: "Design Resilient Architectures", pct: 26, topics: ["High availability", "Fault tolerance", "Backup & recovery"] },
      { title: "Design High-Performing Architectures", pct: 24, topics: ["Compute", "Storage", "Database", "Networking", "Caching"] },
      { title: "Design Cost-Optimized Architectures", pct: 20, topics: ["Cost management", "Right-sizing", "Lifecycle management"] },
    ],
  },
  {
    key: "developer-associate",
    name: "AWS Certified Developer – Associate",
    level: "Associate",
    category: "Developer",
    duration: "130 min",
    questions: 65,
    cost: "$150",
    mode: "Online or Pearson VUE",
    accent: "from-[#f97316] to-[#facc15]",
    domains: [
      { title: "Development with AWS Services", pct: 32, topics: ["Application development", "Lambda", "Data stores"] },
      { title: "Security", pct: 26, topics: ["Authentication", "Authorization", "Encryption"] },
      { title: "Deployment", pct: 24, topics: ["Artifacts", "Testing", "CI/CD pipelines"] },
      { title: "Troubleshooting & Optimization", pct: 18, topics: ["Monitoring", "Logging", "Performance", "Cost optimization"] },
    ],
  },
  {
    key: "data-engineer-associate",
    name: "AWS Certified Data Engineer – Associate",
    level: "Associate",
    category: "Data",
    duration: "130 min",
    questions: 65,
    cost: "$150",
    mode: "Online or Pearson VUE",
    accent: "from-[#0f766e] to-[#34d399]",
    domains: [
      { title: "Data Ingestion & Transformation", pct: 34, topics: ["Ingestion", "Processing", "Pipeline orchestration"] },
      { title: "Data Store Management", pct: 26, topics: ["Data modeling", "Schema design", "Lifecycle management"] },
      { title: "Data Operations & Support", pct: 22, topics: ["Monitoring", "Troubleshooting", "Performance optimization"] },
      { title: "Data Security & Governance", pct: 18, topics: ["Authentication", "Encryption", "Privacy", "Governance"] },
    ],
  },
  {
    key: "cloud-ops-associate",
    name: "AWS Certified Cloud Ops Engineer – Associate",
    level: "Associate",
    category: "Operations",
    duration: "130 min",
    questions: 65,
    cost: "$150",
    mode: "Online or Pearson VUE",
    accent: "from-[#334155] to-[#60a5fa]",
    domains: [
      { title: "Monitoring, Logging & Remediation", pct: 20, topics: ["CloudWatch", "CloudTrail", "Automated remediation"] },
      { title: "Reliability & Business Continuity", pct: 16, topics: ["HA design", "Backup", "DR strategies"] },
      { title: "Deployment, Provisioning & Automation", pct: 18, topics: ["IaC", "CDK", "CloudFormation"] },
      { title: "Security & Compliance", pct: 16, topics: ["IAM", "Encryption", "Compliance tools"] },
      { title: "Networking & Content Delivery", pct: 18, topics: ["VPC", "Route 53", "CloudFront"] },
      { title: "Cost & Performance Optimization", pct: 12, topics: ["Cost Explorer", "Trusted Advisor", "Auto Scaling"] },
    ],
  },
  /* ── PROFESSIONAL ─────────────────────────── */
  {
    key: "genai-developer",
    name: "AWS Certified Generative AI Developer",
    level: "Professional",
    category: "AI / GenAI",
    duration: "180 min",
    questions: 75,
    cost: "$300",
    mode: "Online or Pearson VUE",
    accent: "from-[#8b5cf6] to-[#ec4899]",
    domains: [
      { title: "Foundation Model Integration, Data & Compliance", pct: 31, topics: ["Foundation models", "Prompt engineering", "Embeddings", "Vector DBs", "Governance"] },
      { title: "Implementation & Integration", pct: 26, topics: ["Amazon Bedrock", "Multi-model architectures", "API patterns", "AI agents"] },
      { title: "AI Safety, Security & Governance", pct: 20, topics: ["Responsible AI", "Identity", "Content moderation", "Guardrails"] },
      { title: "Operational Efficiency & Optimization", pct: 12, topics: ["Cost", "Performance", "Scalability", "Monitoring"] },
      { title: "Testing, Validation & Troubleshooting", pct: 11, topics: ["Evaluation techniques", "Hallucination detection", "Debugging inference"] },
    ],
  },
  {
    key: "solutions-architect-professional",
    name: "AWS Certified Solutions Architect – Professional",
    level: "Professional",
    category: "Architecture",
    duration: "180 min",
    questions: 75,
    cost: "$300",
    mode: "Online or Pearson VUE",
    accent: "from-[#0f172a] to-[#f59e0b]",
    domains: [
      { title: "Design Solutions for Organizational Complexity", pct: 26, topics: ["Multi-account", "Hybrid environments", "Complex network design"] },
      { title: "Design for New Solutions", pct: 29, topics: ["HA", "Performance", "Cost-optimized design"] },
      { title: "Migration Planning", pct: 15, topics: ["Migration strategies", "Post-migration validation"] },
      { title: "Cost Control", pct: 10, topics: ["Cost management tools", "Budget alerts", "Savings plans"] },
      { title: "Continuous Improvement", pct: 20, topics: ["Operational excellence", "Security improvements", "Performance tuning"] },
    ],
  },
  {
    key: "devops-professional",
    name: "AWS Certified DevOps Engineer – Professional",
    level: "Professional",
    category: "DevOps",
    duration: "180 min",
    questions: 75,
    cost: "$300",
    mode: "Online or Pearson VUE",
    accent: "from-[#fb7185] to-[#f97316]",
    domains: [
      { title: "SDLC Automation", pct: 22, topics: ["CI/CD pipelines", "Build & deployment automation"] },
      { title: "Configuration Management & IaC", pct: 17, topics: ["CloudFormation", "CDK", "Drift detection"] },
      { title: "Resilient Cloud Solutions", pct: 15, topics: ["HA design", "Auto Scaling", "Fault tolerance"] },
      { title: "Monitoring & Logging", pct: 15, topics: ["CloudWatch", "X-Ray", "Observability"] },
      { title: "Incident & Event Response", pct: 14, topics: ["EventBridge", "SNS/SQS", "Auto-remediation"] },
      { title: "Security & Compliance", pct: 17, topics: ["IAM", "Secrets Manager", "Compliance automation"] },
    ],
  },
  /* ── SPECIALTY ────────────────────────────── */
  {
    key: "advanced-networking-specialty",
    name: "AWS Certified Advanced Networking – Specialty",
    level: "Specialty",
    category: "Networking",
    duration: "170 min",
    questions: 65,
    cost: "$300",
    mode: "Online or Pearson VUE",
    accent: "from-[#1d4ed8] to-[#22d3ee]",
    domains: [
      { title: "Network Design", pct: 30, topics: ["Hybrid connectivity", "Direct Connect", "Transit Gateway", "SD-WAN"] },
      { title: "Network Implementation", pct: 26, topics: ["VPC", "Route 53", "CloudFront", "Load balancing"] },
      { title: "Network Management & Operation", pct: 20, topics: ["Monitoring", "Observability", "Capacity planning"] },
      { title: "Network Security, Compliance & Governance", pct: 24, topics: ["Traffic inspection", "Security groups", "NACLs", "Compliance"] },
    ],
  },
  {
    key: "security-specialty",
    name: "AWS Certified Security – Specialty",
    level: "Specialty",
    category: "Security",
    duration: "170 min",
    questions: 65,
    cost: "$300",
    mode: "Online or Pearson VUE",
    accent: "from-[#0f766e] to-[#14b8a6]",
    domains: [
      { title: "Threat Detection & Incident Response", pct: 14, topics: ["GuardDuty", "Detective", "Security Hub", "Incident runbooks"] },
      { title: "Security Logging & Monitoring", pct: 18, topics: ["CloudTrail", "CloudWatch", "Athena for logs"] },
      { title: "Infrastructure Security", pct: 20, topics: ["VPC security", "WAF", "Shield", "Firewall Manager"] },
      { title: "Identity & Access Management", pct: 16, topics: ["IAM policies", "SCP", "Permission boundaries", "SSO"] },
      { title: "Data Protection", pct: 18, topics: ["KMS", "ACM", "Encryption at rest/transit", "Macie"] },
      { title: "Management & Security Governance", pct: 14, topics: ["AWS Config", "Control Tower", "Compliance frameworks"] },
    ],
  },
];

/* ─────────────────────────────────────────────
   Config
───────────────────────────────────────────── */
const levels = ["Foundational", "Associate", "Professional", "Specialty"] as const;

const levelMeta: Record<string, { badge: string; tab: string; ring: string }> = {
  Foundational: { badge: "bg-[#fff3e0] text-[#8a4d00]",   tab: "border-[#ff9900] text-[#8a4d00]",   ring: "#ff9900" },
  Associate:    { badge: "bg-[#e0f2fe] text-[#075985]",   tab: "border-[#00a3e0] text-[#075985]",   ring: "#00a3e0" },
  Professional: { badge: "bg-[#f3e8ff] text-[#6b21a8]",   tab: "border-[#8b5cf6] text-[#6b21a8]",   ring: "#8b5cf6" },
  Specialty:    { badge: "bg-[#d1fae5] text-[#065f46]",   tab: "border-[#0f766e] text-[#065f46]",   ring: "#0f766e" },
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function CertificationsPage() {
  const [activeLevel, setActiveLevel] = useState<string>("Foundational");

  const visible = certs.filter((c) => c.level === activeLevel);

  return (
    <main className="font-sans mx-auto max-w-[1200px] px-4 py-2 sm:px-6 lg:px-8">
      {/* ── Landing Page Style Header ── */}
      <div className="relative w-full mb-8 rounded-[22px] border border-white/50 bg-white/45 backdrop-blur-[24px] shadow-xl shadow-black/[0.03] overflow-hidden p-6 md:p-8 z-10">
        {/* Gradient from top-right orange to center white */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.15) 0%, rgba(255, 153, 0, 0.05) 35%, rgba(255, 255, 255, 0) 65%)",
          }}
        />
        
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full border border-[#ff9900]/20 bg-[#ff9900]/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8a4d00] mb-3 shadow-sm">
            AWS Certification Explorer
          </span>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl font-display mb-2">
            All AWS Certifications
          </h1>
          <p className="max-w-2xl text-sm text-muted font-normal leading-relaxed">
            Select a level tab to browse certifications. Each card shows full exam details, domains, and percentages.
          </p>
        </div>
      </div>

      {/* ── Level Tabs ── */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {levels.map((lvl) => {
          const count = certs.filter((c) => c.level === lvl).length;
          const isActive = activeLevel === lvl;
          const meta = levelMeta[lvl];
          return (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`relative rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150
                ${isActive
                  ? `${meta.tab} bg-white shadow-md`
                  : "border-border bg-white/70 text-muted hover:bg-white hover:border-border/80"
                }`}
            >
              {lvl}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? meta.badge : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cert Cards for active level ── */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {visible.map((cert) => (
          <CertCard key={cert.key} cert={cert} />
        ))}
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Individual cert dashboard card
───────────────────────────────────────────── */
function CertCard({ cert }: { cert: CertData }) {
  const meta = levelMeta[cert.level];

  return (
    <article className="group flex flex-col overflow-hidden rounded-[28px] border border-border/70 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,23,42,0.10)]">

      {/* Accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cert.accent}`} />

      <div className="flex flex-1 flex-col p-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-normal ${meta.badge}`}>
                {cert.level}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-normal text-gray-500">
                {cert.category}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-ink leading-snug">{cert.name}</h2>
            {cert.intended && (
              <p className="mt-1 text-xs text-muted">👤 {cert.intended}</p>
            )}
          </div>
        </div>

        {/* Exam info boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Duration", value: cert.duration, icon: <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Questions", value: String(cert.questions), icon: <FileText className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Cost", value: cert.cost, icon: <DollarSign className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Mode", value: cert.mode, icon: <Monitor className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl border border-border/80 p-3 text-center"
              style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.15))" }}
            >
              <div className="mb-1.5 flex items-center justify-center w-7 h-7 rounded-full bg-white/60 shadow-sm border border-black/[0.03]">
                {icon}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted mb-0.5">{label}</span>
              <span className="text-sm font-semibold text-ink leading-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* Domains */}
        <div className="flex-1 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Exam Domains</p>
          <div className="space-y-3">
            {cert.domains.map((d) => (
              <div key={d.title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-ink">{d.title}</span>
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 bg-gradient-to-r ${cert.accent} text-white`}>
                    {d.pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cert.accent}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                {/* Topics chips */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.topics.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View button */}
        <Link
          href={`/certifications/${cert.key}`}
          className="w-full flex items-center justify-center space-x-1.5 bg-[#232F3E] text-white font-medium py-3 rounded-[8px] shadow-sm text-xs sm:text-sm hover:shadow-[-12px_0_26px_rgba(255,105,180,0.45),12px_0_26px_rgba(168,85,247,0.45),0_8px_18px_rgba(15,23,42,0.12)] transition-[box-shadow] duration-[0.25s] ease-out"
        >
          View full details
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

      </div>
    </article>
  );
}
