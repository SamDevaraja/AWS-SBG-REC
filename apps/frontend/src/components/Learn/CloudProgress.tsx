'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CloudProgressProps {
  pct: number;
  color: 'sky' | 'emerald';
  topicId: string;
}

export const CloudProgress: React.FC<CloudProgressProps> = ({ pct, color }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center px-4 select-none">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</span>
        <span className={cn(
          "text-xs font-extrabold tracking-tight",
          color === 'emerald' ? 'text-emerald-600' : 'text-sky-600'
        )}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200/40 rounded-full overflow-hidden border border-white/10 shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            color === 'emerald' 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              : "bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
export default CloudProgress;
