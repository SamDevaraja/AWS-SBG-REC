'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useRegistration, useCancelRegistration } from '@/lib/hooks';
import {
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  Monitor,
  Clock,
  QrCode,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import type { RegistrationStatus } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';

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
  const map: Record<RegistrationStatus, { bg: string; text: string; border: string }> = {
    CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    PENDING:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
    CANCELLED: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
  };
  return map[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
}

/* ── Cancel Modal ─────────────────────────────────────────────────── */
function CancelModal({ open, onConfirm, onCancel, isPending }: {
  open: boolean; onConfirm: () => void; onCancel: () => void; isPending: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[4px] max-w-md w-full p-6 shadow-xl border border-slate-200/80 animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-[4px] bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cancel Registration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to cancel this registration? The associated ticket will be permanently invalidated. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-[4px] bg-white hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Keep Registration
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-[4px] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
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
    <div className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-24 bg-slate-200 rounded-[4px] animate-pulse" />
        <div className="h-10 w-64 bg-slate-200 rounded-[4px] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-white border border-slate-200 rounded-[4px] animate-pulse" />
            <div className="h-48 bg-white border border-slate-200 rounded-[4px] animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-white border border-slate-200 rounded-[4px] animate-pulse" />
            <div className="h-64 bg-white border border-slate-200 rounded-[4px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = params.registrationId as string;
  const actionParam = searchParams.get('action');
  
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: registration, isLoading } = useRegistration(registrationId);
  const cancelMutation = useCancelRegistration();

  useEffect(() => {
    if (actionParam === 'cancel' && registration && registration.status !== 'CANCELLED') {
      setShowCancelModal(true);
    }
  }, [actionParam, registration]);

  function handleCancel() {
    cancelMutation.mutate(registrationId, {
      onSuccess: () => { 
        setShowCancelModal(false); 
        // Remove the action=cancel param from the URL query to avoid reopening
        const url = new URL(window.location.href);
        url.searchParams.delete('action');
        window.history.replaceState({}, '', url.toString());
      },
    });
  }

  if (isLoading) return <LoadingSkeleton />;

  if (!registration) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-[4px] p-8 max-w-sm w-full text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Registration not found.</p>
          <button
            onClick={() => router.push('/core/registrations')}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] text-xs font-semibold cursor-pointer transition-all shadow-xs"
          >
            Back to Registrations
          </button>
        </div>
      </div>
    );
  }

  const badge = statusBadge(registration.status);

  return (
    <div className="min-h-screen bg-slate-50/30 py-8 px-4 font-sans relative">
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Admin Control</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="font-mono text-[9.5px] bg-slate-100 text-slate-500 border border-slate-200/50 px-1.5 py-0.5 rounded-[3px] select-all tracking-normal truncate max-w-[200px] md:max-w-none">
                ID: {registration.id}
              </span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Registration Details
              </h1>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-[3px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                {registration.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered on {formatDateTime(registration.registrationDate)}
            </p>
          </div>

          {/* Action Header Button */}
          {registration.status !== 'CANCELLED' && (
            <div className="mt-2 md:mt-0 shrink-0">
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 border border-rose-200 bg-white hover:bg-rose-50/50 text-rose-600 rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-xs hover:border-rose-350 hover:shadow-sm"
              >
                Cancel Registration
              </button>
            </div>
          )}
        </div>

        {/* ── Main Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN: DETAILS */}
          <div className="lg:col-span-2 space-y-6">

            {/* Attendee Card */}
            <div className="bg-white border border-slate-200/85 rounded-[4px] p-5 shadow-xs">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                Attendee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.name || '—'}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Roll Number</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.roll_number || '—'}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.department || '—'}</p>
                </div>
              </div>
            </div>

            {/* Event Card */}
            <div className="bg-white border border-slate-200/85 rounded-[4px] p-5 shadow-xs">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Event Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Event Title</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.event?.title || '—'}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date</label>
                  <p className="text-xs font-semibold text-slate-800">
                    {registration.event?.date ? formatDate(registration.event.date) : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Mode</label>
                  <span className="inline-block bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                    {registration.event?.mode || '—'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Venue</label>
                  <p className="text-xs font-semibold text-slate-800">{registration.event?.venue || '—'}</p>
                </div>
              </div>
            </div>

            {/* Custom Form Answers Card */}
            {registration.answers && registration.answers.length > 0 && (
              <div className="bg-white border border-slate-200/85 rounded-[4px] p-5 shadow-xs">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-400" />
                  Additional Form Submissions
                </h3>
                <div className="divide-y divide-slate-100">
                  {registration.answers.map((answer) => (
                    <div key={answer.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Field {answer.fieldId.slice(0, 8)}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
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

          </div>

          {/* RIGHT COLUMN: STATUS & TICKET PASS */}
          <div className="space-y-6">

            {/* Ticket Card Pass */}
            {registration.ticket && (
              <div className="bg-white border border-slate-200/85 rounded-[4px] p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900" />
                
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5 self-start">
                  <QrCode size={13} className="text-slate-400" />
                  Access Ticket Pass
                </h3>

                {/* QR Code Container */}
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-[4px] mb-4 shadow-inner">
                  <QRCodeSVG
                    value={registration.ticket.ticketCode}
                    size={110}
                    level="H"
                    includeMargin={false}
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-3 w-full">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Ticket ID Pass Code</label>
                    <p className="text-xs font-mono font-bold text-slate-800 select-all mt-0.5 bg-slate-50 border border-slate-200/40 rounded-[2px] px-2.5 py-1 inline-block">
                      {registration.ticket.ticketCode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Pass Status</label>
                    <span className={`inline-block px-2.5 py-0.5 rounded-[3px] text-[9px] font-black uppercase tracking-wider border ${
                      registration.ticket.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : registration.ticket.status === 'USED' 
                          ? 'bg-sky-50 text-sky-700 border-sky-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {registration.ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Helper Notes */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-[4px] p-5 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">System Operator Details</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                As a system manager, you can cancel this registration at any time. When cancelled, the associated ticket code will instantly be marked as <strong className="text-slate-700">INACTIVE</strong> and cannot be scanned for attendance verification.
              </p>
            </div>

          </div>

        </div>

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
