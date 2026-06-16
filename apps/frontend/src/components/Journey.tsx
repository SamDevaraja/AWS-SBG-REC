"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const MILESTONES = [
  { label: "Beginner", icon: "🌱", sub: "Cloud Basics", color: "#38b2ac" },
  { label: "Learner", icon: "📚", sub: "AWS Core", color: "#0073BB" },
  { label: "Builder", icon: "🛠", sub: "Real Projects", color: "#FF9900" },
  { label: "Certified", icon: "🏅", sub: "AWS Badges", color: "#232F3E" },
  { label: "Community Lead", icon: "🚀", sub: "Mentorship", color: "#FF9900" },
  { label: "Cloud Architect", icon: "☁", sub: "Career Launch", color: "#E68900" }
];

const DESCS = [
  "Learn fundamentals, setup billing alerts, and configure your first AWS IAM user.",
  "Deep dive into EC2, S3, RDS, and VPC architectures with guided study pathways.",
  "Participate in SBG Hackathons. Build serverless web apps using Lambda and DynamoDB.",
  "Prepped with Quiz Arena testing. Clear the AWS Certified Cloud Practitioner / SAA exams.",
  "Mentor junior peers, lead developer bootcamps, and direct team projects.",
  "Secure your dream cloud engineering role or build a serverless tech startup."
];

export default function Journey() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section
      id="journey"
      ref={ref}
      style={{
        width: "100vw",
        background: "#F8F9FA",
        padding: "72px 0",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(35, 47, 62, 0.04)",
        borderBottom: "1px solid rgba(35, 47, 62, 0.04)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(35, 47, 62, 0.04)",
              border: "1px solid rgba(35, 47, 62, 0.08)",
              borderRadius: "100px",
              padding: "5px 14px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#232F3E",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Roadmap
            </span>
          </div>
          
          <h2
            style={{
              fontSize: "clamp(2rem, 3.8vw, 2.8rem)",
              fontWeight: 900,
              color: "#232F3E",
              lineHeight: 1.15,
              marginBottom: "12px",
              letterSpacing: "-0.01em",
            }}
          >
            Community Journey
          </h2>
          <p style={{ fontSize: "14px", color: "#4b5563", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
            Follow our structured cloud pathway, earning certifications and deployment milestones as you go.
          </p>
        </div>

        {/* Roadmap Display */}
        <div style={{ position: "relative", width: "100%", padding: "40px 0" }}>
          {/* Animated SVG Path Line (Draws itself on scroll) */}
          <svg
            style={{
              position: "absolute",
              top: "60px",
              left: 0,
              width: "100%",
              height: "12px",
              overflow: "visible",
              zIndex: 0,
            }}
          >
            {/* Background track */}
            <line x1="5%" y1="6" x2="95%" y2="6" stroke="rgba(35, 47, 62, 0.06)" strokeWidth="4" strokeLinecap="round" />
            
            {/* Self-drawing line */}
            <motion.line
              x1="5%"
              y1="6"
              x2="95%"
              y2="6"
              stroke="#0073BB"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.8, ease: "easeOut" }}
            />

            {/* Traveling Progress Light */}
            <motion.line
              x1="5%"
              y1="6"
              x2="95%"
              y2="6"
              stroke="#FF9900"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="16 48"
              animate={inView ? { strokeDashoffset: [0, -120] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Milestone Nodes */}
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 10 }}>
            {MILESTONES.map((ms, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    width: "14%",
                  }}
                >
                  {/* Circle Node with Pulse */}
                  <div style={{ position: "relative", width: "40px", height: "40px", marginBottom: "14px" }}>
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        style={{
                          position: "absolute",
                          inset: "-8px",
                          borderRadius: "50%",
                          background: `${ms.color}22`,
                          border: `1.5px solid ${ms.color}`,
                          zIndex: 0,
                        }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: isActive ? ms.color : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        border: `2px solid ${isActive ? ms.color : "rgba(35, 47, 62, 0.12)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        boxShadow: isActive ? `0 6px 16px ${ms.color}35` : "0 4px 10px rgba(0,0,0,0.03)",
                        transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
                        zIndex: 10,
                      }}
                    >
                      <span style={{ color: isActive ? "#ffffff" : "#232F3E" }}>{ms.icon}</span>
                    </motion.div>
                  </div>

                  {/* Labels */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 900, color: isActive ? ms.color : "#232F3E" }}>
                      {ms.label}
                    </div>
                    <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 700, marginTop: "2px" }}>
                      {ms.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description Panel */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(35, 47, 62, 0.08)",
            borderRadius: "20px",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02), 0 0 0 1px rgba(255,153,0,0.08), 0 0 25px rgba(255,153,0,0.04)",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: `${MILESTONES[activeIdx].color}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
            }}
          >
            {MILESTONES[activeIdx].icon}
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: MILESTONES[activeIdx].color, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {MILESTONES[activeIdx].label} Milestone
            </h4>
            <p style={{ fontSize: "13.5px", color: "#4b5563", lineHeight: 1.6, marginTop: "4px", fontWeight: 500 }}>
              {DESCS[activeIdx]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
