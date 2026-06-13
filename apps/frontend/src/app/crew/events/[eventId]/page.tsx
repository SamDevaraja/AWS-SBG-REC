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

function modeConfig(mode: EventMode | undefined) {
  const map: Record<EventMode, { label: string; className: string }> = {
    ONLINE: { label: 'Online', className: 'bg-violet-100 text-violet-700' },
    OFFLINE: { label: 'Offline', className: 'bg-orange-100 text-orange-700' },
    HYBRID: { label: 'Hybrid', className: 'bg-cyan-100 text-cyan-700' },
  };
  if (!mode) return { label: '—', className: 'bg-slate-100 text-slate-500' };
  return map[mode] || { label: mode, className: 'bg-slate-100 text-slate-500' };
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };
  return (
    <span
      className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${map[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  );
}

function AnnouncementTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'SUCCESS':
      return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
    case 'WARNING':
      return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    case 'INFO':
    default:
      return <Info className="h-3.5 w-3.5 text-blue-500" />;
  }
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

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
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-[10px]" />
        <div className="h-40 bg-slate-200 rounded-[10px]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center py-20">
          <p className="text-sm text-slate-500">Event not found.</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-[#232F3E] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-850 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
        </button>

        {/* Hero Section */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
            {/* Poster */}
            <div className="bg-slate-900 rounded-[10px] h-64 flex items-center justify-center overflow-hidden">
              {event.posterImage ? (
                <img
                  src={event.posterImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-slate-700" />
              )}
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-slate-800">{event.title}</h1>

              <div className="flex items-center gap-2 flex-wrap">
                {event.category && (
                  <span className="inline-block rounded-[6px] px-2.5 py-1 text-[10px] font-semibold uppercase bg-[#232F3E]/10 text-[#232F3E]">
                    {event.category}
                  </span>
                )}
                {sc && (
                  <span
                    className={`inline-block rounded-[6px] px-2.5 py-1 text-[10px] font-semibold uppercase ${sc.className}`}
                  >
                    {sc.label}
                  </span>
                )}
                {mc && (
                  <span
                    className={`inline-block rounded-[6px] px-2.5 py-1 text-[10px] font-semibold uppercase ${mc.className}`}
                  >
                    {mc.label}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {event.date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(event.date)}
                  </div>
                )}
                {event.time && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {event.time}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {event.venue}
                  </div>
                )}
              </div>

              {/* Capacity Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {totalRegistrations} registered
                    {event.capacity && (
                      <span className="text-slate-400">/ {event.capacity} capacity</span>
                    )}
                  </div>
                  {event.capacity && (
                    <span className="text-slate-500">{Math.round(capacityPercent)}%</span>
                  )}
                </div>
                {event.capacity && event.capacity > 0 && (
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#232F3E] rounded-full transition-all duration-300"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {event.description && (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">About the Event</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Agenda Section */}
        {event.agenda && event.agenda.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Agenda</h2>
            <div className="space-y-3">
              {event.agenda.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-[10px] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-slate-800">{item.title}</h3>
                      {item.speaker && (
                        <p className="text-xs text-slate-500">Speaker: {item.speaker}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.startTime}
                        {item.endTime && ` - ${item.endTime}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speakers Section */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Speakers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {event.speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-205 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {speaker.photo ? (
                        <img
                          src={speaker.photo}
                          alt={speaker.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          {speaker.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{speaker.name}</h3>
                      {speaker.role && <p className="text-xs text-slate-500">{speaker.role}</p>}
                    </div>
                  </div>
                  {speaker.organization && (
                    <p className="text-xs text-slate-500">{speaker.organization}</p>
                  )}
                  {speaker.bio && (
                    <p className="text-xs text-slate-400 leading-relaxed">{speaker.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrations Section */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Registrations Stream</h2>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-[#232F3E] text-white text-[10px] font-bold px-1.5">
              {totalRegistrations}
            </span>
          </div>

          {registrations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No registrations recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider">Name</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider">Email</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider">Date</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="py-2.5 text-slate-700 font-medium">
                        {reg.name || reg.user
                          ? `${reg.user?.firstName} ${reg.user?.lastName}`
                          : '—'}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs">
                        {reg.email || reg.user?.email || '—'}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(reg.registrationDate)}
                      </td>
                      <td className="py-2.5">
                        <RegistrationStatusBadge status={reg.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Announcements Section */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Announcements</h2>

          {announcements.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No announcements posted for this event.
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="border border-slate-200 rounded-[10px] p-4 bg-slate-50/30"
                >
                  <div className="flex items-start gap-2.5">
                    <AnnouncementTypeIcon type={ann.type} />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-850">{ann.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
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
  );
}
