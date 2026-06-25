"use client";

import React, { useState, useEffect } from "react";
import GroupChatPanel from "@/components/chat/GroupChatPanel";

// AWS Brand Logo Component (Standalone Orange Smile)
const AWSBrandLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 120 503 240" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="matrix(1.672925,0,0,1.668521,-2.790411,-1.835373)" fill="#FF9900">
      <path d="M273.5,143.7C240.6,168 192.8,180.9 151.7,180.9C94.1,180.9 42.2,159.6 3,124.2C-0.1,121.4 2.7,117.6 6.4,119.8C48.8,144.4 101.1,159.3 155.2,159.3C191.7,159.3 231.8,151.7 268.7,136.1C274.2,133.6 278.9,139.7 273.5,143.7Z" />
      <path d="M287.2,128.1C283,122.7 259.4,125.5 248.7,126.8C245.5,127.2 245,124.4 247.9,122.3C266.7,109.1 297.6,112.9 301.2,117.3C304.8,121.8 300.2,152.7 282.6,167.5C279.9,169.8 277.3,168.6 278.5,165.6C282.5,155.7 291.4,133.4 287.2,128.1Z" />
    </g>
  </svg>
);

export default function CrewChatPage() {
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
      <div className="flex items-center justify-center h-[calc(100vh-130px)] m-4 md:m-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading crew chat workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full box-border select-none flex flex-col overflow-hidden pl-2 bg-[#F8FAFC]">
      <style>{`
        .premium-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(35, 47, 62, 0.12); border-radius: 99px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(35, 47, 62, 0.25); }
      `}</style>

      {/* Main Glass Panel */}
      <div className="relative flex-1 flex flex-col bg-white overflow-hidden z-10">
        
        {/* Header bar with role indication and chat room info */}
        <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b border-slate-200 bg-white select-none">
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#232F3E] to-[#1A222D] flex items-center justify-center border border-slate-200/50 shadow-xs">
              <AWSBrandLogo className="w-8 h-[19px]" />
            </div>
            <div>
              <h3 className="font-bold text-[#232F3E] text-[15px] tracking-tight leading-none">
                Crew General Room
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold mt-1.5 inline-block">
                Shared workspace for all core & crew members · Online
              </span>
            </div>
          </div>
        </div>

        {/* Main Panel View */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          <GroupChatPanel user={user} />
        </div>
      </div>
    </div>
  );
}
