"use client";
import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

export default function CTA() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

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
      <div
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
        }}
      />
      <div
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
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,153,0,.1) 0%, rgba(35,47,62,.04) 30%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
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
        }}
      >
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            fontSize: "clamp(2rem, 4.2vw, 2.8rem)",
            fontWeight: 900,
            color: "#1e2d3d",
            lineHeight: 1.15,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          Ready to start your{" "}
          <span style={{ backgroundImage: "linear-gradient(90deg, #FF9900, #232F3E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>cloud journey?</span>
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
            whileHover={{ boxShadow: "0 20px 50px rgba(255,153,0,.5), 0 0 40px rgba(255,153,0,.2)" }}
            style={{ x: sx, y: sy, border: "none", background: "transparent", padding: 0, borderRadius: "100px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.96 }}
          >
            <span
              style={{
                display: "block",
                padding: "14px 36px",
                borderRadius: "100px",
                background: "linear-gradient(135deg, #FFB020 0%, #FF9900 50%, #E68900 100%)",
                color: "#1e2d3d",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 28px rgba(255,153,0,.4), 0 4px 12px rgba(255,153,0,.25), inset 0 1px 0 rgba(255,255,255,.4)",
                transition: "background 0.2s ease",
              }}
            >
              Join AWS SBG REC →
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.a
            href="#gallery"
            whileHover={{ background: "rgba(255,153,0,.1)", borderColor: "#FF9900", color: "#FF9900", y: -3, boxShadow: "0 12px 28px rgba(255,153,0,.12)" }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "14px 32px",
              borderRadius: "100px",
              border: "1.5px solid rgba(35,47,62,.18)",
              background: "rgba(255,255,255,.8)",
              backdropFilter: "blur(10px)",
              color: "#1e2d3d",
              fontSize: "14px",
              fontWeight: 700,
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
      </div>
    </section>
  );
}
