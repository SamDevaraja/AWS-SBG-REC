'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEvent, useAnnouncements, useRegistrationsByEvent } from '@/lib/hooks';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
} from 'lucide-react';
import type { EventStatus, EventMode, Announcement } from '@/lib/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
    PUBLISHED: { label: 'Published', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    REGISTRATION_CLOSED: { label: 'Registration Closed', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    ONGOING: { label: 'Ongoing', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-700 border border-slate-200' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-700 border border-slate-200' },
  };
  return map[status] || { label: status, className: 'bg-slate-100 text-slate-700 border border-slate-200' };
}

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
    HYBRID: { label: 'Hybrid', className: 'bg-cyan-50 text-cyan-700 border border-cyan-200' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-100 text-slate-600 border border-slate-200' };
  return map[mode] || { label: mode, className: 'bg-slate-100 text-slate-600 border border-slate-200' };
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border border-rose-200',
  };
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${map[status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}
    >
      {status}
    </span>
  );
}

function AnnouncementTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'SUCCESS':
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'WARNING':
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case 'INFO':
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = (params?.eventId as string) || '';

  const { data: event, isLoading } = useEvent(eventId);
  const { data: registrationsData } = useRegistrationsByEvent(eventId, {
    page: 1,
    limit: 10,
  });
  const { data: announcementsData } = useAnnouncements(eventId);

  const announcements = (
    Array.isArray(announcementsData) ? announcementsData : []
  ) as Announcement[];
  const registrations = registrationsData?.data || [];
  const totalRegistrations = registrationsData?.total || event?.registrations?.length || 0;

  const sc = event ? statusConfig(event.status) : null;
  const mc = event ? modeConfig(event.mode) : null;

  const capacityPercent =
    event?.capacity && event.capacity > 0
      ? Math.min((totalRegistrations / event.capacity) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 bg-slate-50 animate-pulse space-y-6">
        <div className="h-20 bg-slate-200 rounded-xl border border-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[400px] bg-slate-200 rounded-xl border border-slate-200" />
          <div className="lg:col-span-8 h-[400px] bg-slate-200 rounded-xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen p-6 lg:p-8 bg-slate-50 flex items-center justify-center">
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200 px-12">
          <p className="text-sm text-slate-500 font-medium">Event not found.</p>
          <Link
            href="/crew/events"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-slate-900 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white rounded-xl p-5 sm:px-8 border border-slate-200 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {event.category && (
                <span className="inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {event.category}
                </span>
              )}
              {sc && (
                <span className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${sc.className}`}>
                  {sc.label}
                </span>
              )}
              {mc && (
                <span className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${mc.className}`}>
                  {mc.label}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={() => router.push(`/crew/events/edit/${eventId}`)}
               className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors"
             >
               Edit Event
             </button>
          </div>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar: Event Identity Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Poster or Minimal Banner */}
              <div className="w-full relative aspect-video sm:aspect-square lg:aspect-[4/3] bg-slate-100 overflow-hidden shrink-0 border-b border-slate-200">
                <img
                  src={event.posterImage || '/default-event-poster.png'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Logistics */}
              <div className="p-6 sm:p-8 space-y-6 flex-1">
                {event.date && (
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(event.date)}</p>
                    </div>
                  </div>
                )}
                {event.time && (
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-sm font-semibold text-slate-900">{event.time}</p>
                    </div>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm font-semibold text-slate-900">{event.venue}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Operations Grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Row: Capacity & About */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Capacity & Stats Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                   <TrendingUp className="w-4 h-4 text-slate-400" />
                   <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Registration Stats</h2>
                </div>
                
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-bold tracking-tight text-slate-900">
                    {totalRegistrations}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    / {event.capacity || '∞'} registered
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>Fill Status</span>
                    <span>{Math.round(capacityPercent)}%</span>
                  </div>
                  {event.capacity && event.capacity > 0 && (
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* About Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                   <Info className="w-4 h-4 text-slate-400" />
                   <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">About</h2>
                </div>
                {event.description ? (
                  <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium italic">
                    No description provided.
                  </div>
                )}
              </div>
            </div>

            {/* Registrations Stream Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">Registrations Stream</h2>
                </div>
                <span className="inline-flex items-center justify-center h-6 min-w-[28px] rounded-md bg-slate-100 text-slate-700 text-xs font-bold px-2 border border-slate-200">
                  {totalRegistrations}
                </span>
              </div>

              {registrations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 flex flex-col items-center justify-center">
                   <Users className="w-8 h-8 text-slate-300 mb-3" />
                   <p className="text-sm text-slate-600 font-semibold">No Registrations Yet</p>
                   <p className="text-sm text-slate-400 font-medium mt-1">Registrations will appear here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-slate-900 font-semibold">
                            {reg.name || reg.user
                              ? `${reg.user?.firstName} ${reg.user?.lastName}`
                              : '—'}
                          </td>
                          <td className="py-4 text-slate-500 font-medium">
                            {reg.email || reg.user?.email || '—'}
                          </td>
                          <td className="py-4 text-slate-500 font-medium">
                            {formatDate(reg.registrationDate)}
                          </td>
                          <td className="py-4">
                            <RegistrationStatusBadge status={reg.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Announcements Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                 <AlertCircle className="w-4 h-4 text-slate-400" />
                 <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">Announcements</h2>
              </div>

              {announcements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 font-medium">No announcements posted.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <AnnouncementTypeIcon type={ann.type} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{ann.message}</p>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2">
                            {formatDateTime(ann.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
