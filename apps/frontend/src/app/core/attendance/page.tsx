'use client';

import { useState } from 'react';
import { useEvents, useAttendance, useVerifyTicket } from '@/lib/hooks';
import { QrCode, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { Ticket } from '@/lib/types';
import { formatDateTime } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Pagination } from '@/shared/components/Pagination';
import { DateFilter } from '@/shared/components/DateFilter';
import { StatusFilter } from '@/shared/components/StatusFilter';
import { TableToolbar } from '@/shared/components/TableToolbar';

function LoadingSkeleton() {
  return (
    <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Attendee Name
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ticket Code
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Scanned At
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Scanner ID
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-16 rounded-[6px] bg-slate-100 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-slate-300 rounded-[10px] p-12 text-center">
      <div className="mx-auto bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <QrCode className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-800 mb-1">No attendance records found</h3>
      <p className="text-xs text-slate-500">Scan a ticket or adjust your filters to see results.</p>
    </div>
  );
}

export default function AttendancePage() {
  const [eventFilter, setEventFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'already_scanned' | 'invalid';
    message: string;
  } | null>(null);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useAttendance({
    page,
    limit: 15,
    ...(eventFilter && { eventId: eventFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
  });

  const tickets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const scannedTickets = tickets.filter((t) => t.scannedAt);
  const attendedTickets = tickets.filter((t) => t.status === 'USED' || t.scannedAt);
  const attendanceRate =
    tickets.length > 0 ? Math.round((attendedTickets.length / tickets.length) * 100) : 0;

  const verifyMutation = useVerifyTicket();

  function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setScanResult(null);
    verifyMutation.mutate(
      { ticketCode: ticketCode.trim(), scannerId: 'admin' },
      {
        onSuccess: (response) => {
          if (response.valid) {
            setScanResult({
              status: 'valid',
              message: response.status || 'Ticket verified successfully!',
            });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({
                status: 'already_scanned',
                message: response.status || 'Ticket has already been scanned.',
              });
            } else {
              setScanResult({
                status: 'invalid',
                message: response.status || 'Invalid ticket code.',
              });
            }
          }
          setTicketCode('');
        },
        onError: () => {
          setScanResult({
            status: 'invalid',
            message: 'Failed to verify ticket. Please try again.',
          });
          setTicketCode('');
        },
      },
    );
  }

  function getAttendeeName(ticket: Ticket): string {
    if (ticket.registration?.user) {
      return `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`;
    }
    return '—';
  }

  function isAttended(ticket: Ticket): boolean {
    return ticket.status === 'USED' || !!ticket.scannedAt;
  }

  const statsCards = [
    { label: 'Total Scanned', value: scannedTickets.length },
    { label: 'Total Attended', value: attendedTickets.length },
    { label: 'Attendance Rate', value: `${attendanceRate}%` },
    {
      label: 'By Event',
      value: events.length > 0 ? `${events.length} events` : '—',
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <span className="inline-flex items-center justify-center rounded-[6px] bg-[#232F3E]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#232F3E]">
            {totalCount}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="border border-slate-200 bg-white p-4 shadow-sm rounded-[10px]"
            >
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
          <button
            onClick={() => {
              setScanModalOpen(true);
              setScanResult(null);
              setTicketCode('');
            }}
            className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan Ticket
          </button>
        </div>

        {/* Filters */}
        <TableToolbar>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <StatusFilter
              value={eventFilter}
              onChange={(val) => {
                setEventFilter(val);
                setPage(1);
              }}
              options={events.map((ev) => ({ value: ev.id, label: ev.title }))}
              placeholder="All Events"
            />

            <DateFilter
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                setPage(1);
              }}
            />

            <StatusFilter
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'attended', label: 'Attended' },
                { value: 'absent', label: 'Absent' },
              ]}
              placeholder="All Status"
            />
          </div>
        </TableToolbar>

        {/* Table */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Attendee Name
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ticket Code
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Scanned At
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Scanner ID
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {getAttendeeName(ticket)}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 max-w-[180px] truncate">
                        {ticket.event?.title ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-slate-700">
                        {ticket.ticketCode}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {ticket.scannedAt ? formatDateTime(ticket.scannedAt) : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {ticket.scannerId ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={isAttended(ticket) ? 'ATTENDED' : 'ABSENT'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>

      {/* Scan Ticket Modal */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setScanModalOpen(false)} />
          <div className="relative bg-white rounded-[10px] shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Scan Ticket</h3>
              <button
                onClick={() => setScanModalOpen(false)}
                className="p-1.5 rounded-[8px] hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScanSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Ticket Code
                  </label>
                  <input
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Enter ticket code..."
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                    autoFocus
                  />
                </div>

                {scanResult && (
                  <div
                    className={`p-3 rounded-[8px] text-sm ${
                      scanResult.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : scanResult.status === 'already_scanned'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {scanResult.status === 'valid' && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      )}
                      {scanResult.status === 'already_scanned' && (
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      )}
                      {scanResult.status === 'invalid' && (
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span>{scanResult.message}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setScanModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-[8px] text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyMutation.isPending || !ticketCode.trim()}
                    className="bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyMutation.isPending ? 'Verifying...' : 'Verify Ticket'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
