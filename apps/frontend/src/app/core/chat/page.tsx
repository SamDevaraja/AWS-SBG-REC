"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import GroupChatPanel from "@/components/chat/GroupChatPanel";
import E2ECChatPanel from "@/components/chat/E2ECChatPanel";

// Design tokens
const A = {
  bg: "#F8FAFC",
  surface: "rgba(255, 255, 255, 0.65)",
  surface2: "rgba(35, 47, 62, 0.05)",
  border: "rgba(35, 47, 62, 0.1)",
  accent: "#FF9900",
  accentHov: "#E08500",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#0F172A",
  muted: "#475569",
  highlight: "#8b5cf6",
};

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

const statusColor = (s: string) => {
  if (s === "pending" || s === "live") return A.warning;
  if (s === "resolved" || s === "replied") return A.success;
  if (s === "dismissed") return A.muted;
  return A.muted;
};

const simPct = (v: number | null) => (v != null ? `${Math.round(v * 100)}%` : "—");

// Tiny Toast component
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
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 1000,
        background: isErr ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
        border: `1px solid ${isErr ? A.danger : A.success}`,
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        maxWidth: 360,
        animation: "slideUp .3s ease",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{isErr ? "❌" : "✅"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: A.text, fontWeight: 600 }}>{toast.title}</div>
        {toast.body && <div style={{ fontSize: 10, color: A.muted, marginTop: 4, lineHeight: 1.5 }}>{toast.body}</div>}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: A.muted, cursor: "pointer", padding: 0, fontSize: 14 }}>×</button>
    </div>
  );
}

// Stats Pill
const StatPill = ({ label, value, color }: { label: string; value: number | undefined; color: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: "8px 16px",
      background: A.surface2,
      borderRadius: 10,
      border: `1px solid ${A.border}`,
      minWidth: 80,
    }}
  >
    <span style={{ fontSize: 16, fontWeight: 700, color }}>{value ?? "—"}</span>
    <span style={{ fontSize: 9, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
  </div>
);

// Query row
interface Query {
  id: string;
  sessionId: string;
  message: string;
  bestSimilarity: number;
  bestMatchDoc?: string | null;
  timestamp: string;
  status: string;
}

interface QueryRowProps {
  q: Query;
  isSelected: boolean;
  onSelect: (q: Query) => void;
}

const QueryRow = ({ q, isSelected, onSelect }: QueryRowProps) => (
  <tr
    onClick={() => onSelect(q)}
    style={{
      cursor: "pointer",
      background: isSelected ? `${A.accent}18` : "transparent",
      borderBottom: `1px solid ${A.border}`,
      transition: "background .15s",
    }}
  >
    <td style={{ padding: "10px 14px", color: A.muted, fontSize: 10, whiteSpace: "nowrap" }}>#{q.id.slice(-6)}</td>
    <td style={{ padding: "10px 14px", color: A.text, fontSize: 12, maxWidth: 280 }}>
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }} title={q.message}>
        {q.message}
      </div>
    </td>
    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
      <span style={{ padding: "2px 8px", borderRadius: 99, background: `${A.accent}22`, border: `1px solid ${A.accent}44`, color: A.accent, fontSize: 10, fontWeight: 600 }}>
        {simPct(q.bestSimilarity)}
      </span>
    </td>
    <td style={{ padding: "10px 14px", color: A.muted, fontSize: 10, whiteSpace: "nowrap" }}>{relativeTime(q.timestamp)}</td>
    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
      <span style={{ padding: "3px 10px", borderRadius: 99, background: `${statusColor(q.status)}22`, border: `1px solid ${statusColor(q.status)}44`, color: statusColor(q.status), fontSize: 10, fontWeight: 600, textTransform: "capitalize" }}>
        {q.status}
      </span>
    </td>
  </tr>
);

// FAQ Chips Manager Component
interface FAQChip {
  id: string;
  question: string;
  answer: string;
}

function FAQChipsManager({ showToast }: { showToast: (t: any) => void }) {
  const [chips, setChips] = useState<FAQChip[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});

  const toggleChip = (id: string) => {
    setExpandedChips((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchChips = useCallback(async () => {
    try {
      const res = await fetch("/api/faq-chips");
      const data = await res.json();
      const chipsList = data.data?.chips ?? data.chips ?? [];
      setChips(chipsList);
    } catch {
      showToast({ type: "error", title: "Failed to load FAQ chips." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchChips();
  }, [fetchChips]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/faq-chips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      });
      if (!res.ok) throw new Error();
      await fetchChips();
      setNewQuestion("");
      setNewAnswer("");
      showToast({ type: "success", title: "FAQ Chip Added" });
    } catch {
      showToast({ type: "error", title: "Failed to add FAQ chip" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ chip?")) return;
    try {
      const res = await fetch(`/api/admin/faq-chips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setChips((prev) => prev.filter((c) => c.id !== id));
      showToast({ type: "success", title: "FAQ Chip Deleted" });
    } catch {
      showToast({ type: "error", title: "Delete failed" });
    }
  };

  return (
    <div style={{ background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14, padding: 18, marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: A.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
        🏷️ FAQ Chips Manager
      </div>
      
      {loading ? (
        <div style={{ fontSize: 12, color: A.muted }}>Loading FAQ chips...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
          {chips.map((chip) => {
            const isExpanded = !!expandedChips[chip.id];
            return (
              <div 
                key={chip.id} 
                onClick={() => toggleChip(chip.id)}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  background: A.surface2, 
                  padding: "10px 14px", 
                  borderRadius: 8, 
                  border: `1px solid ${A.border}`,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(35, 47, 62, 0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = A.surface2}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 12, color: A.text, fontWeight: 600, flex: 1 }}>
                    {chip.question}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ 
                        transition: "transform 0.2s ease-in-out", 
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        color: A.muted
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(chip.id); }} 
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: A.muted, 
                        cursor: "pointer", 
                        fontSize: 16, 
                        padding: 0,
                        lineHeight: 1
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = A.danger}
                      onMouseLeave={(e) => e.currentTarget.style.color = A.muted}
                    >
                      ×
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div 
                    style={{ 
                      fontSize: "10.5px", 
                      color: A.muted, 
                      marginTop: 8, 
                      paddingTop: 8, 
                      borderTop: `1px dashed ${A.border}`, 
                      lineHeight: 1.5 
                    }}
                  >
                    {chip.answer}
                  </div>
                )}
              </div>
            );
          })}
          {chips.length === 0 && <div style={{ fontSize: 12, color: A.muted }}>No FAQ chips configured.</div>}
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="New FAQ question..."
          style={{ width: "100%", background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", color: A.text, fontSize: 12, outline: "none" }}
        />
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Predefined answer..."
          rows={3}
          className="custom-textarea"
          style={{ minHeight: "90px", padding: "8px 12px", fontSize: "12px", background: A.surface2 }}
        />
        <button
          type="submit"
          disabled={adding || !newQuestion.trim() || !newAnswer.trim()}
          className="btn-3d-pill-accent"
          style={{
            alignSelf: "flex-end",
            background: A.accent,
            border: "none",
            padding: "8px 20px",
            color: "#fff",
            fontWeight: 600,
            fontSize: 12,
            borderRadius: 9999,
            cursor: adding || !newQuestion.trim() || !newAnswer.trim() ? "not-allowed" : "pointer",
            opacity: adding || !newQuestion.trim() || !newAnswer.trim() ? 0.6 : 1,
          }}
        >
          {adding ? "Adding..." : "Add FAQ Chip"}
        </button>
      </form>
    </div>
  );
}

// User Profile Avatar Component
function Avatar({ initials, color, photo, size = 36 }: { initials: string; color?: string; photo?: string | null; size?: number }) {
  // If photo is an object, attempt to extract its photo string
  const src = typeof photo === 'object' && photo !== null ? (photo as any).photo : photo;

  const isValidPhoto = src && 
                       typeof src === 'string' && 
                       src.trim() !== "" && 
                       src !== "null" && 
                       src !== "undefined" && 
                       src !== "[object Object]";

  if (isValidPhoto) {
    return (
      <img
        src={src}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          userSelect: "none",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || A.accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.floor(size * 0.38),
        color: "#fff",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

// CMS reply / review editor panel
interface CMSPanelProps {
  query: Query | null;
  onSaved: (id: string) => void;
  onDismissed: (id: string) => void;
  showToast: (t: any) => void;
}

function CMSPanel({ query, onSaved, onDismissed, showToast }: CMSPanelProps) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(""); // "" | "saving" | "dismissing"
  const [saveResult, setSaveResult] = useState<{ doc_id: string; total: number } | null>(null);

  const handleSave = async () => {
    if (!query) return;
    if (!answer.trim()) {
      showToast({ type: "error", title: "Answer cannot be empty." });
      return;
    }
    setSaving("saving");
    try {
      const res = await fetch(`/api/admin/reply-live/${query.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaveResult({ doc_id: data.doc_id, total: data.chroma_total_docs });
      showToast({
        type: "success",
        title: "Saved to Knowledge Base!",
        body: `Future similar queries will be auto-answered.`,
      });
      onSaved(query.id);
    } catch {
      showToast({ type: "error", title: "Save failed." });
    } finally {
      setSaving("");
    }
  };

  const handleDismiss = async () => {
    if (!query) return;
    setSaving("dismissing");
    try {
      const res = await fetch(`/api/admin/query/${query.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: "Query dismissed." });
      onDismissed(query.id);
    } catch {
      showToast({ type: "error", title: "Dismiss failed." });
    } finally {
      setSaving("");
    }
  };

  if (!query) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: A.surface, borderRadius: 14, padding: 40, border: `1px solid ${A.border}`, color: A.muted, minHeight: 320, flexShrink: 0 }}>
        <div style={{ fontSize: 32 }}>📋</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>No query selected</div>
        <div style={{ fontSize: 11, textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
          Select any query in the unhandled list to review and reply.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, background: A.surface, borderRadius: 14, padding: 24, border: `1px solid ${A.border}`, minHeight: 320, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          CMS Editor · Query #{query.id.slice(-8)}
        </div>
        <span style={{ padding: "2px 8px", borderRadius: 99, background: `${statusColor(query.status)}22`, color: statusColor(query.status), fontSize: 10, fontWeight: 700, textTransform: "capitalize", border: `1px solid ${statusColor(query.status)}44` }}>
          {query.status}
        </span>
      </div>

      <div style={{ background: A.surface2, borderRadius: 10, border: `1px solid ${A.border}`, padding: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: A.muted, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
          👤 User Asked
        </div>
        <div style={{ fontSize: 13, color: A.text, lineHeight: 1.6, fontWeight: 500 }}>{query.message}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 9, color: A.muted }}>
          <span>🕐 {relativeTime(query.timestamp)}</span>
          <span>📊 Similarity Match: {simPct(query.bestSimilarity)}</span>
        </div>
      </div>

      {query.bestMatchDoc && (
        <details style={{ background: A.surface2, borderRadius: 8, border: `1px solid ${A.border}`, padding: "8px 12px" }}>
          <summary style={{ cursor: "pointer", fontSize: 11, color: A.muted, fontWeight: 600, userSelect: "none" }}>
            💡 Closest KB match (for context)
          </summary>
          <div style={{ marginTop: 8, fontSize: 11, color: A.muted, lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }}>
            {query.bestMatchDoc}
          </div>
        </details>
      )}

      <div style={{ borderTop: `1px solid ${A.border}` }} />

      {saveResult ? (
        <div style={{ background: `${A.success}10`, border: `1px solid ${A.success}40`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 14, color: A.success, fontWeight: 700 }}>✅ Added to ChromaDB Knowledge Base</div>
          <div style={{ fontSize: 11, color: A.muted }}>
            Future similar queries will automatically receive this reply.
          </div>
        </div>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write the correct answer to save to database..."
            rows={8}
            disabled={saving !== ""}
            className="custom-textarea"
            style={{ minHeight: "220px", padding: "16px 20px", fontSize: "14.0px", resize: "vertical" }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {query.status === "live" && (
              <button
                onClick={handleDismiss}
                disabled={saving !== ""}
                className="tab-btn inactive"
                style={{ borderRadius: 20, padding: "8px 18px", border: "1px solid rgba(0,0,0,0.12)", color: A.danger, cursor: "pointer", fontSize: 12 }}
              >
                {saving === "dismissing" ? "Dismissing..." : "Dismiss Query"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving !== "" || !answer.trim()}
              className="btn-3d-pill-accent"
              style={{
                borderRadius: 9999,
                background: A.accent,
                border: "none",
                padding: "8px 20px",
                color: "#fff",
                fontWeight: 600,
                fontSize: 12,
                cursor: saving !== "" || !answer.trim() ? "not-allowed" : "pointer",
                opacity: saving !== "" || !answer.trim() ? 0.6 : 1,
              }}
            >
              {saving === "saving" ? "Saving..." : "Save to Knowledge Base"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// User accounts manager panel
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: { photo?: string | null; initials: string; color: string } | null;
  banned: boolean;
}

interface BanLogItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bannedBy: string;
  banReason: string;
  bannedAt: string;
}

function ManageUsersPanel({ showToast }: { showToast: (t: any) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("crew");
  const [creating, setCreating] = useState(false);

  // Ban log state
  const [banLog, setBanLog] = useState<BanLogItem[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"members" | "log">("members");

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      const usersList = data.data?.users ?? data.users ?? [];
      setMembers(usersList);
    } catch {
      showToast({ type: "error", title: "Failed to load members list" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBanLog = async () => {
    setLoadingLog(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getBanLog" }),
      });
      const data = await res.json();
      const logList = data.data?.banLog ?? data.banLog ?? [];
      setBanLog(logList);
    } catch {
      console.error("Failed to load ban log");
    } finally {
      setLoadingLog(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchBanLog();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      showToast({ type: "error", title: "All fields are required" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({ type: "error", title: "Registration failed", body: data.error });
        return;
      }
      showToast({ type: "success", title: "Member account created successfully!" });
      setName("");
      setEmail("");
      setPassword("");
      setRole("crew");
      fetchMembers();
    } catch {
      showToast({ type: "error", title: "Network error occurred" });
    } finally {
      setCreating(false);
    }
  };

  const handleBan = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}? They will immediately lose workspace access.`)) return;
    try {
      const res = await fetch(`/api/auth?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: `${name} has been deactivated.` });
      fetchMembers();
      fetchBanLog();
    } catch {
      showToast({ type: "error", title: "Failed to deactivate member" });
    }
  };

  const handleUnban = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban", userId: id }),
      });
      if (!res.ok) throw new Error();
      showToast({ type: "success", title: `${name} has been activated successfully!` });
      fetchMembers();
      fetchBanLog();
    } catch {
      showToast({ type: "error", title: "Failed to activate member" });
    }
  };

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* List section */}
      <div style={{ flex: "1 1 58%", background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: A.text }}>Members Management</div>
            <div style={{ fontSize: 11, color: A.muted, marginTop: 2 }}>Core and Crew operational accounts</div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(0, 0, 0, 0.04)", padding: 3, borderRadius: 20 }}>
            <button onClick={() => setActiveSubTab("members")} style={{ border: "none", background: activeSubTab === "members" ? "#fff" : "transparent", cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 20, color: A.text }}>Active</button>
            <button onClick={() => setActiveSubTab("log")} style={{ border: "none", background: activeSubTab === "log" ? "#fff" : "transparent", cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 20, color: A.text }}>Inactive</button>
          </div>
        </div>

        <div style={{ padding: "10px 20px", maxHeight: 420, overflowY: "auto" }}>
          {loading ? (
            <div style={{ fontSize: 12, color: A.muted, textAlign: "center", padding: 20 }}>Loading...</div>
          ) : activeSubTab === "members" ? (
            members.filter(m => !m.banned).map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${A.border}88` }}>
                <Avatar
                  initials={m.avatar?.initials || m.name.slice(0,2).toUpperCase()}
                  color={m.avatar?.color || A.accent}
                  photo={m.avatar?.photo}
                  size={34}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: A.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: A.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: m.role === "core" ? `${A.accent}20` : `${A.highlight}20`, color: m.role === "core" ? A.accent : A.highlight, textTransform: "uppercase" }}>{m.role}</span>
                <button onClick={() => handleBan(m.id, m.name)} style={{ background: "none", border: "none", color: A.danger, fontSize: 11, cursor: "pointer", fontWeight: "bold" }}>Deactivate</button>
              </div>
            ))
          ) : (
            banLog.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${A.border}88` }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: A.muted, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{m.userName.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: A.text }}>{m.userName}</div>
                  <div style={{ fontSize: 10, color: A.muted }}>{m.userEmail}</div>
                </div>
                <button onClick={() => handleUnban(m.userId, m.userName)} style={{ background: "none", border: "none", color: A.success, fontSize: 11, cursor: "pointer", fontWeight: "bold" }}>Activate</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Register form */}
      <div style={{ flex: "1 1 38%", background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: A.text, marginBottom: 12 }}>👤 Register New Member</div>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={{ width: "100%", background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", color: A.text, fontSize: 12, outline: "none" }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={{ width: "100%", background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", color: A.text, fontSize: 12, outline: "none" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passphrase / Password" style={{ width: "100%", background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", color: A.text, fontSize: 12, outline: "none" }} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: "100%", background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "8px 12px", color: A.text, fontSize: 12, outline: "none" }}>
            <option value="crew">Crew (Volunteer / Scanner)</option>
            <option value="core">Core Admin</option>
          </select>
          <button type="submit" disabled={creating} className="btn-3d-pill-accent" style={{ background: A.accent, border: "none", padding: "10px", color: "#fff", fontWeight: 700, borderRadius: 9999, fontSize: 12, cursor: creating ? "not-allowed" : "pointer" }}>
            {creating ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Core Admin Chat Page Main Export
export default function CoreChatPage() {
  const [activeView, setActiveView] = useState<"queries" | "crew_chats" | "manage_users">("queries");
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
      const [qRes, sRes] = await Promise.all([
        fetch("/api/admin/unhandled"),
        fetch("/api/admin/stats"),
      ]);
      if (!qRes.ok || !sRes.ok) throw new Error();
      
      const qData = await qRes.json();
      const sData = await sRes.json();

      const queriesList = qData.data?.queries ?? qData.queries ?? [];
      const statsObj = sData.data ?? sData;

      // Normalize prisma snake/camel case
      const normQueries = queriesList.map((q: any) => ({
        id: q.id,
        sessionId: q.sessionId || q.session_id,
        message: q.message,
        bestSimilarity: q.bestSimilarity || q.best_similarity || 0,
        bestMatchDoc: q.bestMatchDoc || q.best_match_doc || null,
        timestamp: q.timestamp,
        status: q.status,
      }));

      setQueries(normQueries);
      setStats(statsObj);
    } catch {
      showToast({ type: "error", title: "Failed to load database stats" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        setUser({ id: "dev_core", fullName: "Core Administrator", role: "core", email: "admin@awsclub.dev" });
      }
    } catch {
      setUser({ id: "dev_core", fullName: "Core Administrator", role: "core", email: "admin@awsclub.dev" });
    }
  }, []);

  const handleSaved = useCallback(() => {
    fetchData();
    setSelectedQuery(null);
  }, [fetchData]);

  const handleDismissed = useCallback(() => {
    fetchData();
    setSelectedQuery(null);
  }, [fetchData]);

  // Filtered queries list
  const visible = queries.filter((q) => {
    const matchTab =
      filterTab === "all" ||
      (filterTab === "live" && (q.status === "live" || q.status === "pending")) ||
      (filterTab === "resolved" && (q.status === "resolved" || q.status === "replied")) ||
      q.status === filterTab;
    const matchSearch = !search || q.message.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const TABS = [
    { key: "live", label: "Live Chats", color: A.warning },
    { key: "resolved", label: "Resolved", color: A.success },
    { key: "dismissed", label: "Dismissed", color: A.muted },
    { key: "all", label: "All", color: A.accent },
  ];

  return (
    <div className="admin-chat-container">
      <style>{`
        .admin-chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 56px);
          padding: 16px 20px 12px;
          color: ${A.text};
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }
        .tab-btn {
          padding: 5px 14px;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active-admin {
          background: rgba(255, 153, 0, 0.15);
          border-color: rgba(255, 153, 0, 0.45);
          color: #CC7A00;
        }
        .tab-btn.inactive {
          background: transparent;
          color: ${A.muted};
        }
        .tab-btn.inactive:hover {
          background: rgba(0,0,0,0.03);
          color: ${A.text};
        }
        .chat-grid {
          display: flex;
          gap: 20px;
          align-items: stretch;
          flex: 1;
          min-height: 0;
          height: 100%;
          overflow: hidden;
        }
        .left-col {
          flex: 1 1 58%;
          background: ${A.surface};
          border: 1px solid ${A.border};
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          min-height: 0;
        }
        .right-col {
          flex: 1 1 38%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          max-height: 100%;
          overflow-y: auto;
          min-height: 0;
          padding-right: 4px;
        }
        @media (max-width: 1024px) {
          .admin-chat-container {
            height: auto;
            overflow: visible;
          }
          .chat-grid {
            flex-direction: column;
            align-items: initial;
            height: auto;
            flex: none;
            overflow: visible;
          }
          .left-col, .right-col {
            flex: 1 1 100%;
            height: auto;
            max-height: none;
          }
        }
        .custom-textarea {
          width: 100%;
          flex-shrink: 0;
          border-radius: 10px;
          border: 1.5px solid ${A.border};
          background: #ffffff;
          color: ${A.text};
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease-in-out;
          outline: none;
        }
        .custom-textarea:focus {
          border-color: ${A.accent};
          box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.15);
        }
        .custom-textarea:disabled {
          background: ${A.surface2};
          color: ${A.muted};
          cursor: not-allowed;
        }
      `}</style>

      {/* Custom Subheader inside layout wrapper */}
      <div style={{ background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)", borderRadius: 24, padding: '16px 24px', marginBottom: 16 }}>
        {/* Row 1: Title + Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Chat Administration</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>AWS Club Operations</div>
          </div>

          {/* View Navigation */}
          <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: "3px 4px", borderRadius: 9999 }}>
            <button onClick={() => setActiveView("queries")} className={`tab-btn ${activeView === "queries" ? "active-admin" : "inactive"}`}>Unhandled Queries & KB</button>
            <button onClick={() => setActiveView("crew_chats")} className={`tab-btn ${activeView === "crew_chats" ? "active-admin" : "inactive"}`}>Crew General & E2EE Chat</button>
            <button onClick={() => setActiveView("manage_users")} className={`tab-btn ${activeView === "manage_users" ? "active-admin" : "inactive"}`}>Manage Members</button>
          </div>
        </div>

        {/* Row 2: Stats */}
        {activeView === "queries" && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <StatPill label="Live" value={stats?.live} color={A.warning} />
            <StatPill label="Resolved" value={stats?.resolved} color={A.success} />
            <StatPill label="KB Docs" value={stats?.kb_docs} color={A.accent} />
          </div>
        )}

        {/* Orange divider */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 12, borderRadius: 2 }} />
      </div>

      {/* Main panel body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeView === "crew_chats" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              background: "#fff",
              borderRadius: 14,
              border: `1px solid ${A.border}`,
              overflow: "hidden",
            }}
          >
            {/* Header selection between E2EE and general for admin */}
            <div style={{ background: "#f0f2f5", padding: "10px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>AWS Club General Core-Crew Chat</div>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <GroupChatPanel user={user} />
            </div>
          </div>
        ) : activeView === "manage_users" ? (
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <ManageUsersPanel showToast={showToast} />
          </div>
        ) : (
          /* Queries & CMS View */
          <div className="chat-grid">
            {/* Left table */}
            <div className="left-col">
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: A.text }}>Unhandled Queries</div>
                  <div style={{ fontSize: 10, color: A.muted }}>{visible.length} queries shown</div>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search queries..."
                  style={{ background: A.surface2, border: `1px solid ${A.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, outline: "none", color: A.text, width: 180 }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: "flex", borderBottom: `1px solid ${A.border}`, overflowX: "auto" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key as any)}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 11,
                      color: filterTab === tab.key ? tab.color : A.muted,
                      borderBottom: `2.5px solid ${filterTab === tab.key ? tab.color : "transparent"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {tab.label}
                    <span style={{ fontSize: 9, background: filterTab === tab.key ? `${tab.color}22` : A.surface2, color: filterTab === tab.key ? tab.color : A.muted, padding: "1px 5px", borderRadius: 10 }}>
                      {
                        queries.filter((q) =>
                          tab.key === "all"
                            ? true
                            : tab.key === "live"
                            ? q.status === "live" || q.status === "pending"
                            : tab.key === "resolved"
                            ? q.status === "resolved" || q.status === "replied"
                            : q.status === tab.key
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>

              {/* Table Body */}
              <div style={{ overflowY: "auto", overflowX: "auto", flex: 1 }}>
                {visible.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: A.muted, fontSize: 12 }}>
                    No queries found.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${A.border}`, background: "rgba(0,0,0,0.02)" }}>
                        {["ID", "User Message", "Match", "Time", "Status"].map((h) => (
                          <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 9, fontWeight: 700, color: A.muted, textTransform: "uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((q) => (
                        <QueryRow key={q.id} q={q} isSelected={selectedQuery?.id === q.id} onSelect={setSelectedQuery} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right side: CMS Panel & FAQ manager */}
            <div className="right-col">
              <CMSPanel query={selectedQuery} onSaved={handleSaved} onDismissed={handleDismissed} showToast={showToast} />
              
              {activeView === "queries" && (
                <FAQChipsManager showToast={showToast} />
              )}
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
