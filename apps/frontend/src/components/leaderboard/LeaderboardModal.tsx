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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setCurrentPage(1);
    } else {
      // Reset state on close
      setData(null);
      setSearchQuery('');
      setError(null);
      setCurrentPage(1);
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

  // Compute entry counts and pagination values
  const totalEntries = data ? data.displayUsers.length : 0;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const visibleUsers = data ? data.displayUsers.slice(startIndex, startIndex + itemsPerPage) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* 1. Backdrop Overlay (Layered Blur & Darken) */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 2. Modal Card Dialog with drop-up slide animation */}
      <div
        className="relative w-full max-w-[620px] bg-white rounded-xl shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] border border-slate-100 flex flex-col z-10 min-w-0 overflow-hidden animate-drop-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/20">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Leaderboard
                <img
                  src="/aws-trophy.png"
                  alt="AWS Trophy"
                  className="w-7 h-7 select-none object-contain -mt-0.5"
                />
              </h2>
              <span className="text-[11px] text-slate-400 font-normal">Track your ranks and cloud achievements</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all select-none focus:outline-none"
            aria-label="Close modal"
          >
            {/* Elegant Close Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 bg-white">
          {/* Search Section: Input + Page Count Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:max-w-[300px]">
              <SearchBar onSearch={(val) => setSearchQuery(val)} />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 select-none bg-slate-50/50 hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 transition-colors">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>
                Showing{' '}
                <strong className="text-slate-700 font-semibold">
                  {totalEntries > 0 ? startIndex + 1 : 0}
                </strong>
                -
                <strong className="text-slate-700 font-semibold">{endIndex}</strong> of{' '}
                <strong className="text-slate-700 font-semibold">{totalEntries}</strong> entries
              </span>
            </div>
          </div>

          {/* Leaderboard Table Container */}
          <div className="w-full border border-slate-100 rounded-xl overflow-hidden flex flex-col bg-white shadow-[0_2px_12px_rgba(15,23,42,0.01)]">
            {/* Header Columns (Uppercase, smaller, muted gray) */}
            <div className="w-full grid grid-cols-[75px_1fr_125px] bg-slate-50/50 border-b border-slate-100 py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
              <div className="flex items-center gap-1">
                <span>Rank</span>
              </div>
              <div>Name</div>
              <div className="flex items-center gap-1">
                <span>Cloud Credits</span>
              </div>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto max-h-[44vh] divide-y divide-slate-100/80">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-12 px-6">
                  <span className="text-2xl text-red-500 block mb-2">⚠️</span>
                  <p className="text-sm font-semibold text-slate-700">Failed to connect to leaderboard</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => fetchData(searchQuery)}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200/80 text-gray-600 text-xs font-bold rounded-md border border-gray-200 transition-all"
                  >
                    Retry
                  </button>
                </div>
              ) : data ? (
                visibleUsers.length === 0 ? (
                  <EmptyState onClearSearch={() => setSearchQuery('')} />
                ) : (
                  visibleUsers.map((row, idx) => (
                    <LeaderboardRow
                      key={row.userId || `row-${idx}`}
                      row={row}
                      currentUserId={data.currentUser?.userId}
                    />
                  ))
                )
              ) : null}
            </div>

            {/* Pagination Footer */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/30 select-none">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  Page <strong className="text-slate-700 font-semibold">{currentPage}</strong> of{' '}
                  <strong className="text-slate-700 font-semibold">{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm flex items-center gap-1.5"
                >
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaderboardModal;
