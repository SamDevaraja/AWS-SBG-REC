'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents, useAttendance, useVerifyTicket } from '@/lib/hooks';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, Calendar, Filter,
  ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import type { Ticket } from '@/lib/types';
import { formatDateTime } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';


/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 20px 40px rgba(35,47,62,0.04)', overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
              {['Attendee', 'Event', 'Ticket Code', 'Scanned At', 'Scanner', 'Status'].map((h) => (
                <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(35,47,62,0.04)' }}>
                {[28, 32, 24, 28, 20, 16].map((w, j) => (
                  <td key={j} style={{ padding: '14px 20px' }}>
                    <div className="animate-pulse" style={{ height: 12, width: `${w * 4}px`, borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
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

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px dashed rgba(35,47,62,0.12)', padding: '64px 32px', textAlign: 'center' }}>
      <div style={{ margin: '0 auto 20px', width: 56, height: 56, borderRadius: '16px', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QrCode style={{ width: 24, height: 24, color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#232F3E', marginBottom: 6 }}>No attendance records found</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8' }}>Scan a ticket or adjust your filters to see results.</p>
    </div>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [
    'linear-gradient(135deg,#f59e0b,#f97316)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f43f5e,#e11d48)',
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#0073BB,#005d96)',
  ];
  const bg = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      {initials}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function AttendancePage() {
  const router = useRouter();
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
  const attendanceRate = tickets.length > 0 ? Math.round((attendedTickets.length / tickets.length) * 100) : 0;

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
            setScanResult({ status: 'valid', message: response.status || 'Ticket verified successfully!' });
          } else {
            const msg = response.status?.toLowerCase() || '';
            if (msg.includes('already') || msg.includes('scanned')) {
              setScanResult({ status: 'already_scanned', message: response.status || 'Ticket has already been scanned.' });
            } else {
              setScanResult({ status: 'invalid', message: response.status || 'Invalid ticket code.' });
            }
          }
          setTicketCode('');
        },
        onError: () => {
          setScanResult({ status: 'invalid', message: 'Failed to verify ticket. Please try again.' });
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

  // Pagination
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasFilter = eventFilter || dateFilter || statusFilter;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '10%', right: '12%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,115,187,0.05) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin · Attendance</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                Attendance
              </h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(35,47,62,0.07)', border: '1px solid rgba(35,47,62,0.1)', borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 800, color: '#232F3E' }}>
                {totalCount}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {/* OD List Button */}
              <button
                onClick={() => {
                  if (!eventFilter) {
                    alert("Please select a specific event from the dropdown filter first to generate its OD list.");
                    return;
                  }
                  router.push(`/core/attendance/od-generator?eventId=${eventFilter}`);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#232F3E', border: '1.5px solid rgba(35,47,62,0.12)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, padding: '10px 20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(35,47,62,0.04)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF9900'; (e.currentTarget as HTMLButtonElement).style.color = '#FF9900'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(35,47,62,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; }}
              >
                <Download style={{ width: 15, height: 15 }} />
                Generate OD List
              </button>

              {/* Scan Ticket Button */}
              <button
                onClick={() => { setScanModalOpen(true); setScanResult(null); setTicketCode(''); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#232F3E', color: '#ffffff', borderRadius: '12px', fontSize: '13px', fontWeight: 700, padding: '10px 20px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(35,47,62,0.2)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FF9900'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#232F3E'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
              >
                <QrCode style={{ width: 15, height: 15 }} />
                Scan Ticket
              </button>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>Track and verify event attendance</p>

          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </div>



        {/* ── Filters ── */}
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)', padding: '20px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

            {/* Event filter */}
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
              <select
                value={eventFilter}
                onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', paddingLeft: 30, paddingRight: 30, paddingTop: 10, paddingBottom: 10, cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All Events</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {/* Date filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar style={{ width: 13, height: 13, color: '#94a3b8', flexShrink: 0 }} />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', padding: '8px 12px', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; }}
              />
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', paddingLeft: 14, paddingRight: 30, paddingTop: 10, paddingBottom: 10, cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All Status</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {hasFilter && (
              <button
                onClick={() => { setEventFilter(''); setDateFilter(''); setStatusFilter(''); setPage(1); }}
                style={{ fontSize: '12px', fontWeight: 700, color: '#FF9900', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 20px 40px rgba(35,47,62,0.06)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0 }} />
            <div className="overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
                    {['Attendee', 'Event', 'Ticket Code', 'Scanned At', 'Scanner', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const name = getAttendeeName(ticket);
                    return (
                      <tr
                        key={ticket.id}
                        style={{ borderBottom: '1px solid rgba(35,47,62,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,153,0,0.03)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        {/* Attendee */}
                        <td style={{ padding: '14px 20px' }}>
                          {name !== '—' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar name={name} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#232F3E' }}>{name}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        {/* Event */}
                        <td style={{ padding: '14px 20px', maxWidth: 180 }}>
                          <span style={{ fontSize: '13px', color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ticket.event?.title ?? '—'}
                          </span>
                        </td>

                        {/* Ticket Code */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#64748b', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.07)', borderRadius: '8px', padding: '3px 8px' }}>
                            {ticket.ticketCode}
                          </span>
                        </td>

                        {/* Scanned At */}
                        <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>
                            {ticket.scannedAt ? formatDateTime(ticket.scannedAt) : '—'}
                          </span>
                        </td>

                        {/* Scanner */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>{ticket.scannerId ?? '—'}</span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 20px' }}>
                          <StatusBadge status={isAttended(ticket) ? 'ATTENDED' : 'ABSENT'} />
                        </td>
                      </tr>
                    );
                  })}
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
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '7px 8px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)', color: '#475569', cursor: 'pointer', display: 'flex', opacity: page === 1 ? 0.4 : 1, transition: 'all 0.15s' }}>
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              {pages.map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`e-${idx}`} style={{ fontSize: 12, color: '#94a3b8', padding: '0 4px' }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)} style={{ minWidth: 36, height: 36, borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: '1.5px solid', borderColor: p === page ? '#FF9900' : 'rgba(35,47,62,0.1)', background: p === page ? 'linear-gradient(135deg,#FF9900,#F7BA45)' : 'rgba(255,255,255,0.9)', color: p === page ? '#ffffff' : '#475569', cursor: 'pointer', transition: 'all 0.15s', boxShadow: p === page ? '0 4px 12px rgba(255,153,0,0.25)' : 'none' }}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '7px 8px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)', color: '#475569', cursor: 'pointer', display: 'flex', opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.15s' }}>
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Scan Ticket Modal ── */}
      {scanModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setScanModalOpen(false)} />
          <div style={{ position: 'relative', background: '#ffffff', borderRadius: '24px', maxWidth: 440, width: '100%', margin: '0 16px', padding: '28px', boxShadow: '0 32px 64px rgba(0,0,0,0.15)', border: '1.5px solid rgba(35,47,62,0.08)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(35,47,62,0.06)', border: '1px solid rgba(35,47,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode style={{ width: 18, height: 18, color: '#232F3E' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#232F3E', margin: 0 }}>Scan Ticket</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>Enter a ticket code to verify</p>
                </div>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'rgba(35,47,62,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(35,47,62,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >
                <XCircle style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handleScanSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Ticket Code
                  </label>
                  <input
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Enter ticket code…"
                    autoFocus
                    style={{ width: '100%', background: 'rgba(35,47,62,0.03)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', padding: '11px 14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'JetBrains Mono, monospace' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.12)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Scan result feedback */}
                {scanResult && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', fontWeight: 500,
                    background: scanResult.status === 'valid' ? 'rgba(16,185,129,0.08)' : scanResult.status === 'already_scanned' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${scanResult.status === 'valid' ? 'rgba(16,185,129,0.2)' : scanResult.status === 'already_scanned' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: scanResult.status === 'valid' ? '#059669' : scanResult.status === 'already_scanned' ? '#d97706' : '#dc2626',
                  }}>
                    {scanResult.status === 'valid' && <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />}
                    {scanResult.status === 'already_scanned' && <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />}
                    {scanResult.status === 'invalid' && <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />}
                    <span>{scanResult.message}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setScanModalOpen(false)}
                    style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.12)', background: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyMutation.isPending || !ticketCode.trim()}
                    style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: '#232F3E', fontSize: '13px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', opacity: (verifyMutation.isPending || !ticketCode.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { if (!verifyMutation.isPending && ticketCode.trim()) { (e.currentTarget as HTMLButtonElement).style.background = '#FF9900'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#232F3E'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
                  >
                    {verifyMutation.isPending ? 'Verifying…' : 'Verify Ticket'}
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
