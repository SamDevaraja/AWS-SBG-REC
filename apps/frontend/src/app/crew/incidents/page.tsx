'use client';

import { useState } from 'react';
import { useCrewEvents, useCrewIncidents, useCreateCrewIncident } from '@/lib/hooks';
import { AlertOctagon, AlertTriangle, Info, Clock, Paperclip, CheckCircle2 } from 'lucide-react';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityConfig(priority: string) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    HIGH: {
      label: 'High Priority',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertOctagon,
    },
    MEDIUM: {
      label: 'Medium Priority',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
    },
    LOW: {
      label: 'Low Priority',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info,
    },
  };
  return (
    map[priority] || {
      label: priority,
      className: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Info,
    }
  );
}

export default function IncidentReportingPage() {
  const { data: events } = useCrewEvents();
  const { data: incidents, isLoading: incidentsLoading } = useCrewIncidents();
  const createIncidentMutation = useCreateCrewIncident();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [eventId, setEventId] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !eventId) return;

    setFormSuccess(false);

    createIncidentMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        eventId,
        attachmentUrl: attachmentUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setPriority('MEDIUM');
          setEventId('');
          setAttachmentUrl('');
          setFormSuccess(true);

          // Hide success message after 5 seconds
          setTimeout(() => setFormSuccess(false), 5000);
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">
            Incident & Issue Reporting
          </h1>
          <p className="text-sm text-slate-500">
            Log operational exceptions, safety concerns, or supply chain bottlenecks on stage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Incident Report Form */}
          <div className="md:col-span-2 space-y-4">
            <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px] space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-[#232F3E]" /> Submit New Incident Report
              </h2>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* Event Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Associated Event *
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  >
                    <option value="">Select event...</option>
                    {(events ?? []).map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Incident Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Short summary (e.g. Projector HDMI cable faulty)"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Detailed Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Explain what happened, potential impacts, and steps taken so far..."
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition resize-none"
                  />
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Priority Level *
                  </label>
                  <div className="flex gap-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 text-center py-2 text-xs font-semibold rounded-[8px] border transition cursor-pointer ${
                          priority === p
                            ? 'bg-[#232F3E] text-white border-[#232F3E]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attachment URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Attachment URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Cloud storage link to photo/log files..."
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-slate-400">* Required fields</div>
                  <button
                    type="submit"
                    disabled={
                      createIncidentMutation.isPending ||
                      !title.trim() ||
                      !description.trim() ||
                      !eventId
                    }
                    className="bg-[#232F3E] text-white hover:bg-[#161e27] rounded-[8px] text-xs font-semibold px-5 py-2.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createIncidentMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>

              {formSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-3.5 rounded-[8px] text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">Incident report submitted successfully.</span>
                </div>
              )}
            </div>
          </div>

          {/* Incident History List */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Submitted Reports</h2>

            <div className="space-y-3">
              {incidentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 bg-white rounded-lg p-4 animate-pulse space-y-2"
                  >
                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    <div className="h-3 w-5/6 bg-slate-50 rounded" />
                  </div>
                ))
              ) : !incidents || incidents.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-white rounded-[10px] p-6 text-center text-xs text-slate-400">
                  No incident reports recorded.
                </div>
              ) : (
                incidents.map((inc) => {
                  const pc = priorityConfig(inc.priority);
                  const Icon = pc.icon;

                  return (
                    <div
                      key={inc.id}
                      className="border border-slate-200 bg-white p-4 shadow-sm rounded-[10px] space-y-2.5 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {inc.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase ${pc.className}`}
                        >
                          <Icon className="h-2.5 w-2.5" /> {inc.priority}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-normal line-clamp-3">
                        {inc.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10px] text-slate-400">
                        {inc.event?.title && (
                          <div className="font-semibold text-[#232F3E] truncate">
                            Event: {inc.event.title}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(inc.createdAt)}</span>
                        </div>
                        {inc.attachmentUrl && (
                          <a
                            href={inc.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[#232F3E] hover:underline pt-0.5"
                          >
                            <Paperclip className="h-3.5 w-3.5" /> Attachment Link
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
