"use client";

import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Trophy, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";

type SortField = "rank" | "points";
type SortOrder = "asc" | "desc";

export default function LeaderboardTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers: any[] = [];
  const paginatedUsers: any[] = [];
  const totalPages = 1;

  const handleSort = (field: SortField) => {};
  const handlePrevPage = () => {};
  const handleNextPage = () => {};

  return (
    <GlassCard className="border border-white/20 p-0 overflow-hidden flex flex-col" hoverEffect={false}>
      {/* Top Search & Filter controls */}
      <div className="p-5 border-b border-black/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search builders or badges..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 hover:bg-black/[0.08] focus:bg-white focus:ring-2 focus:ring-brand-orange/20 border border-transparent focus:border-brand-orange/45 text-sm text-foreground placeholder-foreground/40 outline-none transition-all"
          />
        </div>

        <div className="text-xs text-foreground/50 font-medium">
          Showing {Math.min(filteredUsers.length, itemsPerPage * currentPage)} of {filteredUsers.length} entries
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          {/* Sticky Header */}
          <thead className="sticky top-0 bg-black/[0.02] border-b border-black/5 text-foreground/60 font-semibold select-none">
            <tr>
              <th className="py-4 px-6 text-center w-16">
                <button
                  onClick={() => handleSort("rank")}
                  className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors font-semibold"
                >
                  Rank
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6 text-center">
                <button
                  onClick={() => handleSort("points")}
                  className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors font-semibold"
                >
                  Points
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-black/[0.04]">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const isUser = user.isCurrentUser;

                return (
                  <tr
                    key={user.name}
                    className={cn(
                      "transition-colors group",
                      isUser
                        ? "bg-brand-orange/5 hover:bg-brand-orange/[0.08]"
                        : "hover:bg-black/[0.01]"
                    )}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-6 text-center font-medium">
                      <div className="flex items-center justify-center">
                        {user.rank === 1 && (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs shadow-sm">
                            🥇
                          </div>
                        )}
                        {user.rank === 2 && (
                          <div className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs shadow-sm">
                            🥈
                          </div>
                        )}
                        {user.rank === 3 && (
                          <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-sm">
                            🥉
                          </div>
                        )}
                        {user.rank > 3 && (
                          <span className={cn(
                            "text-xs",
                            isUser ? "text-brand-orange text-base font-semibold" : "text-foreground/70"
                          )}>
                            #{user.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-6 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs text-white",
                          isUser ? "bg-brand-orange" : "bg-brand-teal"
                        )}>
                          {user.avatar}
                        </div>
                        <span className={cn(isUser && "text-brand-orange font-medium flex items-center gap-1.5")}>
                          {user.name}
                          {isUser && <Sparkles className="w-3.5 h-3.5 text-brand-orange" />}
                        </span>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-6 text-center font-semibold text-foreground font-display">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-brand-orange/70" />
                        <span>{user.points.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-foreground/40 font-medium">
                  No builders match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-black/5 flex items-center justify-between select-none">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5 text-xs font-semibold text-foreground/70"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-semibold text-foreground/60">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5 text-xs font-semibold text-foreground/70"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </GlassCard>
  );
}

