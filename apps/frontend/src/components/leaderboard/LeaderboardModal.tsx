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
  apiBaseUrl,
}) => {
  const [data, setData] = useState<LeaderboardResponseDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiService = React.useMemo(() => new LeaderboardApiService(), []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto animate-fade-in">
      {/* 1. Backdrop Overlay (Layered Blur & Darken) */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 2. Modal Card Dialog */}
      <div
        className="relative w-full max-w-[800px] bg-white rounded-[20px] shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] border border-slate-100/80 flex flex-col z-10 min-w-0 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-slate-50/20">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Leaderboard
            </h2>
            <img
              src="/aws-trophy.png"
              alt="AWS Trophy"
              className="w-8 h-8 select-none object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all select-none focus:outline-none"
            aria-label="Close modal"
          >
            {/* Elegant Close Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 flex flex-col gap-6 bg-white">
          {/* Search Section: Input + Page Count Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:max-w-[300px]">
              <SearchBar onSearch={(val) => setSearchQuery(val)} />
            </div>
            <div className="text-xs font-semibold text-slate-400 select-none">
              Showing {entriesCount} of {entriesCount} entries
            </div>
          </div>

          {/* Leaderboard Table Container */}
          <div className="w-full border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-white shadow-[0_2px_12px_rgba(15,23,42,0.015)]">
            {/* Header Columns (Uppercase, smaller, muted gray) */}
            <div className="w-full grid grid-cols-[100px_1fr_180px] bg-slate-50/60 border-b border-slate-100 py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <div className="flex items-center gap-1">
                <span>Rank</span>
              </div>
              <div>Name</div>
              <div className="text-right flex items-center justify-end gap-1">
                <span>Cloud Credits</span>
              </div>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto max-h-[44vh] divide-y divide-slate-100">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-12 px-6">
                  <span className="text-2xl text-red-500 block mb-2">⚠️</span>
                  <p className="text-sm font-semibold text-slate-700">Failed to connect to leaderboard</p>
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
