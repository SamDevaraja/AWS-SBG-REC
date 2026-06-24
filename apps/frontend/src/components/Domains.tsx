"use client";
import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

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

const DOMAIN_DETAILS: Record<string, { icon: string; desc: string }> = {
  "☁ Cloud Computing": { icon: "☁", desc: "Master core AWS EC2 compute instances, S3 object storage, and RDS databases." },
  "🤖 AI & Machine Learning": { icon: "🤖", desc: "Build intelligence using AWS Bedrock, SageMaker, and Rekognition." },
  "⚙ DevOps": { icon: "⚙", desc: "Continuous integration and infrastructure-as-code using AWS CodePipeline and CloudFormation." },
  "🔒 Security": { icon: "🔒", desc: "IAM access management, VPC firewalls, and encryption via KMS." },
  "📊 Data Analytics": { icon: "📊", desc: "Query and visualize big data using AWS Athena, Glue, and Redshift." },
  "🚀 Serverless": { icon: "🚀", desc: "Scalable event-driven apps using AWS Lambda, API Gateway, and DynamoDB." },
  "📦 Containers": { icon: "📦", desc: "Orchestrate microservices with Docker, AWS ECS, EKS, and Fargate." },
  "💻 Full Stack": { icon: "💻", desc: "Build modern full stack web applications deployed and scaled on AWS." },
  "🌐 Networking": { icon: "🌐", desc: "Manage DNS with Route 53, CDN caching with CloudFront, and secure VPC gateways." },
  "🔧 MLOps": { icon: "🔧", desc: "Automate and monitor the end-to-end lifecycle of machine learning models on AWS." }
};

export default function Domains() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  return (
    <motion.section
      ref={ref}
      initial={{ y: 35, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        width: "100%",
        minHeight: activeDomain ? "180px" : "64px",
        background: "linear-gradient(90deg, #002D5A 0%, #003D6B 50%, #002D5A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: activeDomain ? "16px 0" : "0",
        overflow: "hidden",
        position: "relative",
        zIndex: 50,
        border: "none",
        outline: "none",
        transition: "min-height 0.3s ease, padding 0.3s ease",
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
            animationPlayState: activeDomain ? "paused" : "running",
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
            {DOMAINS.map((domain, idx) => {
              const isActive = activeDomain === domain;
              return (
                <React.Fragment key={`t1-frag-${idx}`}>
                  <motion.div
                    onClick={() => setActiveDomain(isActive ? null : domain)}
                    whileHover={{
                      backgroundColor: "rgba(0, 60, 120, 0.92)",
                      color: "#FFFFFF",
                      borderColor: "rgba(255, 153, 0, 0.8)",
                      scale: 1.05,
                      boxShadow: "0 0 24px rgba(255, 153, 0, 0.35)",
                    }}
                    animate={{
                      borderColor: isActive ? "rgba(255, 153, 0, 0.8)" : "rgba(255, 255, 255, 0.55)",
                      backgroundColor: isActive ? "rgba(0, 60, 120, 0.92)" : "rgba(0, 35, 75, 0.6)",
                      scale: isActive ? 1.05 : 1,
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
                      border: "1px solid",
                      boxShadow: "0 4px 16px rgba(0,0,0,.2), 0 0 0 1px rgba(255,255,255,.15), inset 0 1px 0 rgba(255,255,255,.8)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "border-color 0.2s, background-color 0.2s",
                    }}
                  >
                    {domain}
                  </motion.div>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "rgba(0, 30, 60, 0.6)",
                      opacity: 1,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                </React.Fragment>
              );
            })}
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
            {DOMAINS.map((domain, idx) => {
              const isActive = activeDomain === domain;
              return (
                <React.Fragment key={`t2-frag-${idx}`}>
                  <motion.div
                    onClick={() => setActiveDomain(isActive ? null : domain)}
                    whileHover={{
                      backgroundColor: "rgba(0, 60, 120, 0.92)",
                      color: "#FFFFFF",
                      borderColor: "rgba(255, 153, 0, 0.8)",
                      scale: 1.05,
                      boxShadow: "0 0 24px rgba(255, 153, 0, 0.35)",
                    }}
                    animate={{
                      borderColor: isActive ? "rgba(255, 153, 0, 0.8)" : "rgba(255, 255, 255, 0.5)",
                      backgroundColor: isActive ? "rgba(0, 60, 120, 0.92)" : "rgba(0, 45, 90, 0.7)",
                      scale: isActive ? 1.05 : 1,
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
                      border: "1px solid",
                      boxShadow: "0 0 8px rgba(0,0,0,.2)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "border-color 0.2s, background-color 0.2s",
                    }}
                  >
                    {domain}
                  </motion.div>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.35)",
                      opacity: 1,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description Panel (appears below sliding tracks) */}
      <AnimatePresence>
        {activeDomain && DOMAIN_DETAILS[activeDomain] && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              width: "calc(100% - 48px)",
              maxWidth: "800px",
              background: "rgba(0, 35, 75, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 153, 0, 0.2)",
              borderRadius: "16px",
              padding: "14px 20px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>
                {DOMAIN_DETAILS[activeDomain].icon}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#FF9900", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {activeDomain}
                </span>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#E2E8F0", lineHeight: 1.5, fontWeight: 500 }}>
                  {DOMAIN_DETAILS[activeDomain].desc}
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setActiveDomain(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                fontSize: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                borderRadius: "50%",
                transition: "color 0.2s, background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FF9900";
                e.currentTarget.style.backgroundColor = "rgba(255,153,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94A3B8";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
