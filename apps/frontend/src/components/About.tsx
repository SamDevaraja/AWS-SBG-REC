"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import JourneyCard from "./JourneyCard";

export default function About() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "#ffffff",
        padding: "60px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: isMobile ? "16px 0" : "40px 0",
          }}
        >
          {/* Main Card: Storytelling & Journey merged */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <motion.div
              whileHover={{ 
                y: -6, 
                boxShadow: "0 30px 60px rgba(35, 47, 62, 0.06), 0 0 0 1.5px rgba(255,153,0,0.12)",
                borderColor: "rgba(255, 153, 0, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "32px",
                border: "1.5px solid rgba(35, 47, 62, 0.08)",
                boxShadow: "0 20px 40px rgba(35, 47, 62, 0.02), inset 0 0 20px rgba(255, 255, 255, 0.6)",
                padding: isMobile ? "24px 16px" : "56px 60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "32px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                width: "100%",
              }}
            >
              {/* Dot Grid Background */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(35, 47, 62, 0.025) 1.2px, transparent 1.2px)",
                backgroundSize: "20px 20px",
                pointerEvents: "none",
                zIndex: 1,
              }} />

              {/* Spotlight Glows */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  left: "-50px",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(0, 115, 187, 0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-50px",
                  right: "-50px",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 153, 0, 0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(35, 47, 62, 0.04)",
                  border: "1px solid rgba(35, 47, 62, 0.08)",
                  borderRadius: "100px",
                  padding: "6px 16px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#232F3E",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Our Mission
                </span>
              </div>

              <h2
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
                  fontWeight: 900,
                  color: "#232F3E",
                  lineHeight: 1.2,
                  margin: 0,
                  letterSpacing: "-0.03em",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                Empowering students to learn, build, and innovate on AWS.
              </h2>

              {/* Text paragraphs stacked vertically */}
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "18px", 
                  position: "relative", 
                  zIndex: 2,
                  width: "100%",
                  maxWidth: "900px",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    color: "#475569",
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  AWS Student Builders Group REC is a student-driven cloud community at Rajalakshmi Engineering College dedicated to learning, building, and innovating with Amazon Web Services. We bring together aspiring developers, cloud enthusiasts, and future technology leaders to explore modern cloud technologies through practical experiences and collaborative learning.
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#475569",
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  By combining technical knowledge with hands-on implementation, we help students transform ideas into real-world solutions while preparing them for the rapidly evolving technology industry.
                </p>
              </div>

              {/* Separator line inside the card */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(35, 47, 62, 0.08), transparent)",
                width: "100%",
                margin: "8px 0",
                position: "relative",
                zIndex: 2,
              }} />

              {/* Journey components */}
              <div style={{ width: "100%", position: "relative", zIndex: 2 }}>
                <JourneyCard plain={true} hideDesc={true} />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Separator line animated left to right */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #FF9900, transparent)",
            width: "100%",
            transformOrigin: "left",
          }}
        />
      </div>
    </section>
  );
}
