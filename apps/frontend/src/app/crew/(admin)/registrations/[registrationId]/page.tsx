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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusBadge(status: RegistrationStatus) {
  const map: Record<RegistrationStatus, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <div>
        <p className="text-[10px] uppercase text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700">{value || '—'}</p>
      </div>
    </div>
  );
}

function CancelModal({
  open,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[10px] max-w-sm w-full mx-4 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Cancel Registration</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to cancel this registration? The associated ticket will also be
          invalidated.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
          >
            Keep Registration
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-[8px] bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition disabled:opacity-40"
          >
            {isPending ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-[10px] p-5 space-y-4">
              <div className="h-5 w-32 rounded bg-slate-100" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: registration, isLoading } = useRegistration(registrationId);
  const cancelMutation = useCancelRegistration();

  function handleCancel() {
    cancelMutation.mutate(registrationId, {
      onSuccess: () => {
        setShowCancelModal(false);
      },
    });
  }

  if (isLoading) return <LoadingSkeleton />;

  if (!registration) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="w-full text-center py-20">
          <p className="text-sm text-slate-500">Registration not found.</p>
          <button
            onClick={() => router.push('/crew/registrations')}
            className="mt-4 text-xs text-[#232F3E] font-medium hover:underline"
          >
            Back to Registrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/crew/registrations')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Registrations
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800">Registration Details</h1>
          <span className="inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100">
            {registration.id}
          </span>
          <span
            className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadge(registration.status)}`}
          >
            {registration.status}
          </span>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard title="Attendee Info">
            <InfoRow icon={User} label="Name" value={registration.name} />
            <InfoRow icon={Mail} label="Email" value={registration.email} />
            <InfoRow icon={Hash} label="Roll Number" value={registration.roll_number} />
            <InfoRow icon={User} label="Department" value={registration.department} />
            <InfoRow icon={Hash} label="User ID" value={registration.userId} />
          </InfoCard>

          <InfoCard title="Event Info">
            <InfoRow icon={Calendar} label="Title" value={registration.event?.title} />
            <InfoRow
              icon={Clock}
              label="Date"
              value={registration.event?.date ? formatDate(registration.event.date) : null}
            />
            <InfoRow icon={MapPin} label="Venue" value={registration.event?.venue} />
            <InfoRow icon={Monitor} label="Mode" value={registration.event?.mode} />
          </InfoCard>

          <InfoCard title="Registration Info">
            <InfoRow
              icon={Calendar}
              label="Registered On"
              value={formatDateTime(registration.registrationDate)}
            />
            <InfoRow icon={Hash} label="Status" value={registration.status} />
            {registration.ticket && (
              <InfoRow icon={Ticket} label="Ticket Code" value={registration.ticket.ticketCode} />
            )}
          </InfoCard>
        </div>

        {/* Answers Section */}
        {registration.answers && registration.answers.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Form Answers</h3>
            <div className="space-y-3">
              {registration.answers.map((answer) => (
                <div key={answer.id} className="flex items-start gap-3">
                  <span className="text-xs text-slate-400 font-mono min-w-[80px]">
                    {answer.fieldId.slice(0, 8)}...
                  </span>
                  <span className="text-sm text-slate-700">
                    {typeof answer.value === 'boolean'
                      ? answer.value
                        ? 'Yes'
                        : 'No'
                      : Array.isArray(answer.value)
                        ? answer.value.join(', ')
                        : String(answer.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Section */}
        {registration.ticket && (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Ticket</h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-medium">Ticket Code</p>
                <p className="text-sm font-mono text-slate-700">{registration.ticket.ticketCode}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-medium">Status</p>
                <span
                  className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    registration.ticket.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : registration.ticket.status === 'USED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {registration.ticket.status}
                </span>
              </div>
              <div className="border border-slate-200 rounded-[8px] p-3 bg-slate-50">
                <div className="w-24 h-24 bg-white rounded flex items-center justify-center text-[10px] text-slate-400">
                  QR Code
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {registration.status !== 'CANCELLED' && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50 transition"
            >
              <X className="h-3.5 w-3.5" />
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
