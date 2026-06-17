'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRegistration, useCancelRegistration } from '@/lib/hooks';
import {
  ArrowLeft,
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  Monitor,
  Clock,
  Ticket,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { RegistrationStatus } from '@/lib/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function statusBadge(status: RegistrationStatus) {
  const map: Record<RegistrationStatus, { bg: string; color: string }> = {
    CONFIRMED: { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
    PENDING:   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
    CANCELLED: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
  };
  return map[status] || { bg: 'rgba(100,116,139,0.1)', color: '#475569' };
}

/* ── Info Card ────────────────────────────────────────────────────── */
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '20px',
      border: '1.5px solid rgba(35,47,62,0.08)',
      boxShadow: '0 8px 24px rgba(35,47,62,0.05)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '18px 18px', pointerEvents: 'none', borderRadius: '20px' }} />
      <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', position: 'relative', zIndex: 1 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ── Info Row ─────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string | undefined | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ padding: '7px', borderRadius: '8px', background: 'rgba(35,47,62,0.04)', border: '1px solid rgba(35,47,62,0.06)', flexShrink: 0, marginTop: 1 }}>
        <Icon style={{ width: 13, height: 13, color: '#94a3b8' }} />
      </div>
      <div>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: '#232F3E', fontWeight: 500, margin: 0 }}>{value || '—'}</p>
      </div>
    </div>
  );
}

/* ── Cancel Modal ─────────────────────────────────────────────────── */
function CancelModal({ open, onConfirm, onCancel, isPending }: {
  open: boolean; onConfirm: () => void; onCancel: () => void; isPending: boolean;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
      <div style={{
        background: '#ffffff', borderRadius: '20px',
        maxWidth: 400, width: '100%', margin: '0 16px',
        padding: '28px', boxShadow: '0 32px 64px rgba(0,0,0,0.15)',
        border: '1.5px solid rgba(35,47,62,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: '#dc2626' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#232F3E', margin: 0 }}>Cancel Registration</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>This action cannot be undone.</p>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
          Are you sure you want to cancel this registration? The associated ticket will also be invalidated.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            disabled={isPending}
            style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid rgba(35,47,62,0.12)', background: '#ffffff', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
          >
            Keep Registration
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', opacity: isPending ? 0.7 : 1, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
          >
            {isPending ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Loading Skeleton ─────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ height: 36, width: 100, borderRadius: 10, background: 'rgba(35,47,62,0.06)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius: 20, border: '1.5px solid rgba(35,47,62,0.08)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 12, width: 80, borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
                {[1,2,3].map(j => <div key={j} style={{ height: 10, borderRadius: 6, background: 'rgba(35,47,62,0.05)' }} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function RegistrationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: registration, isLoading } = useRegistration(registrationId);
  const cancelMutation = useCancelRegistration();

  function handleCancel() {
    cancelMutation.mutate(registrationId, {
      onSuccess: () => { setShowCancelModal(false); },
    });
  }

  if (isLoading) return <LoadingSkeleton />;

  if (!registration) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Registration not found.</p>
          <button
            onClick={() => router.push('/registrations')}
            style={{ marginTop: 16, fontSize: '13px', color: '#FF9900', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Registrations
          </button>
        </div>
      </div>
    );
  }

  const badge = statusBadge(registration.status);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs — matches landing page */}
      <div style={{ position: 'fixed', top: '10%', right: '12%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,115,187,0.05) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Back Button ── */}
        <div>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(35,47,62,0.1)',
              borderRadius: '10px', padding: '8px 16px',
              fontSize: '13px', fontWeight: 600, color: '#232F3E',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(35,47,62,0.06)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF9900'; (e.currentTarget as HTMLButtonElement).style.color = '#FF9900'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(35,47,62,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#232F3E'; }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back
          </button>
        </div>

        {/* ── Header ── */}
        <div>
          {/* Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, rgba(255,153,0,0.07), rgba(35,47,62,0.04))',
            border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px',
            padding: '6px 14px 6px 10px', marginBottom: '12px',
            boxShadow: '0 2px 12px rgba(255,153,0,0.08)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin · Registration Detail</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
              Registration Details
            </h1>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#64748b', background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.07)', borderRadius: '8px', padding: '3px 10px' }}>
              {registration.id}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '100px', background: badge.bg, color: badge.color }}>
              {registration.status}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: 8, marginLeft: 1 }}>
            Viewing registration for <strong style={{ color: '#232F3E' }}>{registration.name}</strong>
          </p>

          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', margin: '20px 0 0', borderRadius: 2 }} />
        </div>

        {/* ── Info Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <InfoCard title="Attendee Info">
            <InfoRow icon={User}     label="Name"        value={registration.name} />
            <InfoRow icon={Mail}     label="Email"       value={registration.email} />
            <InfoRow icon={Hash}     label="Roll Number" value={registration.roll_number} />
            <InfoRow icon={User}     label="Department"  value={registration.department} />
            <InfoRow icon={Hash}     label="User ID"     value={registration.userId} />
          </InfoCard>

          <InfoCard title="Event Info">
            <InfoRow icon={Calendar} label="Title"  value={registration.event?.title} />
            <InfoRow icon={Clock}    label="Date"   value={registration.event?.date ? formatDate(registration.event.date) : null} />
            <InfoRow icon={MapPin}   label="Venue"  value={registration.event?.venue} />
            <InfoRow icon={Monitor}  label="Mode"   value={registration.event?.mode} />
          </InfoCard>

          <InfoCard title="Registration Info">
            <InfoRow icon={Calendar} label="Registered On" value={formatDateTime(registration.registrationDate)} />
            <InfoRow icon={Hash}     label="Status"        value={registration.status} />
            {registration.ticket && (
              <InfoRow icon={Ticket} label="Ticket Code" value={registration.ticket.ticketCode} />
            )}
          </InfoCard>
        </div>

        {/* ── Form Answers ── */}
        {registration.answers && registration.answers.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(35,47,62,0.08)',
            boxShadow: '0 8px 24px rgba(35,47,62,0.05)',
            padding: '24px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '18px 18px', pointerEvents: 'none', borderRadius: '20px' }} />
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', position: 'relative', zIndex: 1 }}>Form Answers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
              {registration.answers.map((answer) => (
                <div key={answer.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'rgba(35,47,62,0.03)', borderRadius: '10px', border: '1px solid rgba(35,47,62,0.06)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#94a3b8', minWidth: 80, flexShrink: 0, paddingTop: 1 }}>
                    {answer.fieldId.slice(0, 8)}…
                  </span>
                  <span style={{ fontSize: '13px', color: '#232F3E', fontWeight: 500 }}>
                    {typeof answer.value === 'boolean'
                      ? answer.value ? 'Yes' : 'No'
                      : Array.isArray(answer.value)
                        ? answer.value.join(', ')
                        : String(answer.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ticket Section ── */}
        {registration.ticket && (
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(35,47,62,0.08)',
            boxShadow: '0 8px 24px rgba(35,47,62,0.05)',
            padding: '24px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '18px 18px', pointerEvents: 'none', borderRadius: '20px' }} />
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', position: 'relative', zIndex: 1 }}>Ticket</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Ticket Code</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#232F3E', fontWeight: 600, margin: 0 }}>{registration.ticket.ticketCode}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Status</p>
                <span style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '4px 12px', borderRadius: '100px',
                  background: registration.ticket.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : registration.ticket.status === 'USED' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                  color: registration.ticket.status === 'ACTIVE' ? '#059669' : registration.ticket.status === 'USED' ? '#2563eb' : '#dc2626',
                }}>
                  {registration.ticket.status}
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid rgba(35,47,62,0.08)', background: 'rgba(35,47,62,0.02)' }}>
                <div style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>QR Code</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        {registration.status !== 'CANCELLED' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCancelModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: '12px',
                border: '1.5px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.05)',
                fontSize: '13px', fontWeight: 600, color: '#dc2626',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)'; }}
            >
              <X style={{ width: 14, height: 14 }} />
              Cancel Registration
            </button>
          </div>
        )}
      </div>

      <CancelModal
        open={showCancelModal}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
        isPending={cancelMutation.isPending}
      />
    </div>
  );
}
