"use client";

import React, { useState } from "react";
import Link from "next/link";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  iconBgClass?: string;
  bareIcon?: boolean;
  href?: string;
  onClick?: () => void;
  delay?: number;
  style?: React.CSSProperties;
  iconLabel?: string;
  isLucide?: boolean;
}

export default function StatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconClass,
  iconBgClass,
  bareIcon = false,
  href,
  onClick,
  delay = 0,
  style,
  iconLabel,
  isLucide = false,
}: StatsCardProps) {
  const [iconHovered, setIconHovered] = useState(false);

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-foreground/60 tracking-wide uppercase">
          {label}
        </span>
        <span className="text-2xl font-semibold text-foreground font-display tracking-tight">
          {value}
        </span>
        <span className="text-[11px] font-semibold text-foreground/50 flex items-center gap-1.5 truncate">
          {subtext}
        </span>
      </div>

      {isLucide ? (
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0",
          iconBgClass || "bg-brand-orange/10"
        )}>
          <Icon className={cn("w-6 h-6", iconClass || "text-brand-orange")} />
        </div>
      ) : bareIcon ? (
        <div
          className="relative"
          onMouseEnter={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
        >
          <Icon className={cn("w-20 h-20 transition-transform duration-200", iconClass, iconHovered && "scale-110")} />
          {iconLabel && iconHovered && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-semibold rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none tracking-wider uppercase z-30">
              {iconLabel}
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
          iconBgClass
        )}>
          <Icon className={cn("w-20 h-20", iconClass)} />
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div className="block w-full">
        <GlassCard onClick={onClick} delay={delay} style={style} className="!p-5 border border-white/30 cursor-pointer">
          <CardContent />
        </GlassCard>
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="block w-full">
        <GlassCard delay={delay} style={style} className="!p-5 border border-white/30 cursor-pointer">
          <CardContent />
        </GlassCard>
      </Link>
    );
  }

  return (
    <GlassCard delay={delay} style={style} hoverEffect={false} className="!p-5 border border-white/20 select-none">
      <CardContent />
    </GlassCard>
  );
}

