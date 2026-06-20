import React from 'react';
import { LeaderboardRowDto } from '@/types/leaderboard.types';

interface LeaderboardRowProps {
  row: LeaderboardRowDto;
  currentUserId?: string | null;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ row, currentUserId }) => {
  // 1. Divider Row: "Your Position Context" centered separator
  if (row.isDivider) {
    return (
      <div className="w-full flex items-center py-4 my-1 select-none pointer-events-none px-6 bg-white">
        <div className="flex-1 border-t border-dashed border-gray-200" />
        <span className="px-4 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 whitespace-nowrap bg-white">
          Your Position Context
        </span>
        <div className="flex-1 border-t border-dashed border-gray-200" />
      </div>
    );
  }

  // 2. Data Row
  const isCurrentUser = row.isCurrentUser || row.userId === currentUserId;

  // Helper to render the Rank Column with premium badges
  const renderRankBadge = () => {
    const rank = row.rank || 0;
    
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border border-amber-300 text-amber-950 font-black text-[11px] shadow-[0_2px_8px_rgba(245,158,11,0.35)] select-none">
          1
        </div>
      );
    }
    
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 border border-slate-200 text-slate-800 font-extrabold text-[11px] shadow-[0_2px_6px_rgba(148,163,184,0.25)] select-none">
          2
        </div>
      );
    }
    
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 border border-orange-400 text-white font-extrabold text-[11px] shadow-[0_2px_6px_rgba(249,115,22,0.25)] select-none">
          3
        </div>
      );
    }
    
    // Rank 4+ circular badges
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100/90 border border-gray-200/80 text-gray-500 font-bold text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none">
        {rank}
      </div>
    );
  };

  return (
    <div
      className={`w-full grid grid-cols-[100px_1fr_180px] items-center py-3 px-6 border-b border-gray-100/80 transition-all duration-200 cursor-pointer ${
        isCurrentUser
          ? 'bg-orange-50/60 border-l-4 border-l-aws-orange shadow-[0_2px_8px_rgba(255,153,0,0.08)] -translate-y-px z-10 relative border-t border-b border-orange-100'
          : 'bg-white hover:bg-slate-50/50'
      }`}
    >
      {/* Column 1: Visual Rank Badge */}
      <div className="flex items-center">
        {renderRankBadge()}
      </div>

      {/* Column 2: Name + YOU Badge */}
      <div className="text-sm text-slate-700 font-medium truncate flex items-center gap-2">
        <span className="truncate">{row.name}</span>
        {isCurrentUser && (
          <span className="flex-shrink-0 bg-aws-orange text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider leading-none select-none shadow-sm">
            YOU
          </span>
        )}
      </div>

      {/* Column 3: Cloud Credits in Coin Format */}
      <div className="text-right font-semibold text-sm text-slate-800 flex items-center justify-end gap-1.5">
        <img
          src="/cloud-credit-coin.png"
          alt="Cloud Credit Coin"
          className="w-5 h-5 select-none object-contain"
        />
        <span>{row.cloudCredits?.toLocaleString()}</span>
      </div>
    </div>
  );
};
export default LeaderboardRow;
