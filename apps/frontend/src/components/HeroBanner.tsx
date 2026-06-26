"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

interface HeroBannerProps {
  onViewLeaderboardClick?: () => void;
}

const SURROUNDING_ICONS = [
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-ec2.svg", label: "EC2" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-dynamodb.svg", label: "DynamoDB" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/aws-lambda.svg", label: "Lambda" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-s3.svg", label: "S3" },
  { src: "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/amazon-cloudwatch.svg", label: "CloudWatch" },
];

const ORBIT_RADIUS = 86; // Center-to-center distance in pixels

const POSITIONED_ICONS = SURROUNDING_ICONS.map((item, index) => {
  const angle = index * 72; // 5 icons: 360 / 5 = 72 degrees step
  return { ...item, angle };
});

export default function HeroBanner({ onViewLeaderboardClick }: HeroBannerProps = {}) {
  const [greeting, setGreeting] = useState("Hello");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [userName, setUserName] = useState("Attendee");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        let nameToFormat = "Attendee";
        if (parsed.fullName) nameToFormat = parsed.fullName;
        else if (parsed.email) nameToFormat = parsed.email;
        
        const cleanName = nameToFormat.includes('@') ? nameToFormat.split('@')[0] : nameToFormat;
        const formatted = cleanName
          .split(/[\s._-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setUserName(formatted);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Glow effect blobs to shine through glassmorphic cards */}
      <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-36 h-36 bg-brand-orange/25 rounded-full blur-[60px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-40 h-40 bg-brand-blue/15 rounded-full blur-[65px] pointer-events-none z-0" />

      {/* Glassmorphic welcome banner */}
      <div className="relative w-full rounded-[22px] border border-orange-100/60 bg-white/45 backdrop-blur-[24px] shadow-xl shadow-black/[0.03] overflow-hidden z-10">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.25) 0%, rgba(255, 153, 0, 0.12) 40%, rgba(255, 255, 255, 0) 70%)",
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full min-h-[190px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Welcome Text Content */}
          <div className="relative z-10 flex-1 flex flex-col items-start text-slate-800">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9900]/8 border border-[#FF9900]/30 text-[11px] mb-3 shadow-[0_1px_4px_rgba(255,153,0,0.04)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9900] animate-spin" style={{ animationDuration: "6s" }} />
              <span 
                className="text-slate-700 tracking-wider font-semibold"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
              >
                AWS Student Builders Group REC
              </span>
            </motion.div>

            <h1 
              className="text-[23px] md:text-[29px] font-semibold tracking-tight text-slate-900 drop-shadow-sm mb-2.5"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              {greeting}, <span className="capitalize font-bold text-slate-900 inline-block">{userName}</span>!
            </h1>

            <p 
              className="text-slate-600 max-w-xl text-[13.5px] leading-relaxed mb-5 text-left tracking-wide"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontWeight: 500 }}
            >
              You're on track. Complete upcoming activities, attend community events, and continue climbing the leaderboard to unlock premium rewards and certifications.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/events">
                <button
                  className="px-4.5 py-2 rounded-md bg-[#FF9900] hover:bg-[#FFA524] text-white font-semibold text-[12.5px] shadow-sm border border-[#FF9900] flex items-center gap-2 transition-all duration-150 cursor-pointer"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button
                onClick={onViewLeaderboardClick}
                className="px-4.5 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-[12.5px] shadow-sm flex items-center gap-2 transition-all duration-150 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-slate-500" />
                <span>View Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Right Side Visual Panel */}
          <div className="relative z-10 flex-shrink-0 w-full md:w-auto flex justify-center items-center md:px-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Animated floating circles / orbits */}
              <div className="absolute w-[172px] h-[172px] border border-dashed border-black/10 rounded-full animate-spin" style={{ animationDuration: "25s" }} />
              <div className="absolute w-[116px] h-[116px] border border-dotted border-black/20 rounded-full animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />

              {/* Central Main Large Icon (AWS Logo) */}
              <motion.div
                animate={{
                  y: [4, -4, 4],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute z-10 w-21 h-21 bg-transparent flex items-center justify-center"
              >
                <img src="/aws-logo.svg" alt="AWS Logo" className="w-14 h-auto object-contain animate-pulse" style={{ animationDuration: "3s" }} />
              </motion.div>

              {/* 5 Surrounding Smaller Icons (Orbiting) */}
              {POSITIONED_ICONS.map((item) => {
                const isHovered = hoveredIcon === item.label;
                return (
                  <motion.div
                    key={item.label}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      x: "-50%",
                      y: "-50%",
                    }}
                    animate={{
                      rotate: [item.angle, item.angle + 360],
                    }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <motion.div
                      className="absolute w-9.5 h-9.5 bg-white rounded-lg overflow-hidden border border-black/10 shadow-md cursor-pointer z-20"
                      style={{
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: `calc(-50% - ${ORBIT_RADIUS}px)`,
                      }}
                      animate={{
                        rotate: [-item.angle, -item.angle - 360],
                        scale: isHovered ? 1.25 : 1,
                        boxShadow: isHovered
                          ? "0 10px 20px -8px rgba(0, 0, 0, 0.15), 0 6px 12px -6px rgba(0, 0, 0, 0.15)"
                          : "0 3px 5px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.1)",
                        borderColor: isHovered
                          ? "rgba(255, 153, 0, 0.35)"
                          : "rgba(0, 0, 0, 0.1)",
                        zIndex: isHovered ? 30 : 20,
                      }}
                      transition={{
                        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                        scale: { type: "spring", stiffness: 400, damping: 15 },
                        boxShadow: { type: "spring", stiffness: 400, damping: 15 },
                        borderColor: { type: "spring", stiffness: 400, damping: 15 },
                      }}
                      onHoverStart={() => setHoveredIcon(item.label)}
                      onHoverEnd={() => setHoveredIcon(null)}
                    >
                      <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

