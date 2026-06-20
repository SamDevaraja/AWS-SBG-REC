'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrewAttendance, useMarkCrewAttendance, useEvents } from '@/lib/hooks';
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
  const [selectedEventId, setSelectedEventId] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: logs, isLoading } = useCrewAttendance({
    search: debouncedSearchQuery || undefined,
  });
  const isSearching = isLoading || searchQuery !== debouncedSearchQuery;

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const markAttendanceMutation = useMarkCrewAttendance();

  function handleMarkAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    if (!selectedEventId) {
      setFeedback({
        type: 'error',
        message: 'Please select an event context first.',
      });
      return;
    }

    setFeedback(null);

    markAttendanceMutation.mutate(
      { ticketCode: ticketCode.trim(), scannerId: 'manual-crew-terminal', eventId: selectedEventId },
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative py-10 px-10 overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.05)_0%,transparent_55%)] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 z-10 relative">
        
        {/* ── Header Card ── */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          {/* Ambient background glow inside the header card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.08)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-3 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Crew · Attendance</span>
              </div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                  Attendance Management
                </h1>
              </div>
              <p className="text-[12px] text-slate-400 font-normal mt-2">
                Log ticket entries manually, search active check-ins, and view volunteer attendance logs.
              </p>
            </div>

            <button
              onClick={() => router.push('/crew/attendance/od-generator?scope=crew')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <Download size={14} />
              Generate OD List
            </button>
          </div>
        </div>

        {/* ── Quick Check-In Form Card ── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,153,0,0.015)_0%,transparent_50%)] pointer-events-none" />
          
          <h2 className="relative z-10 text-sm font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={16} className="text-[#FF9900]" />
            <span>Manual Attendance Entry</span>
          </h2>

          <form onSubmit={handleMarkAttendance} className="relative z-10 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-slate-700 placeholder-slate-400 transition-all cursor-pointer"
                >
                  <option value="">Select Event Context (Required)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Enter Ticket Code (e.g. EVT-EVENTID-TICKET001)..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-slate-700 placeholder-slate-400 font-mono transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={markAttendanceMutation.isPending || !ticketCode.trim() || !selectedEventId}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer self-end md:w-auto w-full"
            >
              {markAttendanceMutation.isPending ? 'Processing...' : 'Mark Attendance'}
            </button>
          </form>

          {feedback && (
            <div className={`relative z-10 p-4 rounded-xl border text-[12.5px] font-medium flex items-start gap-3 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-100/80 text-emerald-800'
                : 'bg-rose-50/70 border-rose-100/80 text-rose-800'
            }`}>
              <span className="mt-0.5 flex-shrink-0">
                {feedback.type === 'success' ? (
                  <CheckCircle size={15} className="text-emerald-500" />
                ) : (
                  <XCircle size={15} className="text-rose-500" />
                )}
              </span>
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* ── Check-in Logs List ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <h2 className="text-[17px] font-bold text-slate-800">Check-in Logs</h2>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12.5px] text-slate-700 placeholder-slate-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {isSearching ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100/70">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 space-y-2.5 animate-pulse">
                  <div className="h-4 w-40 bg-slate-100 rounded" />
                  <div className="h-3 w-64 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="border border-dashed border-slate-200/80 rounded-2xl p-16 text-center bg-white/60 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.025)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-[14px] font-bold text-slate-700 mb-1">No check-in logs found</h3>
                <p className="text-[12px] text-slate-450">Mark manual attendance to see entries here.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,115,187,0.01)_0%,transparent_50%)] pointer-events-none" />
              
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {['Attendee Name', 'Event', 'Ticket Code', 'Checked-in At', 'Checked-in By'].map((h) => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {logs.map((log) => {
                      const attendeeName =
                        log.ticket?.userName ||
                        (log.ticket?.registration?.name
                          ? `${log.ticket.registration.name}`
                          : 'Attendee');
                      const eventTitle = log.ticket?.event?.title || 'Unknown Event';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 transition-all duration-200 group">
                          <td className="px-6 py-4 font-bold text-slate-800 text-[13px]">{attendeeName}</td>
                          <td className="px-6 py-4 text-slate-600 text-[12.5px] font-medium">{eventTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1 text-slate-500 font-medium">
                              {log.ticket?.ticketCode || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            {formatDateTime(log.scannedAt)}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
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
