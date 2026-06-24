"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG Components for each stage
const CompassIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const BookOpenIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const WrenchIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const AwardIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const TrophyIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
  </svg>
);

const STAGE_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Register: CompassIcon,
  Learn: BookOpenIcon,
  Certify: AwardIcon,
  Lead: TrophyIcon,
  Share: WrenchIcon,
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
          {/* Progress bar background line */}
          <div style={{
            position: "absolute",
            top: isMobile ? 18 : 24, // perfectly centered for 36px/48px height
            left: isMobile ? "30px" : "50px",
            right: isMobile ? "30px" : "50px",
            height: 2,
            background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(35, 47, 62, 0.08)",
            borderRadius: 2,
            zIndex: 1
          }} />
          
          {/* Active progress bar line fill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: active / (STAGES.length - 1) }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              top: isMobile ? 18 : 24,
              left: isMobile ? "30px" : "50px",
              width: `calc(100% - ${isMobile ? '60px' : '100px'})`,
              height: 2,
              background: "#FF9900",
              transformOrigin: "left",
              borderRadius: 2,
              zIndex: 2
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
                nodeBg = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)";
                nodeBorder = `2px solid ${st.color}`;
              } else {
                nodeBg = isDark ? "rgba(255, 255, 255, 0.03)" : "#ffffff";
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
                      {IconComponent && <IconComponent size={isMobile ? 14 : 20} color={iconColor} />}
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
                    {DescIconComponent && <DescIconComponent size={isMobile ? 13 : 16} color={cur.color} />}
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
