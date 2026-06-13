"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/certifications", label: "Certifications" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/dev-options", label: "Learning platforms" },
  { href: "/aws-events", label: "AWS Events" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-white text-ink shadow-sm transition-colors hover:bg-paper/60 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff9900,#00a3e0)] text-white shadow-[0_12px_24px_rgba(255,153,0,0.18)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M5 7.5 12 3l7 4.5v9L12 21l-7-4.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8.25 12h7.5M12 8.25v7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-ink sm:text-base lg:text-lg">AWS Certification Explorer</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border/70 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={`border-t border-border/60 bg-white/95 px-4 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.08)] lg:hidden ${open ? "block" : "hidden"}`}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper/60"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}