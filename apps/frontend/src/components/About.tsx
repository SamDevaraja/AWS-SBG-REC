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
        background: "linear-gradient(160deg,#FFFDF9 0%,#FFFFFF 40%,#F5FAFF 100%)",
        padding: "60px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
        zIndex: 2,
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <motion.div
              whileHover={{ 
                y: -8, 
                boxShadow: "0 40px 80px rgba(35,47,62,.08), 0 0 0 2px rgba(255,153,0,.18), 0 0 30px rgba(255,153,0,.12), 0 12px 40px rgba(255,153,0,.06)",
                borderColor: "rgba(255,153,0,.25)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,1) 0%,rgba(255,255,255,.95) 40%,rgba(255,249,240,.88) 70%,rgba(245,250,255,.85) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "32px",
                border: "1px solid rgba(255,255,255,.98)",
                boxShadow: "0 0 0 1px rgba(255,153,0,.08), 0 4px 24px rgba(255,153,0,.06), 0 24px 64px rgba(35,47,62,.04), 0 8px 30px rgba(255,153,0,.03), inset 0 1px 0 rgba(255,255,255,1)",
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

              {/* Enhanced spotlight glows */}
              <div
                style={{
                  position: "absolute",
                  top: "-100px",
                  left: "-100px",
                  width: "450px",
                  height: "450px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,153,0,.12) 0%, rgba(255,153,0,.05) 30%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                  filter: "blur(40px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-100px",
                  right: "-100px",
                  width: "450px",
                  height: "450px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 153, 0, 0.22) 0%, rgba(255, 153, 0, 0.08) 30%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                  filter: "blur(40px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(35,47,62,.04) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 1,
                  filter: "blur(40px)",
                }}
              />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg,rgba(255,153,0,.12),rgba(255,153,0,.05))",
                  border: "1px solid rgba(255,153,0,.22)",
                  borderRadius: "100px",
                  padding: "6px 16px",
                  position: "relative",
                  zIndex: 2,
                  boxShadow: "0 0 12px rgba(255,153,0,.08), inset 0 1px 0 rgba(255,255,255,.8)",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#FF9900",
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
                  textAlign: "center",
                  width: "100%",
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
                  textAlign: "center",
                  margin: "24px auto 0 auto",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    color: "#475569",
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 500,
                    textAlign: "center",
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
                    textAlign: "center",
                  }}
                >
                  By combining technical knowledge with hands-on implementation, we help students transform ideas into real-world solutions while preparing them for the rapidly evolving technology industry.
                </p>
              </div>

              {/* Separator line inside the card */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,153,0,.18), rgba(0,115,187,.12), transparent)",
                width: "100%",
                margin: "16px 0",
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
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #FF9900 25%, #232F3E 50%, #0073BB 75%, transparent)",
            width: "100%",
            transformOrigin: "left",
          }}
        />
      </div>
    </section>
  );
}
