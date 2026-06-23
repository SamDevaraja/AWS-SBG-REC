'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useEvent,
  useAnnouncements,
  useCreateAnnouncement,
  useRegistrationsByEvent,
} from '@/lib/hooks';
import * as api from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Globe,
  XCircle,
  Archive,
  Send,
  Image as ImageIcon,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { EventStatus, EventMode, Announcement } from '@/lib/types';
import { getPosterSrcAndPosition } from '@/lib/utils';

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

function LoadingSkeleton() {
  return (
    <div className="bg-transparent p-6 lg:p-8">
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-100" />
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>

        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-slate-900 h-64 rounded-[8px]" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-[6px] bg-slate-100" />
                <div className="h-5 w-20 rounded-[6px] bg-slate-100" />
                <div className="h-5 w-16 rounded-[6px] bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-4 w-36 rounded bg-slate-100" />
              </div>
              <div className="h-3 w-full rounded-[2px] bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-9 w-20 rounded-[8px] bg-slate-100" />
                <div className="h-9 w-20 rounded-[8px] bg-slate-100" />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
        </div>

        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6 space-y-3">
          <div className="h-5 w-28 rounded bg-slate-100" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 border border-slate-200 rounded-[8px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useEvent(eventId);
  const { data: registrationsData } = useRegistrationsByEvent(eventId, {
    page: 1,
    limit: 10,
  });
  const { data: announcementsData } = useAnnouncements(eventId);
  const createAnnouncement = useCreateAnnouncement();

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const closeRegistrationMutation = useMutation({
    mutationFn: (id: string) => api.closeRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.archiveEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.updateEvent(id, { status: 'COMPLETED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    sendEmail: false,
  });

  const announcements = (
    Array.isArray(announcementsData) ? announcementsData : []
  ) as Announcement[];
  const registrations = registrationsData?.data || [];
  const totalRegistrations = registrationsData?.total || event?.registrations?.length || 0;

  const sc = event ? statusConfig(event.status) : null;
  const mc = event ? modeConfig(event.mode) : null;

  const canPublish = event?.status === 'DRAFT';
  const canCloseRegistration =
    event?.status === 'REGISTRATION_OPEN' || event?.status === 'PUBLISHED';
  const canArchive =
    event?.status !== 'ARCHIVED' && event?.status !== 'COMPLETED' && event?.status !== 'DRAFT';
  const canComplete =
    event?.status !== 'ARCHIVED' && event?.status !== 'COMPLETED' && event?.status !== 'DRAFT';

  const capacityPercent =
    event?.capacity && event.capacity > 0
      ? Math.min((totalRegistrations / event.capacity) * 100, 100)
      : 0;

  function handleCreateAnnouncement() {
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;

    createAnnouncement.mutate(
      {
        eventId,
        title: announcementForm.title,
        message: announcementForm.message,
        type: announcementForm.type,
        sendEmail: announcementForm.sendEmail,
      },
      {
        onSuccess: () => {
          setAnnouncementForm({
            title: '',
            message: '',
            type: 'INFO',
            sendEmail: false,
          });
        },
      },
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!event) {
    return (
      <div className="bg-transparent p-6 lg:p-8">
        <div className="w-full text-center py-20">
          <p className="text-sm text-slate-500">Event not found.</p>
          <Link
            href="/core/events"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-[#232F3E] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-6 lg:p-8">
      <div className="w-full space-y-6">


        {/* Hero Section */}
        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
            {/* Poster */}
            {(() => {
              const { src: imgPosterSrc, position: imgPosterPosition } = getPosterSrcAndPosition(event.posterImage);
              return (
                <div className="bg-slate-900 rounded-[8px] h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src={imgPosterSrc}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: imgPosterPosition }}
                  />
                </div>
              );
            })()}

            {/* Event Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>

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
              <div className="space-y-1.5">
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
                  <div className="h-2 w-full bg-slate-100 rounded-[2px] overflow-hidden">
                    <div
                      className="h-full bg-[#232F3E] rounded-[2px] transition-all duration-300"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <Link
                  href={`/core/events/edit/${event.id}`}
                  className="inline-flex items-center gap-1.5 border border-slate-200 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Link>
                {canPublish && (
                  <button
                    onClick={() => publishMutation.mutate(event.id)}
                    disabled={publishMutation.isPending}
                    className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60 transition"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Publish
                  </button>
                )}
                {canCloseRegistration && (
                  <button
                    onClick={() => closeRegistrationMutation.mutate(event.id)}
                    disabled={closeRegistrationMutation.isPending}
                    className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 rounded-[8px] text-xs font-medium px-4 py-2 text-amber-700 hover:bg-amber-100 disabled:opacity-60 transition"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Close Registration
                  </button>
                )}
                {canComplete && (
                  <button
                    onClick={() => completeMutation.mutate(event.id)}
                    disabled={completeMutation.isPending}
                    className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 rounded-[8px] text-xs font-medium px-4 py-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Complete
                  </button>
                )}
                {canArchive && (
                  <button
                    onClick={() => archiveMutation.mutate(event.id)}
                    disabled={archiveMutation.isPending}
                    className="inline-flex items-center gap-1.5 border border-slate-200 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {event.description && (
          <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">About</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Agenda Section */}
        {event.agenda && event.agenda.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Agenda</h2>
            <div className={`space-y-3 ${event.agenda.length > 5 ? 'max-h-[420px] overflow-y-auto pr-1' : ''}`}>
              {event.agenda.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-[8px] p-4">
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
          <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Speakers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {event.speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="border border-slate-200 rounded-[8px] p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-[4px] bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                    <p className="text-xs text-slate-500 leading-relaxed">{speaker.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields Preview */}
        {event.formFields && event.formFields.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Registration Form</h2>
            <div className="space-y-2">
              {[...event.formFields]
                .sort((a, b) => a.fieldOrder - b.fieldOrder)
                .map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between py-2.5 border-b border-slate-200 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700">{field.label}</span>
                      {field.isRequired && <span className="text-[10px] text-rose-500">*</span>}
                    </div>
                    <span className="inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600">
                      {field.type}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Registrations Section */}
        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Registrations</h2>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-[4px] bg-[#232F3E] text-white text-[10px] font-bold px-1.5">
                {totalRegistrations}
              </span>
            </div>
            <Link
              href={`/core/registrations?eventId=${event.id}`}
              className="text-xs font-medium text-[#232F3E] hover:underline"
            >
              View All
            </Link>
          </div>

          {registrations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="pb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="py-2.5 text-slate-700">
                        {reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : '—'}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs">{reg.user?.email || '—'}</td>
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
        <div className="border border-slate-200 bg-white rounded-[8px] shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Announcements</h2>

          {/* Create Announcement Form */}
          <div className="border border-slate-200 rounded-[8px] p-4 mb-4 space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Title</label>
              <input
                type="text"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    title: e.target.value,
                  })
                }
                placeholder="Announcement title"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Message</label>
              <textarea
                rows={3}
                value={announcementForm.message}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    message: e.target.value,
                  })
                }
                placeholder="Announcement message..."
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Type</label>
                <div className="relative">
                  <select
                    value={announcementForm.type}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        type: e.target.value,
                      })
                    }
                    className="appearance-none border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  >
                    <option value="INFO">Info</option>
                    <option value="SUCCESS">Success</option>
                    <option value="WARNING">Warning</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-5">
                <input
                  type="checkbox"
                  checked={announcementForm.sendEmail}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      sendEmail: e.target.checked,
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#232F3E] focus:ring-[#232F3E]"
                />
                <span className="text-[10px] font-medium text-slate-500">Send email</span>
              </label>
            </div>
            <button
              onClick={handleCreateAnnouncement}
              disabled={
                createAnnouncement.isPending ||
                !announcementForm.title.trim() ||
                !announcementForm.message.trim()
              }
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {createAnnouncement.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Announcement
                </>
              )}
            </button>
          </div>

          {/* Existing Announcements */}
          {announcements.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No announcements yet.</p>
          ) : (
            <div className={`space-y-2 ${announcements.length > 3 ? 'max-h-[380px] overflow-y-auto pr-1' : ''}`}>
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-slate-200 rounded-[8px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AnnouncementTypeIcon type={ann.type} />
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-800">{ann.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{ann.message}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{formatDateTime(ann.createdAt)}</span>
                          {ann.sendEmail && (
                            <span className="inline-flex items-center gap-0.5 text-[#232F3E]">
                              <Bell className="h-2.5 w-2.5" />
                              Email sent
                            </span>
                          )}
                        </div>
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
