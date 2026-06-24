"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLS = [
  {
    h: "Platform",
    links: [
      { label: "Home", href: "/#home" },
      { label: "About Us", href: "/#about" },
      { label: "Gallery", href: "/#gallery" }
    ]
  },
  {
    h: "Resources",
    links: [
      { label: "Our Team", href: "/#team" },
      { label: "Community", href: "/#about" }
    ]
  },
  {
    h: "Connect",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/aws_sbg_rec/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/aws-sbg-rec/" },
      { label: "WhatsApp", href: "https://chat.whatsapp.com/KSFvYJKRYyB31aL0lZMugK" }
    ]
  },
];

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer
      style={{
        width: "100%",
        background: "#0a0e1a", // Sidebar background color
        padding: isMobile ? "32px 0 24px" : "48px 0 36px",
        position: "relative",
        zIndex: 30,
        overflow: "hidden",
      }}>
      {/* Top accent gradient border line */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "1px", 
          background: "linear-gradient(90deg, transparent, rgba(255, 153, 0, 0.3), rgba(0, 115, 187, 0.2), transparent)", 
          zIndex: 1 
        }} 
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          boxSizing: "border-box",
        }}
      >
        {/* Responsive Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1fr 1fr 1fr",
            gap: isMobile ? "24px" : "48px",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <img 
                  src="/sbg-logo-latest.png" 
                  alt="AWS SBG REC Logo" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "14px", color: "#FFFFFF", lineHeight: 1.2 }}>
                  AWS SBG REC
                </div>
                <div style={{ fontSize: "9.5px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Student Builders Group
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.7, maxWidth: "280px", margin: "0 0 16px 0", fontWeight: 500 }}>
              Empowering the next generation of cloud professionals through community, learning, and innovation.
            </p>

            {/* Social Icons row (sleek circular translucent pills) */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/aws_sbg_rec/",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/aws-sbg-rec/",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                },
                {
                  label: "WhatsApp",
                  href: "https://chat.whatsapp.com/KSFvYJKRYyB31aL0lZMugK",
                  path: "M19.076 4.928A9.904 9.904 0 0 0 12.03 2a9.938 9.938 0 0 0-9.93 9.93c0 1.733.451 3.425 1.31 4.914L2 22l5.312-1.393c1.45.79 3.085 1.206 4.714 1.207h.004a9.932 9.932 0 0 0 9.93-9.93 9.903 9.903 0 0 0-2.884-7.056zm-7.046 15.082h-.003a8.188 8.188 0 0 1-4.173-1.14l-.299-.177-3.102.813.827-3.023-.195-.31a8.18 8.18 0 0 1-1.253-4.364c0-4.52 3.678-8.198 8.201-8.198a8.156 8.156 0 0 1 5.8 2.4 8.156 8.156 0 0 1 2.4 5.8c-.002 4.52-3.68 8.198-8.203 8.198zm4.512-6.164c-.247-.124-1.464-.722-1.692-.804-.227-.082-.393-.124-.558.124-.165.247-.638.804-.783.97-.145.165-.29.185-.537.062a6.756 6.756 0 0 1-1.986-1.223 7.45 7.45 0 0 1-1.373-1.71c-.145-.247-.015-.38.109-.504.112-.11.247-.29.371-.433.124-.144.165-.247.248-.413.082-.165.041-.31-.02-.433-.062-.124-.558-1.343-.765-1.838-.2-.486-.403-.42-.558-.427h-.475c-.165 0-.434.062-.66.31-.227.247-.867.846-.867 2.064s.888 2.395 1.011 2.56c.124.165 1.745 2.665 4.228 3.733.59.255 1.05.407 1.41.52.593.189 1.133.162 1.56.098.475-.072 1.464-.598 1.67-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.165-.474-.289z"
                }
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, backgroundColor: "rgba(255, 153, 0, 0.15)", borderColor: "rgba(255, 153, 0, 0.3)", color: "#FF9900" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    color: "#94A3B8"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                  color: "#FFFFFF",
                  marginBottom: "10px",
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
                  target={col.h === "Connect" ? "_blank" : undefined}
                  rel={col.h === "Connect" ? "noopener noreferrer" : undefined}
                  whileHover={{ color: "#FF9900", x: 4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{
                    display: "block",
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500, textAlign: "center" }}>
            © 2026 AWS Student Builders Group REC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
