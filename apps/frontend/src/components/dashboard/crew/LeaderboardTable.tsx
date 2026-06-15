"use client";

import React, { useState, useMemo } from "react";
import { leaderboardUsers } from "@/lib/data/leaderboard";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "rank" | "points";
type SortOrder = "asc" | "desc";

export default function LeaderboardTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = useMemo(() => {
    return leaderboardUsers.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortField, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden flex flex-col">
      <div className="p-5 border-b border-black/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search builders..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 hover:bg-black/[0.08] focus:bg-white focus:ring-2 focus:ring-brand-orange/20 border border-transparent focus:border-brand-orange/45 text-sm text-foreground placeholder-foreground/40 outline-none transition-all"
          />
        </div>
        <div className="text-xs text-foreground/50 font-medium">
          Showing {Math.min(filteredUsers.length, itemsPerPage * currentPage)} of {filteredUsers.length} entries
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-black/[0.02] border-b border-black/5 text-foreground/60 font-semibold select-none">
            <tr>
              <th className="py-4 px-6 text-center w-16">
                <button onClick={() => handleSort("rank")} className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors font-semibold">
                  Rank <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6 text-center">
                <button onClick={() => handleSort("points")} className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors font-semibold">
                  Points <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const isUser = user.isCurrentUser;
                return (
                  <tr key={user.name} className={cn("transition-colors group", isUser ? "bg-brand-orange/5 hover:bg-brand-orange/[0.08]" : "hover:bg-black/[0.01]")}>
                    <td className="py-3.5 px-6 text-center font-bold">
                      <div className="flex items-center justify-center">
                        {user.rank === 1 && <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs shadow-sm">🥇</div>}
                        {user.rank === 2 && <div className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs shadow-sm">🥈</div>}
                        {user.rank === 3 && <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-sm">🥉</div>}
                        {user.rank > 3 && <span className={cn("text-xs", isUser ? "text-brand-orange text-base font-extrabold" : "text-foreground/70")}>#{user.rank}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white", isUser ? "bg-brand-orange" : "bg-brand-teal")}>{user.avatar}</div>
                        <span className={cn(isUser && "text-brand-orange font-bold flex items-center gap-1.5")}>
                          {user.name} {isUser && <Sparkles className="w-3.5 h-3.5 text-brand-orange" />}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center font-extrabold text-foreground font-display">
                      <div className="flex items-center justify-center gap-1">
                        < Trophy className="w-3.5 h-3.5 text-brand-orange/70" />
                        <span>{user.points.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={3} className="py-12 text-center text-foreground/40 font-medium">No builders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-black/5 flex items-center justify-between select-none">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-black/5 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-semibold text-foreground/60">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-black/5 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
