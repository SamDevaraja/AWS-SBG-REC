"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const COLS = [
  {
    h: "Platform",
    links: [
      { label: "Home", href: "/#home" },
      { label: "About Us", href: "/#about" },
      { label: "Events", href: "/#events" },
      { label: "Gallery", href: "/#gallery" }
    ]
  },
  {
    h: "Resources",
    links: [
      { label: "Our Team", href: "/#team" },
      { label: "Community", href: "/#community" }
    ]
  },
  {
    h: "Connect",
    links: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" }
    ]
  },
];

export default function Footer() {
  const [hov1, setHov1] = useState(false);
  const [hov2, setHov2] = useState(false);
  const [hov3, setHov3] = useState(false);
  return (
    <footer
      style={{
        width: "100vw",
        background: "#161d26",
        borderTop: "2px solid transparent",
        backgroundClip: "padding-box",
        padding: "30px 0",
        position: "relative",
        zIndex: 30,
        overflow: "hidden",
      }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg, #FF9900 0%, rgb(130,68,239) 50%, #0073BB 100%)", zIndex:1 }} />
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Main 4-column Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "40px",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(30,45,61,0.18)", flexShrink: 0 }}>
                <img src="/sbg-logo-latest.png" alt="AWS SBG REC Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#ffffff", lineHeight: 1.2 }}>
                  AWS SBG REC
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                  Student Builders Group
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: "240px", marginBottom: "20px" }}>
              Empowering the next generation of cloud professionals through community, learning, and innovation.
            </p>

            {/* Social Icons row */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/aws_sbg_rec?igsh=MTlqOGl5MGN1dGlybw==",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/aws-sbg-rec/",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                },
                {
                  label: "Meetup",
                  href: "https://www.meetup.com/aws-sbg-at-rajalakshmi-engineering-college",
                  image: "/meetup.svg"
                }
              ].map((s, si) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  onMouseEnter={() => si === 0 ? setHov1(true) : si === 1 ? setHov2(true) : setHov3(true)}
                  onMouseLeave={() => si === 0 ? setHov1(false) : si === 1 ? setHov2(false) : setHov3(false)}
                  whileHover={{ backgroundColor: "#FF9900", y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{
                    width: "34px",
                    height: "34px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {"path" in s ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={si === 0 ? (hov1 ? "#ffffff" : "rgba(255,255,255,0.7)") : si === 1 ? (hov2 ? "#ffffff" : "rgba(255,255,255,0.7)") : (hov3 ? "#ffffff" : "rgba(255,255,255,0.7)")}>
                      <path d={s.path} />
                    </svg>
                  ) : (
                    <img src={s.image} alt={s.label} style={{ width: "16px", height: "16px", filter: "brightness(0) invert(1)" }} />
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {COLS.map((col) => (
            <div key={col.h} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <h4
                style={{
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#ffffff",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {col.h}
              </h4>
              {col.links.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ color: "#FF9900", x: 4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "12px",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom copyright / links section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            © 2026 AWS Student Builders Group REC. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            {["Privacy Policy", "Terms of Service"].map((text) => (
              <a
                key={text}
                href="#"
                onMouseEnter={e => e.currentTarget.style.color = "#FF9900"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                }}
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
