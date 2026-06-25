"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GroupChatPanel from "@/components/chat/GroupChatPanel";
import {
  MessageSquare, Users, Database, Zap,
  Search, Clock, CheckCircle2, XCircle, AlertCircle,
  BookOpen, Trash2, Plus, X, ChevronDown,
  UserCog, UserPlus, Ban, RefreshCw, SlidersHorizontal,
} from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#F8FAFC",         // Slate-50 main page background
  surface:   "#FFFFFF",         // Pure white panels
  surface2:  "#F1F5F9",         // Slate-100 sub-zones
  surface3:  "#E2E8F0",         // Slate-200 hover states
  border:    "#E2E8F0",         // Clean border separator
  borderHov: "#CBD5E1",         // Border hover state
  accent:    "#FF9900",         // AWS Orange accent
  accentHov: "#E68A00",         // Orange active
  accentLow: "rgba(255,153,0,0.08)", // Soft orange highlight background
  success:   "#16a34a",         // Emerald-600
  warning:   "#d97706",         // Amber-600
  danger:    "#dc2626",         // Red-600
  text:      "#0F172A",         // Slate-900 high contrast readable text
  muted:     "#64748B",         // Slate-500 secondary labels
  muted2:    "#475569",         // Slate-600 tertiary labels
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relativeTime = (isoStr: string) => {
  if (!isoStr) return "—";
  const diff = Date.now() - new Date(isoStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const statusMeta = (s: string) => {
  if (s === "live" || s === "pending")    return { color: T.warning,  icon: <AlertCircle size={12} />, label: "Live" };
  if (s === "resolved" || s === "replied") return { color: T.success,  icon: <CheckCircle2 size={12} />, label: "Resolved" };
  if (s === "dismissed")                   return { color: T.muted,   icon: <XCircle size={12} />, label: "Dismissed" };
  return { color: T.muted, icon: null, label: s };
};

const simPct = (v: number | null) => (v != null ? `${Math.round(v * 100)}%` : "—");

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  toast: { type: "success" | "error"; title: string; body?: string } | null;
  onClose: () => void;
}
function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: "#FFFFFF",
      border: `1px solid ${isErr ? T.danger : T.success}40`,
      borderRadius: 12, padding: "14px 18px",
      display: "flex", alignItems: "flex-start", gap: 12,
      maxWidth: 360, boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
      animation: "slideUp .3s ease",
    }}>
      <span style={{ color: isErr ? T.danger : T.success, marginTop: 1 }}>
        {isErr ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{toast.title}</div>
        {toast.body && <div style={{ fontSize: 11, color: T.muted2, marginTop: 3, lineHeight: 1.5 }}>{toast.body}</div>}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Query {
  id: string; sessionId: string; message: string;
  bestSimilarity: number; bestMatchDoc?: string | null;
  timestamp: string; status: string;
}

// ─── Query Row ────────────────────────────────────────────────────────────────
const QueryRow = ({ q, isSelected, onSelect }: { q: Query; isSelected: boolean; onSelect: (q: Query) => void }) => {
  const { color, icon, label } = statusMeta(q.status);
  return (
    <div
      onClick={() => onSelect(q)}
      style={{
        cursor: "pointer",
        background: isSelected ? `${T.accent}0d` : "transparent",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 32px",
        height: "48px",
        display: "grid",
        gridTemplateColumns: "48px 1fr 64px 64px 90px",
        alignItems: "center",
        gap: 12,
        transition: "background .15s",
        borderLeft: isSelected ? `4px solid ${T.accent}` : "4px solid transparent",
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = T.surface2; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <span style={{ fontSize: 10, color: T.muted, fontFamily: "monospace" }}>#{q.id.slice(-4)}</span>
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, color: T.text, fontWeight: 500 }} title={q.message}>
        {q.message}
      </div>
      <span style={{ padding: "2px 7px", borderRadius: 99, background: `${T.accent}12`, border: `1px solid ${T.accent}25`, color: T.accent, fontSize: 10, fontWeight: 700, textAlign: "center" }}>
        {simPct(q.bestSimilarity)}
      </span>
      <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>{relativeTime(q.timestamp)}</span>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "3px 8px", borderRadius: 99, background: `${color}12`, border: `1px solid ${color}20`, color, fontSize: 10, fontWeight: 700 }}>
        {icon} {label}
      </span>
    </div>
  );
};

// ─── FAQ Chips Manager ────────────────────────────────────────────────────────
interface FAQChip { id: string; question: string; answer: string; }

function FAQChipsManager({ showToast }: { showToast: (t: any) => void }) {
  const [chips, setChips] = useState<FAQChip[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});

  const fetchChips = useCallback(async () => {
    try {
      const res = await fetch("/api/faq-chips");
      const data = await res.json();
      setChips(data.data?.chips ?? data.chips ?? []);
    } catch { showToast({ type: "error", title: "Failed to load FAQ chips." }); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchChips(); }, [fetchChips]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/faq-chips", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      });
      if (!res.ok) throw new Error();
      await fetchChips();
      setNewQuestion(""); setNewAnswer("");
      showToast({ type: "success", title: "FAQ Chip Added" });
    } catch { showToast({ type: "error", title: "Failed to add FAQ chip" }); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this FAQ chip?")) return;
    try {
      const res = await fetch(`/api/admin/faq-chips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setChips(prev => prev.filter(c => c.id !== id));
      showToast({ type: "success", title: "FAQ Chip Deleted" });
    } catch { showToast({ type: "error", title: "Delete failed" }); }
  };

  return (
    <div style={{ display: "flex", gap: "24px", width: "100%", height: "100%", alignItems: "stretch", minHeight: 0 }}>
      {/* FAQ list */}
      <div style={{ flex: "1 1 60%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ padding: "16px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={14} color={T.accent} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>FAQ Knowledge Chips</div>
              <div style={{ fontSize: 10, color: T.muted }}>Automated response triggers</div>
            </div>
          </div>
          <span style={{ fontSize: 10, padding: "3px 8px", background: T.accentLow, color: T.accent, borderRadius: 99, fontWeight: 700 }}>{chips.length} chips</span>
        </div>
        <div style={{ padding: "8px 32px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: T.muted }}>Loading FAQ chips…</div>
          ) : chips.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: T.muted }}>No FAQ chips yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0" }}>
              {chips.map(chip => {
                const isExpanded = !!expandedChips[chip.id];
                return (
                  <div key={chip.id} onClick={() => setExpandedChips(p => ({ ...p, [chip.id]: !p[chip.id] }))}
                    style={{ borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, padding: "12px 14px", cursor: "pointer", transition: "border-color .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = T.borderHov}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = T.border}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontSize: 12, color: T.text, fontWeight: 600, flex: 1 }}>{chip.question}</div>
                      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                        <ChevronDown size={14} color={T.muted} style={{ transition: "transform .2s", transform: isExpanded ? "rotate(180deg)" : "none" }} />
                        <button onClick={e => { e.stopPropagation(); handleDelete(chip.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "flex", alignItems: "center" }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = T.danger}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = T.muted}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ fontSize: 11, color: T.muted2, marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.border}`, lineHeight: 1.6 }}>
                        {chip.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add form */}
      <div style={{ flex: "1 1 40%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} color={T.accent} />
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text, letterSpacing: "-0.01em" }}>Add FAQ Chip</span>
          </div>
          <span style={{ fontSize: 11, color: T.muted }}>Add a quick reply trigger to the knowledge base.</span>
        </div>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Question</label>
            <input 
              type="text" 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)} 
              placeholder="e.g. What is AWS Certified Cloud Practitioner?"
              className="faq-input"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Answer</label>
            <textarea 
              value={newAnswer} 
              onChange={e => setNewAnswer(e.target.value)} 
              placeholder="Provide the official response..." 
              rows={5}
              className="faq-textarea"
            />
          </div>
          <button 
            type="submit" 
            disabled={adding || !newQuestion.trim() || !newAnswer.trim()}
            className="faq-submit-btn"
          >
            <Plus size={14} /> {adding ? "Adding Chip…" : "Add FAQ Chip"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, color, photo, size = 36 }: { initials: string; color?: string; photo?: string | null; size?: number }) {
  const src = typeof photo === "object" && photo !== null ? (photo as any).photo : photo;
  const isValid = src && typeof src === "string" && src.trim() !== "" && !["null","undefined","[object Object]"].includes(src);
  if (isValid) return <img src={src} alt={initials} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color || T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: Math.floor(size * 0.36), color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── CMS Panel ────────────────────────────────────────────────────────────────
function CMSPanel({ query, onSaved, onDismissed, showToast }: { query: Query | null; onSaved: (id: string) => void; onDismissed: (id: string) => void; showToast: (t: any) => void }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState("");
  const [saveResult, setSaveResult] = useState<{ doc_id: string; total: number } | null>(null);

  useEffect(() => {
    setAnswer("");
    setSaveResult(null);
  }, [query]);

  const handleSave = async () => {
    if (!query || !answer.trim()) { showToast({ type: "error", title: "Answer cannot be empty." }); return; }
    setSaving("saving");
    try {
      const res = await fetch(`/api/admin/reply-live/${query.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaveResult({ doc_id: data.doc_id, total: data.chroma_total_docs });
      showToast({ type: "success", title: "Saved to Knowledge Base!", body: "Future similar queries will be auto-answered." });
      onSaved(query.id);
    } catch { showToast({ type: "error", title: "Save failed." }); }
    finally { setSaving(""); }
  };

  const handleDismiss = async () => {
    if (!query) return;
    setSaving("dismissing");
    try {
      const res = await fetch(`/api/admin/query/${query.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: "Query dismissed." });
      onDismissed(query.id);
    } catch { showToast({ type: "error", title: "Dismiss failed." }); }
    finally { setSaving(""); }
  };

  if (!query) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: T.surface, padding: "80px 40px", color: T.muted, flex: 1 }}>
        <MessageSquare size={40} color={T.muted} strokeWidth={1.2} style={{ opacity: 0.5 }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>No query selected</div>
        <div style={{ fontSize: 12, textAlign: "center", maxWidth: 220, lineHeight: 1.6, color: T.muted }}>
          Select a query from the left queue to review, respond, and save to knowledge base.
        </div>
      </div>
    );
  }

  const { color: stColor, label: stLabel } = statusMeta(query.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, background: T.surface, padding: "28px 32px", flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentLow, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SlidersHorizontal size={14} color={T.accent} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: "-0.01em" }}>CMS Editor</span>
            <span style={{ fontSize: 9, color: T.muted, fontFamily: "monospace" }}>#{query.id.slice(-8)}</span>
          </div>
        </div>
        <span style={{
          padding: "3px 10px",
          borderRadius: 99,
          background: `${stColor}10`,
          color: stColor,
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          border: `1px solid ${stColor}20`,
          display: "inline-flex",
          alignItems: "center",
          gap: 4
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: stColor }} />
          {stLabel}
        </span>
      </div>

      {/* Question card */}
      <div style={{ background: "#F8FAFC", borderRadius: 10, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.accent}`, padding: "16px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          <MessageSquare size={12} /> User Question
        </div>
        <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, fontWeight: 500 }}>{query.message}</div>
      </div>

      {query.bestMatchDoc && (
        <details className="kb-match-details" style={{ background: "#FFFFFF", borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 16px", cursor: "pointer", transition: "all 0.2s ease" }}>
          <summary style={{ fontSize: "12px", color: T.text, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", outline: "none", listStyle: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Database size={13} color={T.accent} />
              <span>Closest KB Match (Auto-Reply Source)</span>
            </div>
            <ChevronDown size={14} color={T.muted} className="kb-match-chevron" style={{ transition: "transform .2s" }} />
          </summary>
          <div style={{ marginTop: 12, fontSize: 12, color: T.muted2, lineHeight: 1.6, borderTop: `1px dashed ${T.border}`, paddingTop: 10, maxHeight: 150, overflowY: "auto", fontFamily: "inherit" }}>
            {query.bestMatchDoc}
          </div>
        </details>
      )}

      <div style={{ height: 1, background: T.border, margin: "4px 0" }} />

      {saveResult ? (
        <div style={{ background: `${T.success}12`, border: `1px solid ${T.success}25`, borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle2 size={20} color={T.success} />
          <div>
            <div style={{ fontSize: 13, color: T.success, fontWeight: 700 }}>Saved to ChromaDB</div>
            <div style={{ fontSize: 11, color: T.muted2, marginTop: 2 }}>Future similar queries will be auto-answered automatically.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <textarea
            value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder="Write the correct answer to save to the knowledge base…"
            rows={6} disabled={saving !== ""}
            className="faq-textarea"
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {query.status === "live" && (
              <button 
                onClick={handleDismiss} 
                disabled={saving !== ""}
                className="btn-danger-outline"
              >
                <XCircle size={13} /> {saving === "dismissing" ? "Dismissing…" : "Dismiss"}
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={saving !== "" || !answer.trim()}
              className="btn-primary"
            >
              <Database size={13} /> {saving === "saving" ? "Saving…" : "Save to KB"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Member Types ─────────────────────────────────────────────────────────────
interface Member { id: string; name: string; email: string; role: string; avatar?: { photo?: string | null; initials: string; color: string } | null; banned: boolean; }
interface BanLogItem { id: string; userId: string; userName: string; userEmail: string; bannedBy: string; banReason: string; bannedAt: string; }

// ─── Manage Users Panel ───────────────────────────────────────────────────────
function ManageUsersPanel({ showToast }: { showToast: (t: any) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState("crew");
  const [creating, setCreating] = useState(false);
  const [banLog, setBanLog] = useState<BanLogItem[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"members" | "log">("members");

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      setMembers(data.data?.users ?? data.users ?? []);
    } catch { showToast({ type: "error", title: "Failed to load members list" }); }
    finally { setLoading(false); }
  };

  const fetchBanLog = async () => {
    setLoadingLog(true);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "getBanLog" }) });
      const data = await res.json();
      setBanLog(data.data?.banLog ?? data.banLog ?? []);
    } catch { console.error("Failed to load ban log"); }
    finally { setLoadingLog(false); }
  };

  useEffect(() => { fetchMembers(); fetchBanLog(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) { showToast({ type: "error", title: "All fields are required" }); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register", name, email, password, role }) });
      const data = await res.json();
      if (!res.ok) { showToast({ type: "error", title: "Registration failed", body: data.error }); return; }
      showToast({ type: "success", title: "Account created!" });
      setName(""); setEmail(""); setPassword(""); setRole("crew");
      fetchMembers();
    } catch { showToast({ type: "error", title: "Network error" }); }
    finally { setCreating(false); }
  };

  const handleBan = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      const res = await fetch(`/api/auth?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: `${name} deactivated.` });
      fetchMembers(); fetchBanLog();
    } catch { showToast({ type: "error", title: "Failed to deactivate" }); }
  };

  const handleUnban = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "unban", userId: id }) });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: `${name} activated!` });
      fetchMembers(); fetchBanLog();
    } catch { showToast({ type: "error", title: "Failed to activate" }); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 8,
    padding: "10px 14px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color .2s",
  };

  return (
    <div style={{ display: "flex", gap: "24px", width: "100%", height: "100%", alignItems: "stretch", minHeight: 0 }}>
      {/* Members list */}
      <div style={{ flex: "1 1 60%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ padding: "16px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={14} color={T.accent} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Members Directory</div>
              <div style={{ fontSize: 10, color: T.muted }}>Core & Crew administrative accounts</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, background: T.surface3, padding: 3, borderRadius: 99 }}>
            {(["members", "log"] as const).map(k => (
              <button key={k} onClick={() => setActiveSubTab(k)}
                style={{ border: "none", background: activeSubTab === k ? "#FFFFFF" : "transparent", cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "6px 14px", borderRadius: 99, color: activeSubTab === k ? T.text : T.muted, transition: "all .2s", boxShadow: activeSubTab === k ? "0 2px 5px rgba(0,0,0,0.05)" : "none" }}>
                {k === "members" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "8px 32px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: T.muted }}>Loading users…</div>
          ) : activeSubTab === "members" ? (
            members.filter(m => !m.banned).length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: T.muted }}>No active members.</div>
            ) : (
              members.filter(m => !m.banned).map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                  <Avatar initials={m.avatar?.initials || m.name.slice(0, 2).toUpperCase()} color={m.avatar?.color || T.accent} photo={m.avatar?.photo} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: m.role === "core" ? T.accentLow : `${T.muted}15`, color: m.role === "core" ? T.accent : T.muted2, textTransform: "uppercase" }}>{m.role}</span>
                  <button onClick={() => handleBan(m.id, m.name)} style={{ background: "none", border: `1px solid ${T.danger}30`, borderRadius: 6, color: T.danger, fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${T.danger}0d`}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <Ban size={10} /> Deactivate
                  </button>
                </div>
              ))
            )
          ) : (
            banLog.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: T.muted }}>No deactivated members.</div>
            ) : (
              banLog.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontWeight: 700, fontSize: 13 }}>{m.userName.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>{m.userName}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{m.userEmail}</div>
                  </div>
                  <button onClick={() => handleUnban(m.userId, m.userName)} style={{ background: "none", border: `1px solid ${T.success}30`, borderRadius: 6, color: T.success, fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${T.success}0d`}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <CheckCircle2 size={10} /> Activate
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Register form */}
      <div style={{ flex: "1 1 40%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={16} color={T.accent} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Register New Account</span>
        </div>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; }}
              onBlur={e => { e.target.style.borderColor = T.border; }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. jane@awsclub.dev" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; }}
              onBlur={e => { e.target.style.borderColor = T.border; }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; }}
              onBlur={e => { e.target.style.borderColor = T.border; }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Privilege Level</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = T.accent; }}
              onBlur={e => { e.target.style.borderColor = T.border; }}>
              <option value="crew">Crew</option>
              <option value="core">Core Admin</option>
            </select>
          </div>
          <button type="submit" disabled={creating}
            style={{ background: T.accent, border: "none", padding: "12px", color: "#fff", fontWeight: 700, borderRadius: 8, fontSize: 13, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background .15s", marginTop: 8 }}
            onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLButtonElement).style.background = T.accentHov; }}
            onMouseLeave={e => { if (!creating) (e.currentTarget as HTMLButtonElement).style.background = T.accent; }}
          >
            <UserPlus size={14} /> {creating ? "Creating Account…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function CoreChatPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeView, setActiveView] = useState<"queries" | "kb" | "crew_chats" | "manage_users">("queries");
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<{ live: number; pending: number; resolved: number; dismissed: number; kb_docs: number }>();
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "live" | "resolved" | "dismissed">("live");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; body?: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  const showToast = useCallback((t: any) => setToast(t), []);
  const hideToast = useCallback(() => setToast(null), []);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, sRes] = await Promise.all([fetch("/api/admin/unhandled"), fetch("/api/admin/stats")]);
      if (!qRes.ok || !sRes.ok) throw new Error();
      const qData = await qRes.json(); const sData = await sRes.json();
      const queriesList = qData.data?.queries ?? qData.queries ?? [];
      const statsObj = sData.data ?? sData;
      setQueries(queriesList.map((q: any) => ({
        id: q.id, sessionId: q.sessionId || q.session_id, message: q.message,
        bestSimilarity: q.bestSimilarity || q.best_similarity || 0,
        bestMatchDoc: q.bestMatchDoc || q.best_match_doc || null,
        timestamp: q.timestamp, status: q.status,
      })));
      setStats(statsObj);
    } catch { showToast({ type: "error", title: "Failed to load data" }); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    if (!authorized) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData, authorized]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw); setUser(parsed);
        const role = (parsed?.role ?? "").toLowerCase().trim();
        if (role === "core") { setAuthorized(true); setCheckingAuth(false); }
        else if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=scan_ticket`)
            .then(r => r.json()).then(d => { if (d.success && d.hasPermission) setAuthorized(true); else router.replace("/crew/dashboard"); setCheckingAuth(false); })
            .catch(() => { router.replace("/crew/dashboard"); setCheckingAuth(false); });
        } else { router.replace("/login"); setCheckingAuth(false); }
      } else { router.replace("/login"); setCheckingAuth(false); }
    } catch {
      setUser({ id: "dev_core", fullName: "Core Administrator", role: "core", email: "admin@awsclub.dev" });
      setAuthorized(true); setCheckingAuth(false);
    }
  }, [router]);

  const handleSaved = useCallback(() => { fetchData(); setSelectedQuery(null); }, [fetchData]);
  const handleDismissed = useCallback(() => { fetchData(); setSelectedQuery(null); }, [fetchData]);

  const visible = queries.filter(q => {
    const matchTab = filterTab === "all" || (filterTab === "live" && (q.status === "live" || q.status === "pending")) || (filterTab === "resolved" && (q.status === "resolved" || q.status === "replied")) || q.status === filterTab;
    const matchSearch = !search || q.message.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const TABS = [
    { key: "live",      label: "Live",      color: T.warning, icon: <AlertCircle size={12} /> },
    { key: "resolved",  label: "Resolved",  color: T.success, icon: <CheckCircle2 size={12} /> },
    { key: "dismissed", label: "Dismissed", color: T.muted,   icon: <XCircle size={12} /> },
    { key: "all",       label: "All",       color: T.accent,  icon: <Database size={12} /> },
  ] as const;

  // ── Auth checking ──
  if (checkingAuth) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 14, background: T.bg }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2.5px solid ${T.accent}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Verifying credentials…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!authorized) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", boxSizing: "border-box", overflow: "hidden", background: T.bg }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.16); }

        .faq-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 11px 15px;
          color: #0F172A;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }
        .faq-input:hover {
          border-color: #CBD5E1;
        }
        .faq-input:focus {
          border-color: #FF9900;
          box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.12), 0 1px 2px rgba(15, 23, 42, 0.05);
        }
        .faq-textarea {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 12px 15px;
          color: #0F172A;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.2s ease-in-out;
          min-height: 120px;
          resize: vertical;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }
        .faq-textarea:hover {
          border-color: #CBD5E1;
        }
        .faq-textarea:focus {
          border-color: #FF9900;
          box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.12), 0 1px 2px rgba(15, 23, 42, 0.05);
        }
        .faq-submit-btn {
          background: linear-gradient(135deg, #FF9900 0%, #FF8800 100%);
          border: none;
          padding: 12px;
          color: #fff;
          font-weight: 700;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15);
          margin-top: 8px;
        }
        .faq-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 153, 0, 0.25);
          background: linear-gradient(135deg, #FF9900 0%, #FF7700 100%);
        }
        .faq-submit-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(255, 153, 0, 0.15);
        }
        .faq-submit-btn:disabled {
          background: #E2E8F0;
          color: #94A3B8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(22, 163, 74, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
          animation: pulse 2s infinite;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF9900 0%, #FF8800 100%);
          border: none;
          padding: 10px 22px;
          color: #fff;
          font-weight: 700;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 153, 0, 0.25);
          background: linear-gradient(135deg, #FF9900 0%, #FF7700 100%);
        }
        .btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(255, 153, 0, 0.15);
        }
        .btn-primary:disabled {
          background: #E2E8F0;
          color: #94A3B8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-danger-outline {
          background: #FFFFFF;
          border: 1px solid rgba(220, 38, 38, 0.25);
          padding: 10px 20px;
          color: #dc2626;
          font-weight: 700;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-danger-outline:hover {
          background: rgba(220, 38, 38, 0.05);
          border-color: rgba(220, 38, 38, 0.4);
          transform: translateY(-1px);
        }
        .btn-danger-outline:active {
          transform: translateY(0);
        }
        .btn-danger-outline:disabled {
          border-color: #E2E8F0;
          color: #94A3B8;
          cursor: not-allowed;
          transform: none;
          background: none;
        }

        .kb-match-details[open] .kb-match-chevron {
          transform: rotate(180deg);
        }
        .kb-match-details summary::-webkit-details-marker {
          display: none;
        }
        .kb-match-details:hover {
          border-color: #CBD5E1 !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", margin: "24px 24px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: T.accentLow, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={18} color={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Chat Administration</div>
            <div style={{ fontSize: 11, color: T.muted }}>AWS Club Operations Center</div>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: "flex", gap: 6, background: T.surface2, padding: "5px 6px", borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)" }}>
          {[
            { key: "queries",      label: "Queries",        icon: <MessageSquare size={14} /> },
            { key: "kb",           label: "Knowledge Base", icon: <BookOpen size={14} /> },
            { key: "crew_chats",   label: "Crew Chat",      icon: <Users size={14} /> },
            ...(user?.role === "core" ? [{ key: "manage_users", label: "Members", icon: <UserCog size={14} /> }] : []),
          ].map(v => {
            const isActive = activeView === v.key;
            return (
              <button key={v.key} onClick={() => {
                setActiveView(v.key as any);
                if (v.key !== "queries") setSelectedQuery(null);
              }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = T.surface3;
                    (e.currentTarget as HTMLButtonElement).style.color = T.text;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = T.muted;
                  }
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "none", background: isActive ? T.surface : "transparent", color: isActive ? T.accent : T.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", whiteSpace: "nowrap", boxShadow: isActive ? "0 4px 12px rgba(255, 153, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)" : "none" }}>
                {v.icon} {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", padding: "20px 24px 24px 24px" }}>
        {activeView === "crew_chats" ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: T.surface, color: T.text, padding: "16px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentLow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={15} color={T.accent} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: T.text, letterSpacing: "-0.01em" }}>AWS Club · Core–Crew Chat</span>
                  </div>
                  <span style={{ fontSize: 10, color: T.muted, fontWeight: 500 }}>Private communication channel for club operations</span>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, background: T.surface2, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.03em", userSelect: "none" }}>Operations</span>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <GroupChatPanel user={user} />
            </div>
          </div>
        ) : activeView === "manage_users" && user?.role === "core" ? (
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <ManageUsersPanel showToast={showToast} />
          </div>
        ) : activeView === "kb" ? (
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <FAQChipsManager showToast={showToast} />
          </div>
        ) : (
          /* ── Queries & CMS ── */
          <div style={{ display: "flex", gap: "24px", alignItems: "stretch", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>
            {/* Left: Query list */}
            <div style={{ flex: "1 1 60%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>
              {/* List header */}
              <div style={{ padding: "12px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 0, background: T.surface2 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Unhandled Queries</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{visible.length} showing</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 10px" }}>
                    <Search size={12} color={T.muted} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queries…"
                      style={{ background: "transparent", border: "none", fontSize: 12, outline: "none", color: T.text, width: 140 }} />
                  </div>
                  <button onClick={fetchData} style={{ background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 8px", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = T.surface2}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"}
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, overflowX: "auto", flexShrink: 0, background: "#FFFFFF", paddingLeft: 12 }}>
                {TABS.map(tab => {
                  const isActive = filterTab === tab.key;
                  const count = queries.filter(q => tab.key === "all" ? true : tab.key === "live" ? (q.status === "live" || q.status === "pending") : tab.key === "resolved" ? (q.status === "resolved" || q.status === "replied") : q.status === tab.key).length;
                  return (
                    <button key={tab.key} onClick={() => setFilterTab(tab.key as any)}
                      style={{ padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 12, color: isActive ? T.text : T.muted, borderBottom: `2px solid ${isActive ? T.accent : "transparent"}`, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", transition: "color .15s, border-color .15s" }}>
                      {tab.icon} {tab.label}
                      <span style={{ fontSize: 10, background: isActive ? T.accentLow : T.surface2, color: isActive ? T.accent : T.muted, padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 64px 64px 90px", gap: 12, padding: "8px 32px", background: T.surface2, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                {["ID", "Message", "Match", "Time", "Status"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {/* List body */}
              <div style={{ overflowY: "auto", flex: 1, background: "#FFFFFF", maxHeight: "480px" }}>
                {visible.length === 0 ? (
                  <div style={{ padding: 48, textAlign: "center", color: T.muted, fontSize: 13 }}>
                    <CheckCircle2 size={36} color={T.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontWeight: 600, color: T.text }}>No queries found</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>All clear for this filter.</div>
                  </div>
                ) : visible.map(q => <QueryRow key={q.id} q={q} isSelected={selectedQuery?.id === q.id} onSelect={setSelectedQuery} />)}
              </div>
            </div>

            {/* Right: CMS Panel Only */}
            <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", minHeight: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflowX: "hidden", overflowY: "auto" }}>
              <CMSPanel query={selectedQuery} onSaved={handleSaved} onDismissed={handleDismissed} showToast={showToast} />
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
