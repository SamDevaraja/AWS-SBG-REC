import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardApiService } from '@/services/leaderboard.api';
import { LeaderboardResponseDto } from '@/types/leaderboard.types';
import { LeaderboardRow } from './LeaderboardRow';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
  apiBaseUrl?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  token,
  apiBaseUrl,
}) => {
  const [data, setData] = useState<LeaderboardResponseDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiService = React.useMemo(() => new LeaderboardApiService(apiBaseUrl), [apiBaseUrl]);

  // Fetch leaderboard data
  const fetchData = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getLeaderboard(search);
      setData(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Load data when modal opens or query changes
  useEffect(() => {
    if (isOpen) {
      fetchData(searchQuery);
    } else {
      // Reset state on close
      setData(null);
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen, searchQuery, fetchData]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute entry counts for "Showing X of Y entries"
  const entriesCount = data
    ? data.displayUsers.filter((u) => !u.isDivider).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* 1. Backdrop Overlay (Layered Blur & Darken) */}
      <div
        className="fixed inset-0 bg-slate-955/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 2. Modal Card Dialog (White/95 backdrop blur, shadow-[0_30px_70px], max-width 900px) */}
      <div
        className="relative w-full max-w-[900px] bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_30px_70px_rgba(0,0,0,0.22)] border border-slate-200/50 flex flex-col z-10 transition-all transform duration-300 scale-100 min-w-0"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Leaderboard
            </h2>
            <img
              src="/aws-trophy.png"
              alt="AWS Trophy"
              className="w-10 h-10 select-none object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-slate-600 transition-colors uppercase tracking-wider select-none"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 flex flex-col gap-6">
          {/* Search Section: Input + Page Count Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:max-w-[340px]">
              <SearchBar onSearch={(val) => setSearchQuery(val)} />
            </div>
            <div className="text-[11px] font-semibold text-gray-400 select-none">
              Showing {entriesCount} of {entriesCount} entries
            </div>
          </div>

          {/* Leaderboard Table Container */}
          <div className="w-full border border-gray-200/80 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm">
            {/* Header Columns (Uppercase, smaller, muted gray) */}
            <div className="w-full grid grid-cols-[100px_1fr_180px] bg-slate-50 border-b border-gray-200 py-3.5 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest select-none">
              <div className="flex items-center gap-1">
                <span>Rank</span>
                <span className="text-[11px] font-normal leading-none -mt-0.5">⇅</span>
              </div>
              <div>Name</div>
              <div className="text-right flex items-center justify-end gap-1">
                <span>Cloud Credits</span>
                <span className="text-[11px] font-normal leading-none -mt-0.5">⇅</span>
              </div>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto max-h-[44vh] divide-y divide-gray-100">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-12 px-6">
                  <span className="text-2xl text-red-500 block mb-2">⚠️</span>
                  <p className="text-sm font-semibold text-gray-700">Failed to connect to leaderboard</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => fetchData(searchQuery)}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200/80 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 transition-all"
                  >
                    Retry
                  </button>
                </div>
              ) : data ? (
                data.displayUsers.length === 0 ? (
                  <EmptyState onClearSearch={() => setSearchQuery('')} />
                ) : (
                  data.displayUsers.map((row, idx) => (
                    <LeaderboardRow
                      key={row.userId || `row-${idx}`}
                      row={row}
                      currentUserId={data.currentUser?.userId}
                    />
                  ))
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaderboardModal;
