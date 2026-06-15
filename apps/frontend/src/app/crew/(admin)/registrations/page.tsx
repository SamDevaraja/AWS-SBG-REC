'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegistrations, useEvents } from '@/lib/hooks';
import { Download, Eye, XCircle, ClipboardList } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Pagination } from '@/shared/components/Pagination';
import { SearchInput } from '@/shared/components/SearchInput';
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
                ID
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Attendee
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-36 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-20 rounded-[6px] bg-slate-100 animate-pulse" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
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
        <ClipboardList className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-800 mb-1">No registrations found</h3>
      <p className="text-xs text-slate-500">Try adjusting your search or filters.</p>
    </div>
  );
}

export default function RegistrationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data, isLoading } = useRegistrations({
    page,
    limit: 15,
    search: search || undefined,
    ...(statusFilter && { status: statusFilter }),
    ...(eventFilter && { eventId: eventFilter }),
    ...(dateFrom && { startDate: dateFrom }),
    ...(dateTo && { endDate: dateTo }),
  });

  const registrations = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  function handleExportCsv() {
    const rows = [['ID', 'Name', 'Email', 'Event', 'Date', 'Status']];
    registrations.forEach((r) => {
      rows.push([
        r.id,
        r.name,
        r.email,
        r.event?.title ?? '',
        formatDate(r.registrationDate),
        r.status,
      ]);
    });
    const csv = rows
      .map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Registrations</h1>
          <span className="inline-flex items-center justify-center rounded-[6px] bg-[#232F3E]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#232F3E]">
            {totalCount}
          </span>
        </div>

        {/* Filters & Export */}
        <TableToolbar>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by name or email..."
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
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              placeholder="All Statuses"
            />

            {/* Export */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Date range:</span>
            <DateFilter
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val);
                setPage(1);
              }}
            />
            <span className="text-xs text-slate-400">to</span>
            <DateFilter
              value={dateTo}
              onChange={(val) => {
                setDateTo(val);
                setPage(1);
              }}
            />
          </div>
        </TableToolbar>

        {/* Table */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : registrations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-500 font-mono">
                        {reg.id.length > 8 ? reg.id.slice(0, 8) + '...' : reg.id}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">{reg.name}</td>
                      <td className="px-5 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                        {reg.email}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 max-w-[180px] truncate">
                        {reg.event?.title ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(reg.registrationDate)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/registrations/${reg.id}`}
                            className="p-1.5 rounded-[8px] hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {reg.status !== 'CANCELLED' && (
                            <Link
                              href={`/registrations/${reg.id}?action=cancel`}
                              className="p-1.5 rounded-[8px] hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </Link>
                          )}
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
    </div>
  );
}
