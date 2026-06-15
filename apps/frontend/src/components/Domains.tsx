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

export default function Domains() {
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
        height: "64px",
        background: "#1A222D",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 50,
        border: "none",
        outline: "none",
        outlineOffset: 0,
      }}
    >
      <div 
        style={{ 
          width: "100%", 
          overflow: "hidden", 
          position: "relative",
          border: "none",
          outline: "none",
          outlineOffset: 0,
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
            outlineOffset: 0,
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
              outlineOffset: 0,
            }}
          >
            {DOMAINS.map((domain, idx) => (
              <React.Fragment key={`t1-frag-${idx}`}>
                <motion.div
                  whileHover={{
                    backgroundColor: "#FF9900",
                    color: "#232F3E",
                    borderColor: "#FF9900",
                    scale: 1.05,
                    boxShadow: "0 4px 16px rgba(255, 153, 0, 0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "42px",
                    padding: "10px 22px",
                    borderRadius: "100px",
                    border: "1.5px solid rgba(255, 255, 255, 0.15)",
                    background: "#232F3E",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "default",
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
                    background: "#FF9900",
                    opacity: 0.6,
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
              outlineOffset: 0,
            }}
          >
            {DOMAINS.map((domain, idx) => (
              <React.Fragment key={`t2-frag-${idx}`}>
                <motion.div
                  whileHover={{
                    backgroundColor: "#FF9900",
                    color: "#232F3E",
                    borderColor: "#FF9900",
                    scale: 1.05,
                    boxShadow: "0 4px 16px rgba(255, 153, 0, 0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "42px",
                    padding: "10px 22px",
                    borderRadius: "100px",
                    border: "1.5px solid rgba(255, 255, 255, 0.15)",
                    background: "#232F3E",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "default",
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
                    background: "#FF9900",
                    opacity: 0.6,
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
