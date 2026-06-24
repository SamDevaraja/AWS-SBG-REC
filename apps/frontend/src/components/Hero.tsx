"use client";
import { useState, useEffect } from "react";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="home"
      style={{
        width: "100vw",
        minHeight: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        position: "relative",
        overflow: "hidden",
        padding: isMobile ? "60px 12px 0px" : "72px 24px 0px",
        zIndex: 2,
      }}
    >
      {/* Main Responsive Image Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          aspectRatio: "1024/599",
          backgroundImage: "url('/new-hero-bg-v3.png')",
          backgroundSize: "contain",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          position: "relative",
          zIndex: 10,
        }}
      >

        {/* Visually Hidden SEO Content (Screen Readers Only) */}
        <div
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            border: "0",
          }}
        >
          <h1>BUILD. LEARN. INNOVATE. WITH AWS</h1>
          <p>
            Join AWS Student Builder Group to build cloud skills, work on real-world projects, and grow with the community.
          </p>
          <ul>
            <li>Learn Cloud Skills</li>
            <li>Build Real Projects</li>
            <li>Connect With Peers</li>
            <li>Grow Together</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
