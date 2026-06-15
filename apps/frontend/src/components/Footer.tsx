"use client";
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
  return (
    <footer
      style={{
        width: "100vw",
        background: "#1e2d3d",
        padding: "72px 0",
        position: "relative",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
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
              <motion.div
                whileHover={{ rotate: -8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                  <rect x="9" y="9" width="18" height="18" rx="2.5" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#ffffff" />
                  <rect x="11" y="4" width="4" height="5" rx="1" fill="#ffffff" />
                  <rect x="27" y="11" width="5" height="3" rx="1" fill="#ffffff" />
                </svg>
              </motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "13px", color: "#ffffff", lineHeight: 1.2 }}>
                  AWS SBG REC
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>
                  Student Builders Group
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)", lineHeight: 1.75, maxWidth: "240px", marginBottom: "20px" }}>
              Empowering the next generation of cloud professionals through community, learning, and innovation.
            </p>

            {/* Social Icons row */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  label: "Instagram",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                },
                {
                  label: "LinkedIn",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                }
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href="#"
                  title={s.label}
                  whileHover={{ backgroundColor: "#FF9900", y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{
                    width: "34px",
                    height: "34px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
                    <path d={s.path} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {COLS.map((col) => (
            <div key={col.h} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <h4
                style={{
                  fontWeight: 800,
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.55)",
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
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "12px",
                    fontWeight: 600,
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
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.25)", fontWeight: 500 }}>
            © 2026 AWS Student Builders Group REC. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            {["Privacy Policy", "Terms of Service"].map((text) => (
              <a
                key={text}
                href="#"
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.25)",
                  textDecoration: "none",
                  fontWeight: 500,
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
