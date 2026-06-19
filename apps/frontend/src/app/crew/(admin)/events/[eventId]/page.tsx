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
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  List,
} from 'lucide-react';
import type { EventStatus, EventMode, Announcement, EventAgenda, EventSpeaker } from '@/lib/types';

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

function AgendaItem({ item }: { item: EventAgenda }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="shrink-0 mt-0.5">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <List className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
        {item.speaker && (
          <p className="text-xs text-[#FF9900] font-semibold mt-0.5">{item.speaker}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time</span>
        <span className="text-xs font-semibold text-slate-700 block mt-0.5">
          {item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}
        </span>
      </div>
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: EventSpeaker }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow flex-1 min-w-[280px] max-w-[400px]">
      <div className="w-12 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-center shadow-xs">
        {speaker.photo ? (
          <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-slate-400">
            {speaker.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-sm text-slate-800 leading-snug">{speaker.name}</h4>
        {speaker.role && (
          <span className="text-[#FF9900] text-[10px] font-bold uppercase tracking-wider block mt-0.5">
            {speaker.role}
          </span>
        )}
        {speaker.organization && (
          <p className="text-xs text-slate-500 mt-0.5">{speaker.organization}</p>
        )}
        {speaker.bio && (
          <p className="text-slate-500 text-xs mt-1 leading-relaxed font-normal">{speaker.bio}</p>
        )}
      </div>
    </div>
  );
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

  const seatsLeft = event?.capacity ? Math.max(0, event.capacity - totalRegistrations) : null;

  const agenda = event?.agenda || [];
  const speakers = event?.speakers || [];

  if (isLoading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-screen-xl mx-auto space-y-6 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-lg w-48" />
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 flex gap-8">
                <div className="w-[320px] h-[320px] bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg text-center py-20 rounded-xl bg-white border border-slate-200 shadow-sm px-12">
          <p className="text-sm text-slate-500 font-medium">Event not found.</p>
          <Link
            href="/crew/events"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-slate-900 hover:text-[#FF9900] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="w-full max-w-screen-xl mx-auto">

        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link
            href="/crew/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-lg text-xs shadow-sm transition-all duration-150 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150 text-slate-500" />
            <span className="tracking-wide">Back to Events</span>
          </Link>
        </div>

        {/* Single Unified Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Main Content Area */}
          <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Column: Details, Speakers, Agenda, Registrations */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Poster, Title & About */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 md:sticky md:top-6 space-y-6 mx-auto md:mx-0">
                  {/* Poster Container */}
                  {event.posterImage ? (
                    <div className="relative w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                      <img
                        src={event.posterImage}
                        alt={event.title}
                        className="relative z-10 max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Title & About */}
                <div className="flex-1 space-y-6">
                  {/* Event Title Block */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {sc && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${sc.className}`}>
                          {sc.label}
                        </span>
                      )}
                      {mc && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${mc.className}`}>
                          {mc.label}
                        </span>
                      )}
                      {event.category && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border bg-slate-100 text-slate-700 border-slate-200">
                          {event.category}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#232F3E] tracking-tight leading-tight">
                      {event.title}
                    </h1>
                    {event.shortDescription && (
                      <p className="text-slate-500 text-sm font-normal leading-relaxed">
                        {event.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* About Event Description */}
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      About the Event
                    </h3>
                    {event.description ? (
                      <p className="text-slate-600 text-sm font-normal leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 font-medium italic">No description provided.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Speakers Section (Spans the full horizontal width of Left Column) */}
              {speakers.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Event Speakers
                  </h3>
                  <div className="flex flex-row flex-wrap gap-4">
                    {speakers.map((speaker) => (
                      <SpeakerCard key={speaker.id} speaker={speaker} />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Logistics Details (Sticky on desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start lg:border-l lg:border-slate-100 lg:pl-8 space-y-6">

              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450">
                  Event Details
                </h3>

                <div className="space-y-5">
                  {/* Date */}
                  {event.date && (
                    <div className="flex items-start gap-3.5">
                      <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1">{formatDate(event.date)}</span>
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  {event.time && (
                    <div className="flex items-start gap-3.5">
                      <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time & Mode</span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1">
                          {event.time}{event.mode ? ` (${event.mode})` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Venue */}
                  {event.venue && (
                    <div className="flex items-start gap-3.5">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Location / Venue</span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1 leading-snug">{event.venue}</span>
                      </div>
                    </div>
                  )}

                  {/* Registration Deadline */}
                  {event.registrationDeadline && (
                    <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100">
                      <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Registration Deadline</span>
                        <span className="text-sm sm:text-base font-extrabold text-rose-600 block mt-1 leading-snug">
                          {formatDateTime(event.registrationDeadline)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="pt-6 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Capacity</h3>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span>Seats Filled</span>
                  <span>{Math.round(capacityPercent)}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      capacityPercent >= 100 ? 'bg-rose-500' : 'bg-[#FF9900]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, capacityPercent))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                  <span>{totalRegistrations} Registered</span>
                  <span>{seatsLeft !== null ? `${seatsLeft} Seats Available` : 'No limit'}</span>
                </div>
              </div>

              {/* Agenda Quick Summary (Desktop) */}
              {agenda.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Agenda</h3>
                  </div>
                  <div className="space-y-2">
                    {agenda.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-start gap-2.5 text-xs">
                        <span className="text-slate-400 font-bold shrink-0 mt-0.5">{item.startTime}</span>
                        <span className="text-slate-700 font-semibold leading-snug">{item.title}</span>
                      </div>
                    ))}
                    {agenda.length > 4 && (
                      <p className="text-[11px] text-slate-400 font-bold">+{agenda.length - 4} more items</p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Agenda & Announcements parallel container spanning all 12 columns */}
          <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 border-t border-slate-100">
            <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Agenda Section */}
              <div className="space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-455 text-slate-400">
                  Event Agenda
                </h3>
                {agenda.length > 0 ? (
                  <div className={`space-y-3 ${agenda.length > 5 ? 'max-h-[420px] overflow-y-auto pr-1' : ''}`}>
                    {agenda.map((item) => (
                      <AgendaItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium">No agenda posted.</p>
                  </div>
                )}
              </div>

              {/* Announcements Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-455 text-slate-400">
                    Announcements
                  </h3>
                </div>

                {announcements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium">No announcements posted.</p>
                  </div>
                ) : (
                  <div className={`space-y-3 ${announcements.length > 3 ? 'max-h-[380px] overflow-y-auto pr-1' : ''}`}>
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
                            <p className="text-xs text-slate-655 text-slate-600 font-medium leading-relaxed">{ann.message}</p>
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
    </div>
  );
}
