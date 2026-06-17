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

          // Hide success message after 2 seconds
          setTimeout(() => setFormSuccess(false), 2000);
        },
      },
    );
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col space-y-4 py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Header Row */}
      <div style={{ background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)" }} className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] border border-white/50 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#232F3E] font-display">
              Incident & Issue Reporting
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Log operational exceptions, safety concerns, or supply chain bottlenecks on stage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 flex-1 min-h-0">
        {/* Incident Report Form */}
        <div className="md:col-span-2 flex flex-col min-h-0">
          <div className="bg-white/45 backdrop-blur-md rounded-[20px] border border-white/50 shadow-sm p-5 flex flex-col flex-1 min-h-0">
            <h2 className="shrink-0 text-sm font-bold text-[#232F3E] flex items-center gap-2 mb-4">
              <AlertOctagon className="h-4 w-4 text-brand-orange" /> Submit New Incident Report
            </h2>

            <form onSubmit={handleReportSubmit} className="flex-1 flex flex-col gap-4 pb-1">
              {/* Event & Title Row */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Associated Event *
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-[8px] text-[13px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all shadow-sm"
                  >
                    <option value="">Select event...</option>
                    {(events ?? []).map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Incident Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Projector cable faulty"
                    className="w-full bg-white border border-slate-200 rounded-[8px] text-[13px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 flex flex-col space-y-1 min-h-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 shrink-0">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Explain what happened, potential impacts, and steps taken so far..."
                  className="w-full flex-1 bg-white border border-slate-200 rounded-[8px] text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all shadow-sm resize-none"
                />
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Priority Level *
                </label>
                <div className="flex gap-2">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-[11px] font-bold flex items-center justify-center gap-1.5 rounded-[8px] transition-all duration-300 border-2 ${
                        priority === p
                          ? 'border-brand-orange bg-brand-orange/10 text-[#232F3E] shadow-sm'
                          : 'border-white/60 bg-white/40 text-slate-500 hover:border-brand-orange/30 hover:bg-white/60'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attachment URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Attachment URL (Optional)
                </label>
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Cloud storage link to photo/log files..."
                  className="w-full bg-white border border-slate-200 rounded-[8px] text-[13px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all shadow-sm"
                />
              </div>

              {/* Submit button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-4 pb-2">
                <div className="text-[10px] font-medium text-slate-400 ml-1">* Required fields</div>
                <button
                  type="submit"
                  disabled={
                    createIncidentMutation.isPending ||
                    !title.trim() ||
                    !description.trim() ||
                    !eventId
                  }
                  className="w-full sm:w-auto bg-brand-orange text-black hover:bg-brand-orange/95 rounded-[10px] font-bold px-6 py-2.5 shadow-md shadow-brand-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                >
                  {createIncidentMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>

              {formSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-[10px] text-xs flex items-center gap-2 shadow-sm mt-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">Incident report submitted successfully.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Incident History List */}
        <div className="flex flex-col min-h-0">
          <div className="bg-white/45 backdrop-blur-md rounded-[20px] border border-white/50 shadow-sm p-5 flex flex-col flex-1 min-h-0">
            <h2 className="shrink-0 text-sm font-bold text-[#232F3E] mb-4">Submitted Reports</h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {incidentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-white/60 bg-white/60 rounded-[12px] p-4 animate-pulse space-y-2.5"
                  >
                    <div className="h-3 w-1/2 bg-slate-200/50 rounded" />
                    <div className="h-2.5 w-5/6 bg-slate-100 rounded" />
                  </div>
                ))
              ) : !incidents || incidents.length === 0 ? (
                <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="border-2 border-dashed border-slate-300 rounded-[14px] min-h-[120px] flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-xs font-medium text-slate-500">No incident reports recorded.</p>
                </div>
              ) : (
                incidents.map((inc) => {
                  const pc = priorityConfig(inc.priority);
                  const Icon = pc.icon;

                  return (
                    <div
                      key={inc.id}
                      className="border border-slate-200 bg-white p-4 shadow-sm rounded-[14px] space-y-2 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-[#232F3E] leading-tight group-hover:text-brand-orange transition-colors">
                          {inc.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 border rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold uppercase shrink-0 ${pc.className}`}
                        >
                          <Icon className="h-2.5 w-2.5" /> {inc.priority}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {inc.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[10px] font-medium text-slate-500">
                        {inc.event?.title && (
                          <div className="text-[#232F3E] truncate">
                            <span className="text-slate-400">Event:</span> {inc.event.title}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{formatDate(inc.createdAt)}</span>
                        </div>
                        {inc.attachmentUrl && (
                          <a
                            href={inc.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-orange hover:text-brand-orange/80 transition-colors pt-0.5"
                          >
                            <Paperclip className="h-3 w-3" /> View Attachment
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
