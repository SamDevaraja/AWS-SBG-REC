"use client";

import React, { useState, useEffect } from "react";
import GroupChatPanel from "@/components/chat/GroupChatPanel";
import E2ECChatPanel from "@/components/chat/E2ECChatPanel";

const COLORS = {
  bg: "#F8FAFC",
  sidebar: "#232F3E",
  mint: "rgba(35, 47, 62, 0.1)",
  gold: "#FF9900",
  muted: "#475569",
  surface: "#FFFFFF",
  success: "#10b981",
  danger: "#ef4444",
  purple: "#8b5cf6",
};

export default function CrewChatPage() {
  const [activeTab, setActiveTab] = useState<"group" | "e2e">("group");
  const [user, setUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser({
          id: parsed.id || "dev_crew",
          email: parsed.email || "crew@awsclub.dev",
          fullName: parsed.fullName || parsed.name || "Crew Member",
          role: parsed.role || "crew",
          avatar: parsed.avatar || null,
        });
      } else {
        // Fallback for easy testing or dev mode
        setUser({
          id: "dev_crew",
          email: "crew@awsclub.dev",
          fullName: "Crew Member",
          role: "crew",
          avatar: null,
        });
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", height: "calc(100vh - 110px)", margin: "0 24px 24px" }}>
        <div style={{ fontSize: 13, color: COLORS.muted }}>Loading crew chat workspace...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 130px)",
        margin: "20px 24px 24px",
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(35, 47, 62, 0.1)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .tab-btn {
          padding: 8px 18px;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          alignItems: center;
          gap: 6px;
        }
        .tab-btn.active-group {
          background: rgba(255, 153, 0, 0.15);
          border-color: rgba(255, 153, 0, 0.45);
          color: #CC7A00;
        }
        .tab-btn.active-e2e {
          background: rgba(143, 124, 242, 0.15);
          border-color: rgba(143, 124, 242, 0.45);
          color: #6d5da1;
        }
        .tab-btn.inactive {
          background: transparent;
          color: ${COLORS.muted};
        }
        .tab-btn.inactive:hover {
          background: rgba(0,0,0,0.03);
          color: ${COLORS.sidebar};
        }
      `}</style>

      {/* Header bar with role indication and chat room tabs */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          padding: "12px 24px",
          borderBottom: `1px solid ${COLORS.mint}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            💬
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: COLORS.sidebar }}>
              {activeTab === "group" ? "🌐 Crew General Room" : "🔒 End-to-End Encrypted Room"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: COLORS.muted }}>
              {activeTab === "group"
                ? "Shared workspace for all core & crew members"
                : "Secure channel — key encryption required"}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "flex",
            background: "rgba(0, 0, 0, 0.04)",
            padding: 4,
            borderRadius: 9999,
            gap: 4,
          }}
        >
          <button
            onClick={() => setActiveTab("group")}
            className={`tab-btn ${activeTab === "group" ? "active-group" : "inactive"}`}
          >
            🌐 General Group Chat
          </button>
          <button
            onClick={() => setActiveTab("e2e")}
            className={`tab-btn ${activeTab === "e2e" ? "active-e2e" : "inactive"}`}
          >
            🔒 Secure E2EE Chat
          </button>
        </div>
      </header>

      {/* Main Panel View */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "group" ? (
          <GroupChatPanel user={user} />
        ) : (
          <E2ECChatPanel user={user} />
        )}
      </div>
    </div>
  );
}
