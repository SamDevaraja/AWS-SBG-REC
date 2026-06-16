import { notFound } from "next/navigation";
import { Clock, FileText, DollarSign, Monitor, Layers, CheckCircle } from "lucide-react";

type Domain = { title: string; pct: number; topics: string[] };
type Props = { params: Promise<{ key: string }> };

const levelMeta: Record<string, { badge: string; tab: string; ring: string }> = {
  Foundational: { badge: "bg-[#fff3e0] text-[#8a4d00]",   tab: "border-[#ff9900] text-[#8a4d00]",   ring: "#ff9900" },
  Associate:    { badge: "bg-[#e0f2fe] text-[#075985]",   tab: "border-[#00a3e0] text-[#075985]",   ring: "#00a3e0" },
  Professional: { badge: "bg-[#f3e8ff] text-[#6b21a8]",   tab: "border-[#8b5cf6] text-[#6b21a8]",   ring: "#8b5cf6" },
  Specialty:    { badge: "bg-[#d1fae5] text-[#065f46]",   tab: "border-[#0f766e] text-[#065f46]",   ring: "#0f766e" },
};

/* Helper for robust dynamic gradient accent rendering */
function getAccentStyle(accentStr: string) {
  const fromMatch = accentStr ? accentStr.match(/from-\[([^\]]+)\]/) : null;
  const toMatch = accentStr ? accentStr.match(/to-\[([^\]]+)\]/) : null;
  const from = fromMatch ? fromMatch[1] : "#ff9900";
  const to = toMatch ? toMatch[1] : "#f6b74d";
  return {
    gradient: `linear-gradient(to right, ${from}, ${to})`,
    from,
    to,
  };
}

export default async function CertDetail({ params }: Props) {
  const { key } = await params;

  let cert = null;
  try {
    const res = await fetch(`http://127.0.0.1:4000/api/certifications/${key}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const resData = await res.json();
      cert = resData.data || resData;
    }
  } catch (err) {
    console.warn(`Backend fetch failed for cert detail (${key}), using fallback data.`);
  }

  if (!cert) return notFound();

  const meta = levelMeta[cert.level] || levelMeta.Foundational;
  const accentStyle = getAccentStyle(cert.accent);
  const domainsList = (Array.isArray(cert.domains) ? cert.domains : []) as Domain[];

  return (
    <div className="mx-auto max-w-[1200px] p-6 md:p-8 lg:p-10">
      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {/* Accent Top Bar */}
        <div className="h-2 w-full" style={{ background: accentStyle.gradient }} />
        
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          
          {/* Main content pane */}
          <div className="p-6 sm:p-8 lg:p-10 border-b border-slate-100 lg:border-b-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}>
                {cert.level}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {cert.category}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{cert.name}</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">{cert.summary}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["What it signals", cert.highlights],
                ["How to approach it", "Start with the big picture, then move into the detailed exam domains shown below."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50/20 p-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">{title}</div>
                  <p className="text-xs leading-relaxed text-slate-500">{body}</p>
                </div>
              ))}
            </div>

            {cert.intended && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/20 p-4">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Intended Audience</div>
                <p className="text-xs leading-relaxed text-slate-500">{cert.intended}</p>
              </div>
            )}

            {/* ── Native Domains explorer ── */}
            <div className="mt-8 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-2.5 mb-6">
                <Layers className="w-5 h-5 text-slate-800" />
                <h2 className="text-lg font-bold text-slate-900">Exam Domains & Weightings</h2>
              </div>
              
              <div className="space-y-4">
                {domainsList.map((domain, index) => (
                  <div key={domain.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {index + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800">{domain.title}</h3>
                      </div>
                      <span
                        className="text-[10px] font-extrabold rounded-full px-2.5 py-1 text-white shadow-sm"
                        style={{ background: accentStyle.gradient }}
                      >
                        {domain.pct}% Weight
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${domain.pct}%`, background: accentStyle.gradient }}
                      />
                    </div>

                    {/* Topics */}
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Topics & Skills covered</span>
                      <div className="flex flex-wrap gap-1.5">
                        {domain.topics.map((topic) => (
                          <span
                            key={topic}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                          >
                            <CheckCircle className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Snapshot */}
          <aside className="bg-slate-900 p-6 text-white lg:p-10 flex flex-col justify-start">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Exam snapshot</p>
            
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { label: "Duration", value: cert.duration, icon: <Clock className="w-4 h-4 text-white/70" /> },
                { label: "Questions", value: `${cert.questions} Questions`, icon: <FileText className="w-4 h-4 text-white/70" /> },
                { label: "Cost", value: cert.cost, icon: <DollarSign className="w-4 h-4 text-white/70" /> },
                { label: "Mode", value: cert.mode, icon: <Monitor className="w-4 h-4 text-white/70" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 shadow-sm border border-white/5">
                    {icon}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="mt-0.5 text-xs font-bold text-white">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Read</div>
              <p className="text-xs leading-relaxed text-white/80">{cert.highlights}</p>
            </div>

            <div
              className="mt-5 rounded-2xl border border-white/10 p-5 flex flex-col justify-between min-h-[140px]"
              style={{
                background: `radial-gradient(circle at top right, ${accentStyle.from}33, transparent 40%), radial-gradient(circle at bottom left, ${accentStyle.to}26, transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`
              }}
            >
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/60">Study Mood</div>
                <div className="mt-2 text-base font-extrabold text-white leading-snug">Focused, visual, and easy to scan.</div>
              </div>
              <p className="text-[10px] leading-relaxed text-white/60 mt-4">Domains weightings align directly with AWS exam objectives.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
