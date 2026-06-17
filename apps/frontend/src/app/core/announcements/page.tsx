'use client';

import { useState, useMemo } from 'react';
import {
  useEvents,
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from '@/lib/hooks';
import { Megaphone, ChevronDown, Trash2, Mail, Calendar } from 'lucide-react';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'bg-blue-100 text-blue-700',
    REMINDER: 'bg-amber-100 text-amber-700',
    SCHEDULE_CHANGE: 'bg-rose-100 text-rose-700',
  };
  return map[type] || 'bg-slate-100 text-slate-600';
}

function typeLabel(type: string) {
  return type.replace(/_/g, ' ');
}

function EmptyState() {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="border border-dashed border-slate-300 rounded-[10px] p-12 text-center">
      <div className="mx-auto bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <Megaphone className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-800 mb-1">No announcements found</h3>
      <p className="text-xs text-slate-500">
        Select an event or create a new announcement to get started.
      </p>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('UPDATE');
  const [sendEmail, setSendEmail] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: eventsData } = useEvents({ limit: 200 });
  const events = eventsData?.data ?? [];

  const { data: announcements, isLoading: announcementsLoading } = useAnnouncements(
    selectedEventId || '',
  );

  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    return [...announcements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [announcements]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEventId || !title.trim() || !message.trim()) return;

    createMutation.mutate(
      {
        eventId: selectedEventId,
        title: title.trim(),
        message: message.trim(),
        type,
        sendEmail,
      },
      {
        onSuccess: () => {
          setTitle('');
          setMessage('');
          setType('UPDATE');
          setSendEmail(false);
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
  }

  function getEventName(eventId: string): string {
    const event = events.find((e) => e.id === eventId);
    return event?.title ?? 'Unknown Event';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)", borderRadius: '24px', padding: '24px', marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              {/* Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin · Announcements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                  Announcements
                </h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(35,47,62,0.07)', border: '1px solid rgba(35,47,62,0.1)', borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 800, color: '#232F3E' }}>
                  {filteredAnnouncements.length}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>
                Create and manage event announcements for attendees.
              </p>
            </div>
          </div>
          {/* Orange divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </div>

        {/* Create Announcement Form */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Create Announcement</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Event Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Event *</label>
                <div className="relative">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  >
                    <option value="">Select an event</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Announcement title"
                  className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  placeholder="Write your announcement message..."
                  className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Type</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  >
                    <option value="UPDATE">Update</option>
                    <option value="REMINDER">Reminder</option>
                    <option value="SCHEDULE_CHANGE">Schedule Change</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Send Email Toggle */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#232F3E] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Send Email
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={
                  createMutation.isPending || !selectedEventId || !title.trim() || !message.trim()
                }
                className="bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-5 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>

        {/* Announcements List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Announcements</h2>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              >
                <option value="">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {announcementsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5 animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 rounded bg-slate-100" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="h-5 w-16 rounded-[6px] bg-slate-100" />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {announcement.title}
                        </h3>
                        <span
                          className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${typeBadge(announcement.type)}`}
                        >
                          {typeLabel(announcement.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(announcement.createdAt)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {getEventName(announcement.eventId)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3">
                      {deleteConfirmId === announcement.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-rose-600 text-white rounded-[8px] text-[10px] font-medium px-2.5 py-1 hover:bg-rose-700 transition disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="border border-slate-200 rounded-[8px] text-[10px] font-medium px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(announcement.id)}
                          className="p-1.5 rounded-[8px] hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {announcement.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
