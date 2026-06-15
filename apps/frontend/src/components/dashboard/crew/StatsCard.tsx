"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
}: StatsCardProps) {
  const [iconHovered, setIconHovered] = useState(false);

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-medium text-foreground/60 tracking-wide uppercase">{label}</span>
        <span className="text-3xl font-extrabold text-foreground font-display tracking-tight mt-1">{value}</span>
        <span className="text-xs font-semibold text-foreground/50 mt-1 flex items-center gap-1.5 truncate">{subtext}</span>
      </div>

      {bareIcon ? (
        <div className="relative" onMouseEnter={() => setIconHovered(true)} onMouseLeave={() => setIconHovered(false)}>
          <Icon className={cn("w-20 h-20 transition-transform duration-200", iconClass, iconHovered && "scale-110")} />
          {iconLabel && iconHovered && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-extrabold rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none tracking-wider uppercase z-30">
              {iconLabel}
            </div>
          )}
        </div>
      ) : (
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", iconBgClass)}>
          <Icon className={cn("w-20 h-20", iconClass)} />
        </div>
      )}
    </div>
  );

  const hoverProps = {
    whileHover: { y: -3, boxShadow: "-12px 0 28px rgba(105, 145, 255, 0), 12px 0 28px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(15, 23, 42, 0.10)", borderColor: "rgba(255, 255, 255, 0.4)", transition: { duration: 0.25, ease: "easeOut" as const } },
    whileTap: { scale: 0.98 },
  };

  if (onClick) {
    return (
      <div className="block w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }} onClick={onClick} style={style} className="glass-panel rounded-[22px] overflow-hidden p-6 text-foreground border border-white/25 cursor-pointer select-none transition-all duration-[250ms] ease-out" {...hoverProps}>
          <CardContent />
        </motion.div>
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="block w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }} style={style} className="glass-panel rounded-[22px] overflow-hidden p-6 text-foreground border border-white/25 cursor-pointer select-none transition-all duration-[250ms] ease-out" {...hoverProps}>
          <CardContent />
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }} style={style} className="glass-panel rounded-[22px] overflow-hidden p-6 text-foreground border border-white/20 select-none">
      <CardContent />
    </motion.div>
  );
}
