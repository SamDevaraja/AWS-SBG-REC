import { findCert } from "../../../data/certifications";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ key: string }> };

export default async function CertDetail({ params }: Props) {
  const { key } = await params;
  const cert = findCert(key);
  if (!cert) return notFound();

  return (
    <div className="font-sans mx-auto max-w-[1200px] px-4 py-2 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/50 bg-white/45 backdrop-blur-[24px] shadow-xl shadow-black/[0.03]">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.15) 0%, rgba(255, 153, 0, 0.05) 35%, rgba(255, 255, 255, 0) 65%)",
          }}
        />
        <div className={`relative z-10 h-2 bg-gradient-to-r ${cert.accent}`} />
        <div className="relative z-10 grid gap-0 grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a4d00]">
              <span className="rounded-full bg-[#ff9900]/15 px-3 py-1">{cert.level}</span>
              <span className="rounded-full bg-[#00a3e0]/12 px-3 py-1">{cert.category}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{cert.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{cert.summary}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["What it signals", cert.highlights],
                ["How to approach it", "Start with the big picture, then move into the exam domains shown below."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[24px] border border-border bg-[#fffdf9] p-4">
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                  "Role-aligned",
                  "Visual study flow",
                  "Clean section layout",
              ].map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="border-t border-border/70 bg-[#0f172a] p-6 text-white lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">Exam snapshot</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                ["Level", cert.level],
                ["Category", cert.category],
                ["Format", "Multiple choice / multiple response"],
                ["Focus", cert.key.replace(/-/g, " ")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="text-sm font-semibold text-white">Quick read</div>
              <p className="mt-2 text-sm leading-6 text-white/75">{cert.highlights}</p>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,0.3),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(0,163,224,0.24),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/60">Study mood</div>
              <div className="mt-3 text-2xl font-semibold text-white">Focused, visual, and easy to scan.</div>
              <p className="mt-2 text-sm leading-6 text-white/75"></p>
            </div>
          </aside>
        </div>

        <div className="border-t border-border/70 px-6 py-6 sm:px-8 lg:px-10">
          <div className="rounded-[28px] border border-border bg-[#fffdf9] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a4d00]">Certification content</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink"></h2>
              </div>
              <div className="rounded-full bg-[#ff9900]/15 px-3 py-1 text-sm font-semibold text-[#8a4d00]">Exam overview below</div>
            </div>
            <div className="cert-content mt-5 max-w-none" dangerouslySetInnerHTML={{ __html: cert.detailHtml }} />
          </div>
        </div>
      </section>
    </div>
  );
}
