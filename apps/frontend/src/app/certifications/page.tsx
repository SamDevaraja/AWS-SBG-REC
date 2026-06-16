"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, FileText, DollarSign, Monitor, Trash2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
   Types
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

const levels = ["Foundational", "Associate", "Professional", "Specialty"] as const;

const levelMeta: Record<string, { badge: string; tab: string; ring: string }> = {
  Foundational: { badge: "bg-[#fff3e0] text-[#8a4d00]",   tab: "border-[#ff9900] text-[#8a4d00]",   ring: "#ff9900" },
  Associate:    { badge: "bg-[#e0f2fe] text-[#075985]",   tab: "border-[#00a3e0] text-[#075985]",   ring: "#00a3e0" },
  Professional: { badge: "bg-[#f3e8ff] text-[#6b21a8]",   tab: "border-[#8b5cf6] text-[#6b21a8]",   ring: "#8b5cf6" },
  Specialty:    { badge: "bg-[#d1fae5] text-[#065f46]",   tab: "border-[#0f766e] text-[#065f46]",   ring: "#0f766e" },
};

const accentPresets = [
  { name: "AWS Orange", value: "from-[#ff9900] to-[#f6b74d]" },
  { name: "AI/ML Purple", value: "from-[#7c3aed] to-[#c084fc]" },
  { name: "Architect Blue", value: "from-[#00a3e0] to-[#60a5fa]" },
  { name: "Specialty Teal", value: "from-[#0f766e] to-[#34d399]" },
  { name: "DevOps Rose", value: "from-[#fb7185] to-[#f97316]" },
];

/* Helper for robust dynamic gradient accent rendering without JIT compiling restrictions */
function getAccentStyle(accentStr: string) {
  const fromMatch = accentStr.match(/from-\[([^\]]+)\]/);
  const toMatch = accentStr.match(/to-\[([^\]]+)\]/);
  const from = fromMatch ? fromMatch[1] : "#ff9900";
  const to = toMatch ? toMatch[1] : "#f6b74d";
  return {
    background: `linear-gradient(to right, ${from}, ${to})`
  };
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function CertificationsPage() {
  const [certs, setCerts] = useState<CertData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<string>("Foundational");
  const [role, setRole] = useState<string | null>(null);

  // Modal form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formLevel, setFormLevel] = useState<"Foundational" | "Associate" | "Professional" | "Specialty">("Foundational");
  const [formCategory, setFormCategory] = useState("");
  const [formDuration, setFormDuration] = useState("130 min");
  const [formQuestions, setFormQuestions] = useState(65);
  const [formCost, setFormCost] = useState("$150");
  const [formMode, setFormMode] = useState("Online or Pearson VUE");
  const [formIntended, setFormIntended] = useState("");
  const [formHighlights, setFormHighlights] = useState("");
  const [formAccent, setFormAccent] = useState(accentPresets[0].value);
  const [formDomains, setFormDomains] = useState<{ title: string; pct: number; topics: string }[]>([
    { title: "Cloud Concepts", pct: 25, topics: "Benefits, Shared Responsibility" }
  ]);

  // Detect user role
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const user = JSON.parse(raw);
        setRole((user?.role ?? '').toLowerCase().trim());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/certifications");
      if (!res.ok) {
        throw new Error("Failed to load certifications data.");
      }
      const resData = await res.json();
      const arrayData = Array.isArray(resData) ? resData : (resData.data || []);
      setCerts(arrayData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Form key slug
  useEffect(() => {
    if (formName) {
      setFormKey(formName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [formName]);

  const addDomainField = () => {
    setFormDomains([...formDomains, { title: "", pct: 20, topics: "" }]);
  };

  const removeDomainField = (index: number) => {
    setFormDomains(formDomains.filter((_, i) => i !== index));
  };

  const updateDomainField = (index: number, field: string, value: any) => {
    setFormDomains(formDomains.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formName || !formKey || !formCategory || !formHighlights) {
      setFormError("Please fill out all required fields.");
      return;
    }

    const totalWeight = formDomains.reduce((acc, d) => acc + Number(d.pct), 0);
    if (totalWeight !== 100) {
      setFormError(`Domain weightings must equal exactly 100% (currently ${totalWeight}%).`);
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        key: formKey,
        name: formName,
        level: formLevel,
        category: formCategory,
        summary: formHighlights, // use highlights as main summary fallback
        highlights: formHighlights,
        accent: formAccent,
        duration: formDuration,
        questions: Number(formQuestions),
        cost: formCost,
        mode: formMode,
        intended: formIntended || undefined,
        domains: formDomains.map(d => ({
          title: d.title,
          pct: Number(d.pct),
          topics: d.topics.split(",").map(t => t.trim()).filter(t => t.length > 0)
        }))
      };

      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to create certification record.");
      }

      // Reset form and close
      setFormName("");
      setFormIntended("");
      setFormHighlights("");
      setFormDomains([{ title: "Cloud Concepts", pct: 25, topics: "Benefits, Shared Responsibility" }]);
      setShowCreateModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred while saving.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this certification?")) {
      try {
        const res = await fetch(`/api/certifications/${key}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchData();
        } else {
          alert("Failed to delete certification record.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during deletion.");
      }
    }
  };

  const visible = certs.filter((c) => c.level === activeLevel);

  return (
    <main className="mx-auto max-w-[1200px] p-6 md:p-8 lg:p-10">

      {/* ── Hero ── */}
      <section className="glass-panel relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 lg:px-10 lg:py-10 mb-8">
        <div className="absolute inset-0 grid-fade opacity-[0.22] pointer-events-none" />
        <div className="absolute -right-8 top-4 h-32 w-32 rounded-full bg-[#ff9900]/10 blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-16 h-36 w-36 rounded-full bg-[#00a3e0]/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8a4d00] shadow-sm">
              AWS Certification Explorer
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              All AWS Certifications
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Select a level tab to browse certifications. Each card shows full exam details, domains, and percentages.
            </p>
          </div>
          {role === 'core' && (
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#232F3E] to-[#1F2A37] text-white px-6 py-3 text-xs font-bold shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-orange-500/5 border border-white/10 hover:border-[#ff9900]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ff9900]" /> Add Certification
            </motion.button>
          )}
        </div>
      </section>

      {/* ── Level Tabs ── */}
      <div className="mb-8 flex flex-wrap gap-2.5">
        {levels.map((lvl) => {
          const count = certs.filter((c) => c.level === lvl).length;
          const isActive = activeLevel === lvl;
          const meta = levelMeta[lvl];
          return (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              disabled={loading}
              className={`relative rounded-full border-2 px-5 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer
                ${isActive
                  ? `${meta.tab} bg-white shadow-sm`
                  : "border-slate-200 bg-white/70 text-slate-500 hover:bg-white hover:border-slate-300"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {lvl}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isActive ? meta.badge : "bg-slate-100 text-slate-500"}`}>
                {loading ? "-" : count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cert Cards for active level ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse flex flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm min-h-[300px]"
            >
              <div className="h-1.5 w-full bg-slate-100 -mt-6 -mx-6 mb-6" />
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-5 w-20 rounded-full bg-slate-100" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="h-7 w-3/4 rounded bg-slate-100 mb-4" />
              <div className="h-4 w-full rounded bg-slate-100 mb-2" />
              <div className="h-4 w-2/3 rounded bg-slate-100 mb-4 flex-1" />
              
              <div className="h-12 w-full rounded-xl bg-slate-100 mt-auto" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center bg-white border border-slate-200 rounded-[24px] shadow-sm">
            <p className="text-red-500 font-semibold text-sm mb-4">⚠️ {error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center rounded-xl bg-[#232F3E] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1f2a37]"
            >
              Try Again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-[24px] shadow-sm">
            No certifications found.
          </div>
        ) : (
          visible.map((cert) => (
            <CertCard key={cert.key} cert={cert} role={role} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New AWS Certification</h3>
                <p className="text-xs text-slate-400">Create a dynamic pathway record inside PostgreSQL</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 flex-1">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                  ⚠️ {formError}
                </div>
              )}

              {/* Grid 1 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Certification Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. AWS Certified SysOps Administrator"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Database Key (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="e.g. sysops-admin"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Grid 2 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Certification Level *</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Associate">Associate</option>
                    <option value="Professional">Professional</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Category *</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Operations"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Grid 3 */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Duration *</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="130 min"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Questions *</label>
                  <input
                    type="number"
                    required
                    value={formQuestions}
                    onChange={(e) => setFormQuestions(Number(e.target.value))}
                    placeholder="65"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cost *</label>
                  <input
                    type="text"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="$150"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Exam Mode *</label>
                  <input
                    type="text"
                    required
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value)}
                    placeholder="Pearson VUE"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Text fields */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Intended Audience (Optional)</label>
                <input
                  type="text"
                  value={formIntended}
                  onChange={(e) => setFormIntended(e.target.value)}
                  placeholder="e.g. System administrators, operations staff"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Highlights / Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder="Summarize key signals and value of this exam..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-slate-50/50 resize-none"
                />
              </div>

              {/* Accent Color Preset Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Accent Color Presets *</label>
                <div className="grid grid-cols-5 gap-2">
                  {accentPresets.map(preset => {
                    const isSelected = formAccent === preset.value;
                    const style = getAccentStyle(preset.value);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormAccent(preset.value)}
                        className={`p-2 rounded-xl text-[10px] font-semibold text-white shadow-sm transition-all border-2 cursor-pointer text-center truncate ${isSelected ? "border-slate-900" : "border-transparent"}`}
                        style={style}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domains Section */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800">Exam Domains Weightings (Must total 100%)</span>
                  <button
                    type="button"
                    onClick={addDomainField}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF9900] bg-orange-50 px-2.5 py-1 rounded-lg hover:bg-orange-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Domain
                  </button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {formDomains.map((domain, index) => (
                    <div key={index} className="flex gap-2.5 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex-1 space-y-2">
                        <div className="grid gap-2 grid-cols-5">
                          <input
                            type="text"
                            required
                            placeholder="Domain Title (e.g. Security)"
                            value={domain.title}
                            onChange={(e) => updateDomainField(index, "title", e.target.value)}
                            className="col-span-4 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-300"
                          />
                          <input
                            type="number"
                            required
                            placeholder="Weight %"
                            value={domain.pct}
                            onChange={(e) => updateDomainField(index, "pct", Number(e.target.value))}
                            className="col-span-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:border-slate-300"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Comma-separated topics (e.g. IAM, Encryption, VPC)"
                          value={domain.topics}
                          onChange={(e) => updateDomainField(index, "topics", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-300"
                        />
                      </div>
                      {formDomains.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDomainField(index)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0 mt-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={formSubmitting}
                  whileHover={formSubmitting ? {} : { scale: 1.02, y: -1 }}
                  whileTap={formSubmitting ? {} : { scale: 0.98 }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#232F3E] to-[#1F2A37] text-white border border-white/10 hover:border-[#ff9900]/30 text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#ff9900]" />
                      <span>Add Certification</span>
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────────────────────────
   Individual cert dashboard card
   ───────────────────────────────────────────── */
function CertCard({
  cert,
  role,
  onDelete
}: {
  cert: CertData;
  role: string | null;
  onDelete: (key: string, e: React.MouseEvent) => void;
}) {
  const meta = levelMeta[cert.level];
  const accentStyle = getAccentStyle(cert.accent);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative">

      {/* Delete button for Admin only */}
      {role === 'core' && (
        <button
          onClick={(e) => onDelete(cert.key, e)}
          className="absolute top-4 right-4 z-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2.5 transition-colors border border-red-100 cursor-pointer shadow-sm"
          title="Delete Certification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Accent bar */}
      <div className="h-1.5 w-full" style={accentStyle} />

      <div className="flex flex-1 flex-col p-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="pr-8">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}>
                {cert.level}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {cert.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#FF9900] transition-colors">{cert.name}</h2>
            {cert.intended && (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed italic">👥 {cert.intended}</p>
            )}
          </div>
        </div>

        {/* Exam info boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {[
            { label: "Duration", value: cert.duration, icon: <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Questions", value: String(cert.questions), icon: <FileText className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Cost", value: cert.cost, icon: <DollarSign className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
            { label: "Mode", value: cert.mode, icon: <Monitor className="w-3.5 h-3.5 text-[#232F3E] shrink-0" /> },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl border border-slate-100 p-2.5 text-center bg-slate-50/50"
            >
              <div className="mb-1 flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm border border-slate-100">
                {icon}
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</span>
              <span className="text-xs font-bold text-slate-800 leading-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* Domains */}
        <div className="flex-1 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Exam Domains</p>
          <div className="space-y-3">
            {cert.domains.map((d) => (
              <div key={d.title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">{d.title}</span>
                  <span
                    className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-white"
                    style={accentStyle}
                  >
                    {d.pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.pct}%`, ...accentStyle }}
                  />
                </div>
                {/* Topics chips */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.topics.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] text-slate-500 font-medium">
                      {t}
                    </span>
                  ))}
                  {d.topics.length > 4 && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] text-slate-400 font-bold">
                      +{d.topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View button */}
        <Link
          href={`/certifications/${cert.key}`}
          className="w-full flex items-center justify-center space-x-1.5 bg-[#232F3E] hover:bg-[#1f2a37] text-white font-bold py-3 rounded-xl shadow-sm text-xs transition-all duration-150 hover:shadow-md mt-auto"
        >
          <span>View Full Study Details</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>

      </div>
    </article>
  );
}
