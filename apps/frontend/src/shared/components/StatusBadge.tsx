import React from 'react';
import type { RegistrationStatus, TicketStatus, EventStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: RegistrationStatus | TicketStatus | EventStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = {
    // Registration Statuses
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
    // Ticket Statuses
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    USED: 'bg-blue-100 text-blue-700',
    // Event Statuses
    DRAFT: 'bg-slate-100 text-slate-700',
    PUBLISHED: 'bg-blue-100 text-blue-700',
    REGISTRATION_OPEN: 'bg-emerald-100 text-emerald-700',
    REGISTRATION_CLOSED: 'bg-amber-100 text-amber-700',
    ONGOING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-slate-100 text-slate-600',
    ARCHIVED: 'bg-slate-100 text-slate-600',
    // Attendance statuses
    ATTENDED: 'bg-emerald-100 text-emerald-700',
    ABSENT: 'bg-slate-100 text-slate-600',
  };

  const className = map[status] || 'bg-slate-100 text-slate-600';

  // Pretty label
  const labelMap: Record<string, string> = {
    REGISTRATION_OPEN: 'Registration Open',
    REGISTRATION_CLOSED: 'Registration Closed',
  };
  const label = labelMap[status] || status;

  return (
    <span
      className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${className}`}
    >
      {label}
    </span>
  );
}
