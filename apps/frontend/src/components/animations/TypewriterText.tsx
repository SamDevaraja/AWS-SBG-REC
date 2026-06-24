"use client";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  align?: "center" | "left";
}

const DEFAULT_PHRASES = [
  "Learn Cloud Computing",
  "Build Real Projects",
  "Earn AWS Certifications",
  "Join The Builder Community",
  "Innovate With AWS"
];

export default function TypewriterText({
  phrases = DEFAULT_PHRASES,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  align = "center"
}: TypewriterTextProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(typingSpeed);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activePhrase = phrases[phraseIdx];

    if (isDeleting) {
      // Deleting mode
      timer = setTimeout(() => {
        setDisplayText(activePhrase.substring(0, displayText.length - 1));
        setCurrentSpeed(deletingSpeed);
      }, currentSpeed);
    } else {
      // Typing mode
      timer = setTimeout(() => {
        setDisplayText(activePhrase.substring(0, displayText.length + 1));
        setCurrentSpeed(typingSpeed);
      }, currentSpeed);
    }

    // Phase Transitions
    if (!isDeleting && displayText === activePhrase) {
      // Fully typed: wait before deleting
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && displayText === "") {
      // Fully deleted: switch to next phrase
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
      setCurrentSpeed(300); // short pause before typing next word
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx, phrases, currentSpeed, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : "center",
        height: "58px", // prevents layout shift
        overflow: "hidden",
        width: "100%",
        textAlign: align,
      }}
    >
      <span
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 800,
          backgroundImage: "linear-gradient(90deg, #FF9900, #F7BA45, #FFFFFF)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 2px 10px rgba(255,153,0,0.1)",
          display: "inline-block",
        }}
      >
        {displayText}
      </span>
      <span
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 500,
          color: "#FFFFFF",
          marginLeft: "3px",
          display: "inline-block",
          animation: "blink 0.8s step-end infinite",
        }}
      >
        |
      </span>
    </div>
  );
}
