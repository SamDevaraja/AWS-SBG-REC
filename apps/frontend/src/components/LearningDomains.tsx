"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

const SKILLS = [
  { name: "AI/ML", icon: "🤖", desc: "Build intelligence using AWS Bedrock, SageMaker, and Rekognition." },
  { name: "DevOps", icon: "⚙", desc: "Continuous integration and infrastructure-as-code using AWS CodePipeline and CloudFormation." },
  { name: "Security", icon: "🔒", desc: "IAM access management, VPC firewalls, and encryption via KMS." },
  { name: "Containers", icon: "📦", desc: "Orchestrate microservices with Docker, AWS ECS, EKS, and Fargate." },
  { name: "Serverless", icon: "🚀", desc: "Scalable event-driven apps using AWS Lambda, API Gateway, and DynamoDB." },
  { name: "Data Analytics", icon: "📊", desc: "Query and visualize big data using AWS Athena, Glue, and Redshift." },
  { name: "Networking", icon: "🌐", desc: "Manage DNS with Route 53, CDN caching with CloudFront, and secure VPC gateways." },
  { name: "Cloud Computing", icon: "☁", desc: "Master core AWS EC2 compute instances, S3 object storage, and RDS databases." }
];

export default function LearningDomains() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [rotationOffset, setRotationOffset] = useState(0);

  // Slow continuous rotation when not hovered
  useEffect(() => {
    if (activeIdx !== null) return;
    const interval = setInterval(() => {
      setRotationOffset((prev) => (prev + 0.3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [activeIdx]);

  return (
    <section
      id="domains"
      ref={ref}
      style={{
        width: "100vw",
        background: "#ffffff",
        padding: "72px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        {/* Left Side: Explanatory & Details Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
        >
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
              Curriculum
            </span>
          </div>
          
          <h2
            style={{
              fontSize: "clamp(2rem, 3.8vw, 2.8rem)",
              fontWeight: 900,
              color: "#232F3E",
              lineHeight: 1.15,
              marginBottom: "18px",
              letterSpacing: "-0.01em",
            }}
          >
            Floating Knowledge Sphere
          </h2>
          <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.8, marginBottom: "32px", maxWidth: "420px" }}>
            Hover over any expertise area on the sphere universe to examine core AWS services, syllabus highlights, and real projects.
          </p>

          {/* Active Skill Description Card */}
          <div
            style={{
              width: "100%",
              minHeight: "140px",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(35, 47, 62, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.02), 0 0 0 1px rgba(255,153,0,0.08), 0 0 25px rgba(255,153,0,0.04)",
              transition: "all 0.3s ease",
            }}
          >
            {activeIdx !== null ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.5rem" }}>{SKILLS[activeIdx].icon}</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#FF9900" }}>
                    {SKILLS[activeIdx].name}
                  </span>
                </div>
                <p style={{ fontSize: "13.5px", color: "#4b5563", lineHeight: 1.7, fontWeight: 500 }}>
                  {SKILLS[activeIdx].desc}
                </p>
              </motion.div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: "13px", fontWeight: 600 }}>
                💡 Select a cloud category to view details.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Floating Knowledge Sphere */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Concentric Guide Rings */}
          <div style={{ position: "absolute", width: "360px", height: "360px", borderRadius: "50%", border: "1.5px dashed rgba(35, 47, 62, 0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "220px", height: "220px", borderRadius: "50%", border: "1px dashed rgba(35, 47, 62, 0.06)", pointerEvents: "none" }} />

          {/* Central Sphere (AWS Skills Universe) */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(35px)",
              border: "1.5px solid rgba(0, 115, 187, 0.3)",
              boxShadow: "0 10px 40px rgba(0, 115, 187, 0.15), inset 0 0 20px rgba(0,115,187,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
              textAlign: "center",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "16px", marginBottom: "4px" }}>🌌</div>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#232F3E", lineHeight: 1.2 }}>AWS Skills</div>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#0073BB" }}>Universe</div>
          </motion.div>

          {/* Skills Nodes distributed in circle */}
          <div
            style={{
              position: "absolute",
              width: "360px",
              height: "360px",
              transform: `rotate(${rotationOffset}deg)`,
              transformStyle: "preserve-3d",
              zIndex: 20,
            }}
          >
            {SKILLS.map((skill, idx) => {
              // Calculate angles equally distributed
              const angle = (idx * 360) / SKILLS.length;
              const radius = 180; // half of 360px track

              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                  }}
                >
                  {/* Counter-rotate content so text is horizontal */}
                  <motion.div
                    animate={{ rotate: -rotationOffset }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    whileHover={{
                      scale: 1.15,
                      borderColor: "#FF9900",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      boxShadow: "0 10px 25px rgba(255, 153, 0, 0.12)",
                    }}
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: "-55px",
                      width: "110px",
                      height: "40px",
                      borderRadius: "100px",
                      background: activeIdx === idx ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.55)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "1px solid rgba(35, 47, 62, 0.08)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      padding: "0 10px",
                      transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{skill.icon}</span>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#232F3E", whiteSpace: "nowrap" }}>
                      {skill.name}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
