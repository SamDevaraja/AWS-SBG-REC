"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Fingerprint, Lightbulb, BadgeCheck, Star, Share2 } from "lucide-react";

const STAGE_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  Register: Fingerprint,
  Learn:    Lightbulb,
  Certify:  BadgeCheck,
  Lead:     Star,
  Share:    Share2,
};



const STAGES = [
  { label:"Register",  sub:"First Step",      color:"#FF9900", light:"rgba(255, 153, 0, 0.08)", glow:"rgba(255, 153, 0, 0.15)" },
  { label:"Learn",     sub:"Core AWS",        color:"#FF9900", light:"rgba(255, 153, 0, 0.08)", glow:"rgba(255, 153, 0, 0.15)" },
  { label:"Certify",   sub:"Get Badges",      color:"#FF9900", light:"rgba(255, 153, 0, 0.08)", glow:"rgba(255, 153, 0, 0.15)" },
  { label:"Lead",      sub:"Be a Mentor",     color:"#FF9900", light:"rgba(255, 153, 0, 0.08)", glow:"rgba(255, 153, 0, 0.15)" },
  { label:"Share",     sub:"Impact",          color:"#FF9900", light:"rgba(255, 153, 0, 0.08)", glow:"rgba(255, 153, 0, 0.15)" },
];
const DESCS = [
  "Join AWS SBG REC, explore cloud fundamentals and set up your first AWS services.",
  "Follow structured courses and roadmaps. Learn by doing alongside driven peers.",
  "Prep with Quiz Arena and mock exams, then earn your AWS certifications.",
  "Mentor others, lead projects and launch your cloud career with confidence.",
  "Share your expertise with the community, build open source projects, and grow together.",
];

export default function JourneyCard({ plain = false, hideDesc = false, isDark = false, hideTitle = false }: { plain?: boolean; hideDesc?: boolean; isDark?: boolean; hideTitle?: boolean }) {
  const [active, setActive] = useState(0);
  const [hov, setHov] = useState<number|null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a+1)%STAGES.length), 2400);
    return () => clearInterval(t);
  }, []);

  const cur = STAGES[active];
  const DescIconComponent = STAGE_ICONS[cur.label];

  return (
    <div
      style={plain ? {
        width: "100%",
        background: "transparent",
      } : {
        width:"100%",maxWidth:500,
        background:"#FFFFFF",border:"1px solid rgba(255,255,255,.95)",
        borderRadius:26,overflow:"hidden",
        boxShadow:"0 0 0 1px rgba(255,153,0,.06), 0 4px 20px rgba(255,153,0,.05), 0 20px 50px rgba(30,45,61,.04), inset 0 1px 0 rgba(255,255,255,1)",
      }}>
      {/* gradient top bar — draws in */}
      {!plain && (
        <motion.div
          initial={{ scaleX:0 }}
          animate={{ scaleX:1 }}
          transition={{ duration:.9, ease:"easeOut" }}
          style={{ height:5, background:"linear-gradient(90deg,#FF9900,#E68900,#0073BB,#1e2d3d)", transformOrigin:"left" }}/>
      )}

      <div style={plain ? { padding: "0" } : { padding:"32px 30px 28px" }}>
        {!hideTitle && (
          <div style={{textAlign:"center",marginBottom: plain ? 20 : 32}}>
            <div style={{fontWeight:800,fontSize: isMobile ? 16 : 18,color: isDark ? "#FFFFFF" : "#1d2939",marginBottom:6}}>
              Your Journey with AWS SBG REC
            </div>
            <div style={{fontSize: isMobile ? 11 : 13,color: isDark ? "#94A3B8" : "#9ca3af"}}>From beginner to cloud professional</div>
          </div>
        )}

        {/* nodes */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          margin: hideDesc ? "0 auto 8px" : "0 auto 24px",
          padding: plain ? (isMobile ? "0 2px" : "0 32px") : "0 32px",
          boxSizing: "border-box"
        }}>
          {/* Progress bar background line — starts/ends at center of first/last circle */}
          <div style={{
            position: "absolute",
            top: isMobile ? 18 : 24, // vertically centered with node circles
            left: isMobile ? "30px" : "55px",   // = half of node column width (60px / 110px)
            right: isMobile ? "30px" : "55px",
            height: 2,
            background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(35, 47, 62, 0.08)",
            borderRadius: 2,
            zIndex: 1  // circles are zIndex:3 so they sit on top of the line
          }} />
          
          {/* Active progress bar line fill — same bounds as background track */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: active / (STAGES.length - 1) }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              top: isMobile ? 18 : 24,
              left: isMobile ? "30px" : "55px",
              width: `calc(100% - ${isMobile ? '60px' : '110px'})`,
              height: 2,
              background: "#FF9900",
              transformOrigin: "left",
              borderRadius: 2,
              zIndex: 2  // circles are zIndex:3 so they sit on top of the line
            }}
          />

          {/* Flex Container for Nodes */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
            zIndex: 3,
            width: "100%"
          }}>
            {STAGES.map((st, i) => {
              const isA = i === active, isP = i < active, isH = hov === i;
              const circleSize = isMobile ? 36 : 48; // Uniform node size
              const IconComponent = STAGE_ICONS[st.label];
              
              // Icon color: white for active, stage color for completed, muted for future
              const iconColor = isA ? "#ffffff" : (isP ? st.color : (isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(15, 23, 42, 0.35)"));

              // Background and borders based on state:
              let nodeBg = "";
              let nodeBorder = "";
              let nodeShadow = "none";

              if (isA) {
                nodeBg = st.color;
                nodeBorder = `2px solid ${st.color}`;
                nodeShadow = `0 0 0 4px ${st.glow}, 0 4px 16px ${st.glow}`;
              } else if (isP) {
                // Solid background so the progress line doesn't bleed through the circle
                nodeBg = isDark ? "#1e2d3d" : "#ffffff";
                nodeBorder = `2px solid ${st.color}`;
              } else {
                // Solid background so the track line doesn't bleed through the circle
                nodeBg = isDark ? "#1a2535" : "#ffffff";
                nodeBorder = `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(35, 47, 62, 0.12)"}`;
              }

              return (
                <motion.div
                  key={i}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    zIndex: 10,
                    width: isMobile ? "60px" : "110px",
                  }}
                >
                  {/* Fixed-height wrapper to center the circle perfectly */}
                  <div style={{
                    height: isMobile ? 36 : 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%"
                  }}>
                    <motion.div
                      style={{
                        width: circleSize,
                        height: circleSize,
                        borderRadius: "50%",
                        background: nodeBg,
                        border: nodeBorder,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: nodeShadow,
                        transition: "all 0.25s ease",
                      }}
                    >
                      {IconComponent && <IconComponent size={isMobile ? 16 : 22} color={iconColor} strokeWidth={2} />}
                    </motion.div>
                  </div>
                  
                  {/* Label Text */}
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <div style={{
                      fontSize: isMobile ? "11px" : "13.5px",
                      fontWeight: isA ? 700 : 600,
                      color: isA ? (isDark ? "#ffffff" : st.color) : (isP ? (isDark ? "#E2E8F0" : "#475569") : (isDark ? "#64748B" : "#94A3B8")),
                      whiteSpace: "nowrap",
                      transition: "color 0.2s ease",
                    }}>
                      {st.label}
                    </div>
                    <div style={{
                      fontSize: isMobile ? "8px" : "10.5px",
                      color: isA ? "#FF9900" : (isDark ? "#475569" : "#94A3B8"),
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                      marginTop: 2,
                    }}>
                      {st.sub}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* desc */}
        {!hideDesc && (
          <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto 16px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : cur.light,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : `1.5px solid ${cur.color}28`,
                  borderRadius: 16,
                  padding: isMobile ? "10px 12px" : "15px 17px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <div style={{
                    width: isMobile ? 28 : 34,
                    height: isMobile ? 28 : 34,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: isDark ? `${cur.color}15` : cur.color + "22",
                    border: `1px solid ${cur.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {DescIconComponent && <DescIconComponent size={isMobile ? 13 : 16} color={cur.color} strokeWidth={2} />}
                  </div>
                <span style={{
                  fontSize: isMobile ? 11.5 : 13.5,
                  color: isDark ? "#E2E8F0" : "#1d2939",
                  fontWeight: 500,
                  lineHeight: 1.6,
                  textAlign: "left"
                }}>{DESCS[active]}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}


      </div>
    </div>
  );
}
