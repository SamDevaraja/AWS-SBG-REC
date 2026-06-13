'use client';

import { useState } from 'react';
import { useTickets, useEvents, useRegenerateTicket, useEmailTicket } from '@/lib/hooks';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import { Eye, RefreshCw, Mail, Ticket } from 'lucide-react';
import type { Ticket as TicketType } from '@/lib/types';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Pagination } from '@/shared/components/Pagination';
import { SearchInput } from '@/shared/components/SearchInput';
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
                Code
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Attendee
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-16 rounded-[6px] bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
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
        <Ticket className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-800 mb-1">No tickets found</h3>
      <p className="text-xs text-slate-500">Try adjusting your search or filters.</p>
    </div>
  );
}

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useTickets({
    page,
    limit: 15,
    search: search || undefined,
    ...(statusFilter && { status: statusFilter }),
    ...(eventFilter && { eventId: eventFilter }),
  });

  const tickets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const regenerateMutation = useRegenerateTicket();
  const emailMutation = useEmailTicket();

  function handleRegenerate(ticketId: string) {
    regenerateMutation.mutate(ticketId);
  }

  function handleEmail(ticketId: string) {
    emailMutation.mutate(ticketId);
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Tickets</h1>
          <span className="inline-flex items-center justify-center rounded-[6px] bg-[#232F3E]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#232F3E]">
            {totalCount}
          </span>
        </div>

        {/* Filters */}
        <TableToolbar>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by ticket code or attendee name..."
            />

            {/* Event Filter */}
            <StatusFilter
              value={eventFilter}
              onChange={(val) => {
                setEventFilter(val);
                setPage(1);
              }}
              options={events.map((ev) => ({ value: ev.id, label: ev.title }))}
              placeholder="All Events"
            />

            {/* Status Filter */}
            <StatusFilter
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'USED', label: 'Used' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              placeholder="All Statuses"
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
                      Ticket Code
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-slate-700">
                        {ticket.ticketCode}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 max-w-[180px] truncate">
                        {ticket.event?.title ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {ticket.registration?.user
                          ? `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`
                          : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-1.5 rounded-[8px] hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRegenerate(ticket.id)}
                            disabled={regenerateMutation.isPending}
                            className="p-1.5 rounded-[8px] hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition disabled:opacity-40"
                            title="Regenerate"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEmail(ticket.id)}
                            disabled={emailMutation.isPending}
                            className="p-1.5 rounded-[8px] hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition disabled:opacity-40"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRegenerate={(id) => {
            handleRegenerate(id);
            setSelectedTicket(null);
          }}
          onEmail={(id) => {
            handleEmail(id);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}
