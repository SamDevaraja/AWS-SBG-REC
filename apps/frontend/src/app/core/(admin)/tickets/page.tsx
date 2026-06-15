'use client';

import { useState } from 'react';
import { useTickets, useEvents, useRegenerateTicket, useEmailTicket } from '@/lib/hooks';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import {
  Eye, RefreshCw, Mail, Ticket,
  Search, ChevronDown, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Ticket as TicketType } from '@/lib/types';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 20px 40px rgba(35,47,62,0.04)', overflow: 'hidden',
    }}>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
              {['Ticket Code', 'Event', 'Attendee', 'Status', 'Created', ''].map((h) => (
                <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(35,47,62,0.04)' }}>
                {[24, 32, 28, 16, 20, 20].map((w, j) => (
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
    <div style={{
      background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '24px', border: '1.5px dashed rgba(35,47,62,0.12)',
      padding: '64px 32px', textAlign: 'center',
    }}>
      <div style={{ margin: '0 auto 20px', width: 56, height: 56, borderRadius: '16px', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ticket style={{ width: 24, height: 24, color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#232F3E', marginBottom: 6 }}>No tickets found</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8' }}>Try adjusting your search or filter criteria.</p>
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

  function handleRegenerate(ticketId: string) { regenerateMutation.mutate(ticketId); }
  function handleEmail(ticketId: string) { emailMutation.mutate(ticketId); }

  // Pagination page list
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const hasFilter = search || statusFilter || eventFilter;

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
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin · Tickets</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              Tickets
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(35,47,62,0.07)', border: '1px solid rgba(35,47,62,0.1)', borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 800, color: '#232F3E' }}>
              {totalCount}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>Manage and monitor all event tickets</p>

          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </div>

        {/* ── Filters ── */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)',
          padding: '20px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by ticket code or name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(35,47,62,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

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

            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(35,47,62,0.1)', borderRadius: '12px', fontSize: '13px', color: '#232F3E', paddingLeft: 14, paddingRight: 30, paddingTop: 10, paddingBottom: 10, cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="USED">Used</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); setEventFilter(''); setPage(1); }}
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
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 20px 40px rgba(35,47,62,0.06)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0 }} />
            <div className="overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
                    {['Ticket Code', 'Event', 'Attendee', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const attendeeName = ticket.registration?.user
                      ? `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`
                      : '—';
                    return (
                      <tr
                        key={ticket.id}
                        style={{ borderBottom: '1px solid rgba(35,47,62,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,153,0,0.03)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        {/* Ticket Code */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#64748b', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.07)', borderRadius: '8px', padding: '3px 8px' }}>
                            {ticket.ticketCode}
                          </span>
                        </td>

                        {/* Event */}
                        <td style={{ padding: '14px 20px', maxWidth: 200 }}>
                          <span style={{ fontSize: '13px', color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ticket.event?.title ?? '—'}
                          </span>
                        </td>

                        {/* Attendee */}
                        <td style={{ padding: '14px 20px' }}>
                          {attendeeName !== '—' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar name={attendeeName} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#232F3E' }}>{attendeeName}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 20px' }}>
                          <StatusBadge status={ticket.status} />
                        </td>

                        {/* Created */}
                        <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>{formatDate(ticket.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {/* View */}
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              title="View"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(35,47,62,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                            >
                              <Eye style={{ width: 15, height: 15 }} />
                            </button>
                            {/* Regenerate */}
                            <button
                              onClick={() => handleRegenerate(ticket.id)}
                              disabled={regenerateMutation.isPending}
                              title="Regenerate"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', opacity: regenerateMutation.isPending ? 0.4 : 1 }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#d97706'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                            >
                              <RefreshCw style={{ width: 15, height: 15 }} />
                            </button>
                            {/* Email */}
                            <button
                              onClick={() => handleEmail(ticket.id)}
                              disabled={emailMutation.isPending}
                              title="Send Email"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', opacity: emailMutation.isPending ? 0.4 : 1 }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#2563eb'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                            >
                              <Mail style={{ width: 15, height: 15 }} />
                            </button>
                          </div>
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
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{ padding: '7px 8px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)', color: '#475569', cursor: 'pointer', display: 'flex', opacity: page === 1 ? 0.4 : 1, transition: 'all 0.15s' }}
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
                      border: '1.5px solid', borderColor: p === page ? '#FF9900' : 'rgba(35,47,62,0.1)',
                      background: p === page ? 'linear-gradient(135deg,#FF9900,#F7BA45)' : 'rgba(255,255,255,0.9)',
                      color: p === page ? '#ffffff' : '#475569', cursor: 'pointer', transition: 'all 0.15s',
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
                style={{ padding: '7px 8px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.1)', background: 'rgba(255,255,255,0.9)', color: '#475569', cursor: 'pointer', display: 'flex', opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.15s' }}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRegenerate={(id) => { handleRegenerate(id); setSelectedTicket(null); }}
          onEmail={(id) => { handleEmail(id); setSelectedTicket(null); }}
        />
      )}
    </div>
  );
}
