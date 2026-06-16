"use client";
import React from "react";
import { motion } from "framer-motion";

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
  return (
    <motion.section
      initial={{ y: 64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "100%",
        height: "64px",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        color: "black",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 50,
      }}
    >
      <div style={{ width: "100%", overflow: "hidden", position: "relative" }}>
        <div
          className="marquee-track"
          style={{
            display: "flex",
            gap: "14px",
            width: "max-content",
            alignItems: "center",
            padding: "0 12px",
          }}
        >
          {[0, 1].map((track) => (
            <div
              key={track}
              style={{ display: "flex", gap: "14px", alignItems: "center" }}
            >
              {DOMAINS.map((domain, idx) => (
                <React.Fragment key={`t${track}-${idx}`}>
                  <div className="domain-pill">{domain}</div>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.6)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
