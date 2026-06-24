"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const DOMAINS = [
  "☁ Cloud Computing",
  "🤖 AI & Machine Learning",
  "⚙ DevOps",
  "🔒 Security",
  "📊 Data Analytics",
  "🚀 Serverless",
  "📦 Containers",
  "💻 Full Stack",
  "🌐 Networking",
  "🔧 MLOps"
];

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section
      ref={ref}
      initial={{ y: 35, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        width: "100%",
        height: "72px",
        background: "linear-gradient(90deg, #FF9900 0%, #FFB020 35%, #FF9900 65%, #E68900 100%)",
        backgroundSize: "200% 200%",
        animation: "gradShift 6s ease infinite",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 40,
        border: "none",
        outline: "none",
      }}
    >
      <div 
        style={{ 
          width: "100%", 
          overflow: "hidden", 
          position: "relative",
          border: "none",
          outline: "none",
        }}
      >
        {/* Dual tracks for infinite marquee scrolling */}
        <div
          className="marquee-track"
          style={{
            display: "flex",
            gap: "14px",
            width: "max-content",
            alignItems: "center",
            padding: "0 12px",
            border: "none",
            outline: "none",
          }}
        >
          {/* Track 1 */}
          <div 
            style={{ 
              display: "flex", 
              gap: "14px", 
              alignItems: "center",
              border: "none",
              outline: "none",
            }}
          >
            {DOMAINS.map((domain, idx) => (
              <React.Fragment key={`stats-t1-frag-${idx}`}>
                <motion.div
                  whileHover={{
                    backgroundColor: "#FFFFFF",
                    color: "#FF9900",
                    borderColor: "#FFFFFF",
                    scale: 1.05,
                    boxShadow: "0 8px 24px rgba(255, 153, 0, 0.25)",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "40px",
                    padding: "10px 22px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                    background: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {domain}
                </motion.div>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.4)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Track 2 (duplicate for seamless loop) */}
          <div 
            style={{ 
              display: "flex", 
              gap: "14px", 
              alignItems: "center",
              border: "none",
              outline: "none",
            }}
          >
            {DOMAINS.map((domain, idx) => (
              <React.Fragment key={`stats-t2-frag-${idx}`}>
                <motion.div
                  whileHover={{
                    backgroundColor: "#FFFFFF",
                    color: "#FF9900",
                    borderColor: "#FFFFFF",
                    scale: 1.05,
                    boxShadow: "0 8px 24px rgba(255, 153, 0, 0.25)",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "40px",
                    padding: "10px 22px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                    background: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {domain}
                </motion.div>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.4)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
