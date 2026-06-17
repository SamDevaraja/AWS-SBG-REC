'use client';

import { useState } from 'react';
import { useSearchCrewRegistrations } from '@/lib/hooks';
import { useDebounce } from '@/lib/useDebounce';
import { Search, Calendar, Mail, ShieldAlert } from 'lucide-react';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function RegistrationVerificationPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useSearchCrewRegistrations(debouncedQuery);
  const isSearching = isLoading || query !== debouncedQuery;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">
            Registration Verification
          </h1>
          <p className="text-sm text-slate-500">
            Verify attendee registration details using Name, Email, Roll Number, or Ticket Code
          </p>
        </div>

        {/* Search Input Card */}
        <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Name, Email, Roll Number, or Ticket Code..."
              className="w-full border border-slate-200 rounded-[8px] text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          {isSearching ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 bg-white rounded-[10px] p-5 animate-pulse space-y-2.5"
                >
                  <div className="h-4.5 w-1/3 bg-slate-100 rounded" />
                  <div className="h-3.5 w-2/3 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : !query.trim() ? (
            <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="border border-dashed border-slate-300 rounded-[10px] p-12 text-center text-slate-400">
              <Search className="h-10 w-10 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-medium">Search query required</p>
              <p className="text-xs mt-1">
                Enter search criteria above to scan and verify database records.
              </p>
            </div>
          ) : !results || results.length === 0 ? (
            <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="border border-dashed border-rose-200 rounded-[10px] p-12 text-center text-slate-400">
              <ShieldAlert className="h-10 w-10 text-rose-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-rose-800">No matching registrations found</p>
              <p className="text-xs mt-1">
                Double check name spelling, roll number formatting, or email inputs.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((reg) => {
                const attendeeName =
                  reg.name ||
                  (reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : 'Attendee');
                const email = reg.email || reg.user?.email || '—';

                return (
                  <div
                    key={reg.id}
                    className="border border-slate-200 bg-white p-5 rounded-[10px] shadow-sm flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">{attendeeName}</h3>
                          <div className="flex items-center gap-1 text-[11px] text-slate-450 mt-0.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{email}</span>
                          </div>
                        </div>
                        <span
                          className={`inline-block border rounded-[6px] px-2 py-0.5 text-[9px] font-semibold uppercase ${statusBadge(
                            reg.status,
                          )}`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <span className="font-medium text-slate-450">Event:</span>
                          <span className="font-semibold text-slate-800">
                            {reg.event?.title || '—'}
                          </span>
                        </div>
                        {reg.roll_number && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-450">Roll No:</span>
                            <span className="font-mono text-slate-700">{reg.roll_number}</span>
                          </div>
                        )}
                        {reg.ticket?.ticketCode && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-450">Ticket Code:</span>
                            <span className="font-mono text-[#232F3E] bg-[#232F3E]/5 px-1.5 py-0.5 rounded font-semibold">
                              {reg.ticket.ticketCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-4">
                      <Calendar className="h-3 w-3" />
                      <span>Registered: {formatDate(reg.registrationDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
