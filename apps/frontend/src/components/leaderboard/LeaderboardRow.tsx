import React from 'react';
import { LeaderboardRowDto } from '@/types/leaderboard.types';

interface LeaderboardRowProps {
  row: LeaderboardRowDto;
  currentUserId?: string | null;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const getAvatarColor = (name?: string) => {
  if (!name) return 'bg-slate-100 text-slate-400 border-slate-200';
  const colors = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-rose-50 text-rose-600 border-rose-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
    'bg-amber-50 text-amber-600 border-amber-100',
    'bg-cyan-50 text-cyan-600 border-cyan-100',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ row, currentUserId }) => {
  // 1. Divider Row: "Your Position Context" centered separator
  if (row.isDivider) {
    return (
      <div className="w-full flex items-center py-4 my-2 select-none pointer-events-none px-6">
        <div className="flex-1 border-t border-dashed border-slate-200" />
        <span className="px-4 text-[9px] uppercase font-bold tracking-[0.25em] text-slate-400 whitespace-nowrap bg-white">
          Your Position Context
        </span>
        <div className="flex-1 border-t border-dashed border-slate-200" />
      </div>
    );
  }

  // 2. Data Row
  const isCurrentUser = row.isCurrentUser || row.userId === currentUserId;
  const rank = row.rank || 0;

  // Helper to render the Rank Column with premium badges
  const renderRankBadge = () => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-black select-none shadow-[0_2px_10px_rgba(245,158,11,0.08)]">
          1st
        </span>
      );
    }
    
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/80 text-xs font-bold select-none">
          2nd
        </span>
      );
    }
    
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700/10 text-amber-700 border border-amber-700/20 text-xs font-bold select-none">
          3rd
        </span>
      );
    }
    
    // Rank 4+ clean design
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 text-slate-400 font-semibold text-xs select-none">
        {rank}
      </span>
    );
  };

  return (
    <div
      className={`w-full grid grid-cols-[100px_1fr_180px] items-center py-3 px-6 transition-all duration-200 group ${
        isCurrentUser
          ? 'bg-amber-500/[0.03] border-l-4 border-l-amber-500 shadow-[inset_1px_0_0_rgba(245,158,11,0.1)]'
          : 'bg-white hover:bg-slate-50/40'
      }`}
    >
      {/* Column 1: Visual Rank Badge */}
      <div className="flex items-center">
        {renderRankBadge()}
      </div>

      {/* Column 2: Avatar + Name + YOU Badge */}
      <div className="text-sm text-slate-700 font-semibold truncate flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(row.name)}`}>
          {getInitials(row.name)}
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-2">
            <span className="truncate text-slate-800">{row.name}</span>
            {isCurrentUser && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/25 select-none uppercase tracking-wider scale-90 origin-left">
                YOU
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-normal">Cloud Enthusiast</span>
        </div>
      </div>

      {/* Column 3: Cloud Credits in Coin Format */}
      <div className="text-right font-bold text-sm text-slate-800 flex items-center justify-end gap-2">
        <img
          src="/cloud-credit-coin.png"
          alt="Cloud Credit Coin"
          className="w-5.5 h-5.5 select-none object-contain drop-shadow-[0_1.5px_3px_rgba(212,163,89,0.2)] transition-transform duration-300 group-hover:scale-110"
        />
        <span className="font-mono text-[13px] text-slate-800">{row.cloudCredits?.toLocaleString()}</span>
      </div>
    </div>
  );
};
export default LeaderboardRow;
