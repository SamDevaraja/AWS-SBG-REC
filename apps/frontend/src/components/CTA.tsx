"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";

export default function CTA() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: false, margin: "-60px" });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yBlob1 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yBlob3 = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const yContent = useTransform(scrollYProgress, [0, 1], [25, -25]);

  // Magnetic Button state
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="community"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 40%, #F0F8FF 100%)",
        padding: "60px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      {/* Orange line draws left->right at very top */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "#FF9900",
              boxShadow: "0 0 20px rgba(255,153,0,0.3)",
              transformOrigin: "left",
              zIndex: 10,
            }}
          />

      {/* Decorative Blobs */}
      <motion.div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,153,0,.22) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          y: isMobile ? 0 : yBlob1,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,115,187,.16) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
          y: isMobile ? 0 : yBlob2,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          x: "-50%",
          y: isMobile ? 0 : yBlob3,
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,68,239,.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        style={{
          width: "100%",
          maxWidth: "640px",
          margin: "0 auto",
          padding: "0 44px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          y: isMobile ? 0 : yContent,
        }}
      >
        {/* Category Tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#FF9900" }}>
            Get Started
          </span>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.3rem)",
            fontWeight: 700,
            color: "#1E293B",
            lineHeight: 1.15,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          Ready to start your{" "}
          <span style={{ color: "#FF9900" }}>cloud journey?</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: 1.8,
            marginBottom: "40px",
            maxWidth: "440px",
          }}
        >
          Join AWS Student Builders Group REC. Connect with mentors, build real applications, and launch your cloud career.
        </motion.p>

        {/* Buttons (Bounce-in entrance) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: [0.8, 1.06, 1] } : {}}
          transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.25 }}
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {/* Magnetic primary button */}
          <motion.button
            whileHover={{ boxShadow: "0 6px 20px rgba(255,153,0,.28)" }}
            style={{ x: sx, y: sy, border: "none", background: "transparent", padding: 0, borderRadius: "100px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.96 }}
          >
            <span
              style={{
                display: "block",
                padding: "13px 28px",
                borderRadius: "100px",
                background: "linear-gradient(135deg, #FF9900 0%, #EC7211 100%)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(255, 153, 0, 0.18)",
                transition: "all 0.2s ease",
              }}
            >
              Join AWS SBG REC →
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.a
            href="#gallery"
            whileHover={{ background: "rgba(255,153,0,.03)", borderColor: "#FF9900", color: "#FF9900", y: -1.5 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "13px 28px",
              borderRadius: "100px",
              border: "1.5px solid rgba(15, 23, 42, 0.12)",
              background: "rgba(255,255,255,.8)",
              backdropFilter: "blur(10px)",
              color: "#334155",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              transition: "all 0.2s ease",
            }}
          >
            Explore Gallery ↓
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
