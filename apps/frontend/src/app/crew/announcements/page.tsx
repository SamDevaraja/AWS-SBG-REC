'use client';

import { useCrewAnnouncements } from '@/lib/hooks';
import { Megaphone, Calendar, Info, AlertTriangle, CheckCircle } from 'lucide-react';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
    ALERT: 'bg-rose-50 text-rose-700 border-rose-200',
    INFO: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return map[type] || 'bg-slate-50 text-slate-600 border-slate-200';
}

function AnnouncementTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'ALERT':
    case 'WARNING':
      return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    case 'SUCCESS':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'UPDATE':
    case 'INFO':
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

export default function CrewAnnouncementsPage() {
  const { data: announcements, isLoading } = useCrewAnnouncements();

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">Announcements</h1>
          {!isLoading && announcements && announcements.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-[6px] bg-[#232F3E]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#232F3E]">
              {announcements.length}
            </span>
          )}
        </div>

        {/* Info Box */}
        <div className="border border-[#232F3E]/20 bg-white p-4 rounded-[10px] shadow-sm text-xs text-slate-500 leading-normal">
          This channel displays official operational broadcasts and schedule changes sent by the
          event organizers. Announcements are read-only.
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-200 bg-white rounded-[10px] p-5 animate-pulse space-y-3"
              >
                <div className="h-4 w-1/3 bg-slate-100 rounded" />
                <div className="h-3.5 w-full bg-slate-50 rounded" />
                <div className="h-3.5 w-2/3 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white rounded-[10px] p-12 text-center text-slate-400">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No announcements yet</p>
            <p className="text-xs mt-1">
              There are no operational updates broadcasted at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="border border-slate-200 bg-white rounded-[10px] p-5 shadow-sm hover:shadow-md transition flex items-start gap-4"
              >
                <div className="bg-[#232F3E]/5 p-2.5 rounded-[8px] flex-shrink-0 mt-0.5">
                  <AnnouncementTypeIcon type={ann.type} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-slate-800">{ann.title}</h3>
                      {ann.event?.title && (
                        <p className="text-[10px] font-medium text-[#232F3E]">
                          Event: {ann.event.title}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-block rounded-[6px] border px-2 py-0.5 text-[9px] font-semibold uppercase ${typeBadge(
                        ann.type,
                      )}`}
                    >
                      {ann.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ann.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-100">
                    <Calendar className="h-3 w-3" />
                    <span>Published: {formatDate(ann.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
