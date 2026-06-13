import type { EventStatus, EventMode } from '../types';

export function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    PUBLISHED: { label: 'Published', className: 'bg-blue-100 text-blue-700' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'bg-emerald-100 text-emerald-700' },
    REGISTRATION_CLOSED: { label: 'Registration Closed', className: 'bg-amber-100 text-amber-700' },
    ONGOING: { label: 'Ongoing', className: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-600' },
  };
  return map[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
}

export function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'bg-violet-100 text-violet-700' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-100 text-orange-700' },
    HYBRID: { label: 'Hybrid', className: 'bg-cyan-100 text-cyan-700' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-100 text-slate-500' };
  return map[mode] || { label: mode, className: 'bg-slate-100 text-slate-500' };
}
