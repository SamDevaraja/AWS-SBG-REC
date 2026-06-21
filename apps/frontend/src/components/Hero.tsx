"use client";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Framer Motion scroll-driven parallax setup
  const { scrollY } = useScroll();

  // Scroll translations for background blobs (only on desktop >= 1024px)
  const yBg1 = useTransform(scrollY, [0, 1000], [0, 160]);
  const yBg2 = useTransform(scrollY, [0, 1000], [0, -120]);
  const yBg3 = useTransform(scrollY, [0, 1000], [0, 80]);
  const yBg4 = useTransform(scrollY, [0, 1000], [0, -60]);

  // Staggered column parallax
  const yText = useTransform(scrollY, [0, 1000], [0, 50]);

  return (
    <section
      id="home"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        padding: "0",
      }}
    >
      {/* Spacer for navbar */}
      <div style={{ flexShrink: 0, height: "80px" }} />

      {/* Hero banner — vertically centred in remaining space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "40px 0",
        }}
      >
      {/* Parallax blurred glass particles & soft gradient mesh blobs */}
      <motion.div
        style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 95% 5%, rgba(255,153,0,.26) 0%, rgba(255,153,0,.12) 35%, rgba(255,255,255,0) 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          y: isMobile ? 0 : yBg1,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,115,187,.14) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
          y: isMobile ? 0 : yBg2,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          top: "30%",
          right: "30%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,68,239,.12) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
          y: isMobile ? 0 : yBg3,
        }}
      />
      <motion.div
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
          y: isMobile ? 0 : yBg4,
        }}
      />

      {/* Main Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "20px 24px" : "20px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          position: "relative",
        }}
      >
        {/* Centered Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            textAlign: "center",
            maxWidth: "800px",
            width: "100%",
            position: "relative", 
            zIndex: 2,
            y: isMobile ? 0 : yText,
          }}
        >
          {/* Large Headline */}
          <motion.h1
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring", stiffness: 150 } }
            }}
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.4rem)",
              fontWeight: 700,
              color: "#232F3E",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            AWS Student Builders Group
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)",
              fontWeight: 500,
              color: "#FF9900",
              marginBottom: "24px",
            }}
          >
            Empowering the Next Generation of Cloud Builders
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "15px",
              color: "#475569",
              lineHeight: 1.8,
              marginBottom: "28px",
              maxWidth: "680px",
              margin: "0 auto 28px auto",
              textAlign: "center",
            }}
          >
            AWS Student Builders Group REC Chapter is a student-led cloud community focused on learning, building, and innovating with AWS. We empower students through hands-on projects, certifications, mentorship, hackathons, workshops, and industry-driven experiences that transform learners into cloud builders.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.25 } }
            }}
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => router.push("/signup")}
              style={{
                padding: "13px 28px",
                borderRadius: "100px",
                border: "none",
                background: "linear-gradient(135deg, #FF9900 0%, #EC7211 100%)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255, 153, 0, 0.18)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1.5px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 153, 0, 0.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255, 153, 0, 0.18)"; }}
            >
              Get Started &rarr;
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("gallery");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "13px 28px",
                borderRadius: "100px",
                border: "1.5px solid rgba(15, 23, 42, 0.12)",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                color: "#334155",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF9900"; e.currentTarget.style.color = "#FF9900"; e.currentTarget.style.background = "rgba(255, 153, 0, 0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.12)"; e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; }}
            >
              Explore Gallery &darr;
            </button>
          </motion.div>
        </motion.div>
      </div>
      </div>

      {/* Domains marquee — pinned to bottom */}
      <div style={{ flexShrink: 0, paddingTop: "24px", paddingBottom: "32px" }}>
        <DomainsInline />
      </div>
    </section>
  );
}

/* ── Inline Domains (self-contained) ────────────────────────────── */
function DomainsInline() {
  const DOMAINS = [
    "AI & Machine Learning",
    "DevOps",
    "Security",
    "Data Analytics",
    "Serverless",
    "Containers",
    "Full Stack",
    "Networking",
    "MLOps",
    "Cloud Computing",
    "Infrastructure",
    "IoT"
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        padding: "0 24px",
      }}
    >
      {DOMAINS.map((label, i) => (
        <div
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            borderRadius: "100px",
            border: "1.5px solid rgba(15, 23, 42, 0.06)",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "#475569",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
