"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Cloud, Sparkles, ShieldCheck, Cpu, Award } from "lucide-react";
import Link from "next/link";

interface HeroBannerProps {
  onViewLeaderboardClick?: () => void;
}

const SURROUNDING_ICONS = [
  { src: "/aws-ec2.svg", label: "EC2" },
  { src: "/aws-Dynamo.svg", label: "DynamoDB" },
  { src: "/aws-lambda.svg", label: "Lambda" },
  { src: "/aws-s3.svg", label: "S3" },
  { src: "/aws-vpc.svg", label: "VPC" },
];

const ORBIT_RADIUS = 96; // Center-to-center distance in pixels

const POSITIONED_ICONS = SURROUNDING_ICONS.map((item, index) => {
  const angle = index * 72; // 5 icons: 360 / 5 = 72 degrees step
  return { ...item, angle };
});

export default function HeroBanner({ onViewLeaderboardClick }: HeroBannerProps = {}) {
  const [greeting, setGreeting] = useState("Hello");
  const [icon, setIcon] = useState();
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
        if (parsed.fullName) setUserName(parsed.fullName);
        else if (parsed.email) setUserName(parsed.email);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Background glow blobs to render through the glass blur */}
      <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-48 h-48 bg-brand-orange/20 rounded-full blur-[70px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-52 h-52 bg-brand-blue/15 rounded-full blur-[75px] pointer-events-none z-0" />

      {/* Glassmorphic Panel Wrapper */}
      <div className="relative w-full rounded-[22px] border border-white/50 bg-white/45 backdrop-blur-[24px] shadow-xl shadow-black/[0.03] overflow-hidden z-10">
        {/* Gradient from top-right orange to center white */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full min-h-[300px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Hero Text Content */}
          <div className="relative z-10 flex-1 flex flex-col items-start text-black">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-semibold mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin" style={{ animationDuration: "4s" }} />
              <span>AWS Student Builder Groups REC</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-display text-black drop-shadow-sm mb-3">
              {greeting}, {userName} ! {icon}
            </h1>

            <p className="text-black/80 max-w-xl text-[14px] md:text-base leading-relaxed mb-6">
              You're on track. Complete upcoming activities, attend community events, and continue climbing the leaderboard to unlock premium rewards and certifications.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/events">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold text-sm shadow-lg shadow-brand-orange/20 flex items-center gap-2 group transition-all"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <button
                onClick={onViewLeaderboardClick}
                className="px-6 py-3 rounded-xl bg-black/5 border border-black/10 text-black font-semibold text-sm flex items-center gap-2 transition-all hover:bg-black/10"
              >
                <Trophy className="w-4 h-4 text-brand-orange" />
                <span>View Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Right Side Visual Panel */}
          <div className="relative z-10 flex-shrink-0 w-full md:w-auto flex justify-center items-center md:px-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Animated floating circles / orbits */}
              <div className="absolute w-48 h-48 border border-dashed border-black/10 rounded-full animate-spin" style={{ animationDuration: "25s" }} />
              <div className="absolute w-32 h-32 border border-dotted border-black/20 rounded-full animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />

              {/* Central Main Large Icon (AWS Logo) */}
              <motion.div
                animate={{
                  y: [5, -5, 5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute z-10 w-24 h-24 bg-transparent flex items-center justify-center"
              >
                <img src="/aws-logo.svg" alt="AWS Logo" className="w-16 h-auto object-contain animate-pulse" style={{ animationDuration: "3s" }} />
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
                      className="absolute w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-black/10 shadow-md cursor-pointer z-20"
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
                          ? "0 12px 24px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.15)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
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
                      <img src={item.src} alt={item.label} className="w-8 h-8 object-contain" />
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute -bottom-8 px-2 py-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-semibold rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none tracking-wider uppercase"
                        >
                          {item.label}
                        </motion.div>
                      )}
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

