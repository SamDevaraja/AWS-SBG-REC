'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrewAttendance, useMarkCrewAttendance } from '@/lib/hooks';
import { useDebounce } from '@/lib/useDebounce';
import { CheckCircle, XCircle, Search, UserCheck, Calendar, Download } from 'lucide-react';

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CrewAttendancePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: logs, isLoading } = useCrewAttendance({
    search: debouncedSearchQuery || undefined,
  });
  const isSearching = isLoading || searchQuery !== debouncedSearchQuery;

  const markAttendanceMutation = useMarkCrewAttendance();

  function handleMarkAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setFeedback(null);

    markAttendanceMutation.mutate(
      { ticketCode: ticketCode.trim(), scannerId: 'manual-crew-terminal' },
      {
        onSuccess: (res) => {
          if (res.success) {
            const ticket = res.ticket;
            const attendeeName =
              ticket?.userName ||
              (ticket?.registration ? `${ticket.registration.name || 'Attendee'}` : 'Attendee');

            setFeedback({
              type: 'success',
              message: `Successfully checked in: ${attendeeName} (${ticket?.event?.title || 'Event'})`,
            });
            setTicketCode('');
          } else {
            setFeedback({
              type: 'error',
              message: res.status || 'Failed to mark attendance.',
            });
          }
        },
        onError: (err: Error) => {
          setFeedback({
            type: 'error',
            message: err.message || 'An error occurred during check-in.',
          });
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">
              Attendance Management
            </h1>
            <p className="text-sm text-slate-500">
              Log ticket entries manually, search active check-ins, and view attendance logs
            </p>
          </div>
          <button
            onClick={() => router.push('/crew/attendance/od-generator?scope=crew')}
            className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 hover:text-[#FF9900] hover:border-[#FF9900] rounded-[8px] text-xs font-semibold px-4 py-2 shadow-sm transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Generate OD List
          </button>
        </div>

        {/* Quick Check-In Form */}
        <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px] space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-[#232F3E]" /> Manual Attendance Entry
          </h2>

          <form onSubmit={handleMarkAttendance} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter Ticket Code (e.g. EVT-EVENTID-TICKET001)..."
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <button
              type="submit"
              disabled={markAttendanceMutation.isPending || !ticketCode.trim()}
              className="bg-[#232F3E] text-white hover:bg-[#161e27] rounded-[8px] text-xs font-semibold px-5 py-2.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {markAttendanceMutation.isPending ? 'Processing...' : 'Mark Attendance'}
            </button>
          </form>

          {feedback && (
            <div
              className={`p-3.5 rounded-[8px] border text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Attendance Logs List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-800">Check-in Logs</h2>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full border border-slate-200 rounded-[8px] text-sm pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition bg-white"
              />
            </div>
          </div>

          {isSearching ? (
            <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2 animate-pulse">
                  <div className="h-4 w-40 bg-slate-100 rounded" />
                  <div className="h-3 w-64 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="border border-dashed border-slate-355 bg-white rounded-[10px] p-12 text-center text-slate-400">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium">No check-in logs found.</p>
              <p className="text-xs mt-1">Mark attendance to see entries here.</p>
            </div>
          ) : (
            <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                      <th className="px-5 py-3">Attendee Name</th>
                      <th className="px-5 py-3">Event</th>
                      <th className="px-5 py-3">Ticket Code</th>
                      <th className="px-5 py-3">Checked-in At</th>
                      <th className="px-5 py-3">Checked-in By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {logs.map((log) => {
                      const attendeeName =
                        log.ticket?.userName ||
                        (log.ticket?.registration?.name
                          ? `${log.ticket.registration.name}`
                          : 'Attendee');
                      const eventTitle = log.ticket?.event?.title || 'Unknown Event';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3 font-medium text-slate-800">{attendeeName}</td>
                          <td className="px-5 py-3 text-slate-600 text-xs">{eventTitle}</td>
                          <td className="px-5 py-3 text-xs font-mono text-slate-500">
                            {log.ticket?.ticketCode || '—'}
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {formatDateTime(log.scannedAt)}
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">
                            {log.scannerId || 'System'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
