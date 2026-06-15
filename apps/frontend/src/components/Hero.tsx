"use client"; // Refresh IDE diagnostics
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import CloudOrbit from "./CloudOrbit";

const ROTATING_TEXTS = [
  { icon: "☁️", text: "Mastering Cloud Computing" },
  { icon: "🚀", text: "Building Real Projects" },
  { icon: "🏆", text: "Earning Certifications" },
  { icon: "🤝", text: "Growing Your Network" },
  { icon: "🎤", text: "Exploring Workshops" },
  { icon: "💡", text: "Competing in Hackathons" },
  { icon: "🌐", text: "Expanding Industry Exposure" },
  { icon: "👨‍🏫", text: "Learning from Mentors" },
  { icon: "🎯", text: "Developing Career Skills" }
];

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Static Layout Only - Removed parallax and magnetic buttons per requirements

  return (
    <section
      id="home"
      style={{
        width: "100vw",
        minHeight: "calc(100vh - 66px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        padding: "40px 0",
      }}
    >
      {/* Static blurred glass particles & soft gradient mesh blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 115, 187, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "45%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(30, 45, 61, 0.02)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Main Container */}
      <motion.div
        whileHover={{
          boxShadow: "0 30px 80px rgba(15,23,42,0.12), inset 0 0 30px rgba(255,255,255,0.8)"
        }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "1300px",
          padding: isMobile ? "32px 24px" : "48px 56px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: isMobile ? "40px" : "40px",
          zIndex: 10,
          background: "linear-gradient(135deg, rgba(255,153,0,0.06), rgba(0,122,255,0.05)), rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.08), inset 0 0 20px rgba(255,255,255,0.4)",
          borderRadius: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft floating gradient blobs inside the glass */}
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
        {/* Left Side: Staggered Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, position: "relative", zIndex: 2 }}
        >


          {/* Large Headline */}
          <motion.h1
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring", stiffness: 150 } }
            }}
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.4rem)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--primary)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            AWS Student<br />Builders Group
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              fontWeight: "var(--font-weight-bold)",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "58px",
              position: "relative",
              width: "100%",
            }}
          >
            <span style={{ fontSize: "1.2em", width: "32px", flexShrink: 0, textAlign: "center" }}>{ROTATING_TEXTS[textIndex].icon}</span>
            <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
              <AnimatePresence>
                <motion.div
                  key={textIndex}
                  initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FF9900, #F7BA45)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 2px 10px rgba(255,153,0,0.1)",
                    }}
                  >
                    {ROTATING_TEXTS[textIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "15px",
              color: "var(--secondary)",
              lineHeight: 1.8,
              marginBottom: "36px",
              maxWidth: "500px",
            }}
          >
            AWS Student Builders Group REC Chapter is a student-led cloud community focused on learning, building, and innovating with AWS. We empower students through hands-on projects, certifications, mentorship, hackathons, workshops, and industry-driven experiences that transform learners into cloud builders.
          </motion.p>


        </motion.div>



        {/* Right Side Cloud Orbit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flex: 1,
            position: "relative",
            zIndex: 2,
          }}
        >
          <CloudOrbit />
        </motion.div>
      </motion.div>
    </section>
  );
}
