'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegistrations, useEvents } from '@/lib/hooks';
import {
  Download, Eye, XCircle, ClipboardList,
  Search, ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(35,47,62,0.08)',
        boxShadow: '0 20px 40px rgba(35,47,62,0.04)',
        overflow: 'hidden',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
              {['ID', 'Attendee', 'Email', 'Event', 'Date', 'Status', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(35,47,62,0.04)' }}>
                {[20, 28, 36, 32, 24, 20, 16].map((w, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-3 rounded-full animate-pulse" style={{ width: `${w * 4}px`, background: 'rgba(35,47,62,0.06)' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1.5px dashed rgba(35,47,62,0.12)',
        padding: '64px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          margin: '0 auto 20px',
          width: '56px', height: '56px',
          borderRadius: '16px',
          background: 'rgba(35,47,62,0.05)',
          border: '1px solid rgba(35,47,62,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ClipboardList style={{ width: 24, height: 24, color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#232F3E', marginBottom: '6px' }}>No registrations found</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8' }}>Try adjusting your search or filter criteria.</p>
    </div>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [
    { bg: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#fff' },
    { bg: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff' },
    { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' },
    { bg: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff' },
    { bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff' },
    { bg: 'linear-gradient(135deg,#0073BB,#005d96)', color: '#fff' },
  ];
  const p = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: '50%',
        background: p.bg, color: p.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 800, flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({
  label, value, icon: Icon, accent,
}: { label: string; value: number | string; icon: React.ElementType; accent: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1.5px solid rgba(35,47,62,0.08)',
        boxShadow: '0 8px 24px rgba(35,47,62,0.05)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'relative' as const,
        overflow: 'hidden',
      }}
    >
      {/* corner glow */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: accent, filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.06)', position: 'relative', zIndex: 1 }}>
        <Icon style={{ width: 18, height: 18, color: '#232F3E' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '24px', fontWeight: 900, color: '#232F3E', lineHeight: 1, margin: 0 }}>{value}</p>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.07em', margin: '4px 0 0' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Pill Label ──────────────────────────────────────────────────────── */
function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, rgba(255,153,0,0.07), rgba(35,47,62,0.04))',
        border: '1px solid rgba(255,153,0,0.25)',
        borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: '14px',
        boxShadow: '0 2px 12px rgba(255,153,0,0.08)',
      }}
    >
      {/* Orange dot */}
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF9900, #F7BA45)',
        flexShrink: 0,
        boxShadow: '0 0 6px rgba(255,153,0,0.5)',
        display: 'inline-block',
      }} />
      <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
        {children}
      </span>
    </div>
  );
}


/* ─── Main Page ──────────────────────────────────────────────────────── */
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
      rows.push([r.id, r.name, r.email, r.event?.title ?? '', formatDate(r.registrationDate), r.status]);
    });
    const csv = rows.map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registrations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasActiveFilter = search || statusFilter || eventFilter || dateFrom || dateTo;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>

      {/* ── Background ambient blobs (matches landing page) ── */}
      <div style={{ position: 'fixed', top: '10%', right: '12%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,115,187,0.05) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <SectionPill>Admin · Registrations</SectionPill>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                Registrations
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(35,47,62,0.07)', border: '1px solid rgba(35,47,62,0.1)',
                borderRadius: '100px', padding: '3px 12px',
                fontSize: '12px', fontWeight: 800, color: '#232F3E',
              }}>
                {totalCount}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: 8, marginLeft: 1 }}>
              Manage and monitor all event registrations
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#232F3E', color: '#ffffff',
              borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(35,47,62,0.2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FF9900'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#232F3E'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
          >
            <Download style={{ width: 15, height: 15 }} />
            Export CSV
          </button>
        </div>

        {/* Orange divider (like landing page section separators) */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginBottom: 28, borderRadius: 2 }} />


        {/* ── Filters Card ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(35,47,62,0.08)',
            boxShadow: '0 8px 32px rgba(35,47,62,0.05)',
            padding: '20px 24px',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* dot grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>

              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 220px' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px',
                    fontSize: '13px', color: '#232F3E',
                    paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.12)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Event Filter */}
              <div style={{ position: 'relative' }}>
                <Filter style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
                <select
                  value={eventFilter}
                  onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                  style={{
                    appearance: 'none', background: 'rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px',
                    fontSize: '13px', color: '#232F3E',
                    paddingLeft: 30, paddingRight: 30, paddingTop: 10, paddingBottom: 10,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">All Events</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
              </div>

              {/* Status Filter */}
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  style={{
                    appearance: 'none', background: 'rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px',
                    fontSize: '13px', color: '#232F3E',
                    paddingLeft: 14, paddingRight: 30, paddingTop: 10, paddingBottom: 10,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Date Range + Clear */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                <Calendar style={{ width: 13, height: 13 }} />
                Date range
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px',
                  fontSize: '13px', color: '#232F3E', padding: '8px 12px', outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; }}
              />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px',
                  fontSize: '13px', color: '#232F3E', padding: '8px 12px', outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; }}
              />
              {hasActiveFilter && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                  style={{ fontSize: '12px', fontWeight: 700, color: '#FF9900', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : registrations.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(35,47,62,0.08)',
              boxShadow: '0 20px 40px rgba(35,47,62,0.06)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* dot grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0 }} />
            <div className="overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
                    {['ID', 'Attendee', 'Email', 'Event', 'Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="group"
                      style={{ borderBottom: '1px solid rgba(35,47,62,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,153,0,0.03)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      {/* ID */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px', color: '#64748b',
                          background: 'rgba(35,47,62,0.05)',
                          border: '1px solid rgba(35,47,62,0.07)',
                          borderRadius: '8px', padding: '3px 8px',
                        }}>
                          {reg.id.length > 8 ? reg.id.slice(0, 8) + '…' : reg.id}
                        </span>
                      </td>

                      {/* Attendee */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={reg.name} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#232F3E' }}>{reg.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 20px', maxWidth: 200 }}>
                        <span style={{ fontSize: '13px', color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.email}</span>
                      </td>

                      {/* Event */}
                      <td style={{ padding: '14px 20px', maxWidth: 200 }}>
                        <span style={{ fontSize: '13px', color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.event?.title ?? '—'}</span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>{formatDate(reg.registrationDate)}</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge status={reg.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Link
                            href={`/registrations/${reg.id}`}
                            title="View"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 30, height: 30, borderRadius: '8px',
                              color: '#94a3b8', textDecoration: 'none',
                              border: '1px solid transparent', transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(35,47,62,0.06)'; (e.currentTarget as HTMLAnchorElement).style.color = '#232F3E'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; }}
                          >
                            <Eye style={{ width: 15, height: 15 }} />
                          </Link>
                          {reg.status !== 'CANCELLED' && (
                            <Link
                              href={`/registrations/${reg.id}?action=cancel`}
                              title="Cancel"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 30, height: 30, borderRadius: '8px',
                                color: '#94a3b8', textDecoration: 'none', transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; }}
                            >
                              <XCircle style={{ width: 15, height: 15 }} />
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

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Page <strong style={{ color: '#232F3E' }}>{page}</strong> of <strong style={{ color: '#232F3E' }}>{totalPages}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  padding: '7px 8px', borderRadius: '10px',
                  border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)',
                  color: '#475569', cursor: 'pointer', display: 'flex',
                  opacity: page === 1 ? 0.4 : 1, transition: 'all 0.15s',
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              {pages.map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`e-${idx}`} style={{ fontSize: 12, color: '#94a3b8', padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      minWidth: 36, height: 36, borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                      border: '1.5px solid',
                      borderColor: p === page ? '#FF9900' : 'rgba(35,47,62,0.1)',
                      background: p === page ? 'linear-gradient(135deg,#FF9900,#F7BA45)' : 'rgba(255,255,255,0.9)',
                      color: p === page ? '#ffffff' : '#475569',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: p === page ? '0 4px 12px rgba(255,153,0,0.25)' : 'none',
                    }}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '7px 8px', borderRadius: '10px',
                  border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)',
                  color: '#475569', cursor: 'pointer', display: 'flex',
                  opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.15s',
                }}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
