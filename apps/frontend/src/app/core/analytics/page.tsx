'use client';

import { useMemo } from 'react';
import { Calendar, Users, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import {
  useDashboardStats,
  usePopularEvents,
  useRegistrationsOverTime,
  useAttendanceOverTime,
  useEventsByStatus,
  useRegistrationsByEventStats,
} from '@/lib/hooks';

function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-600 w-24 truncate text-right">{item.label}</span>
          <div className="flex-1 bg-slate-100 rounded-[6px] h-6 overflow-hidden">
            <div
              className="bg-[#232F3E] h-full rounded-[6px] transition-all"
              style={{ width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-700 w-8">{item.value}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">No data available.</p>
      )}
    </div>
  );
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {data.slice(-10).map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[#232F3E] rounded-t transition-all"
            style={{
              height: `${(item.count / maxCount) * 100}%`,
              minHeight: item.count > 0 ? '4px' : '0',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: popularEvents, isLoading: popularLoading } = usePopularEvents();
  const { data: regOverTime, isLoading: regTimeLoading } = useRegistrationsOverTime();
  const { data: attOverTime, isLoading: attTimeLoading } = useAttendanceOverTime();
  const { data: eventsByStatus, isLoading: statusLoading } = useEventsByStatus();
  const { data: regsByEvent, isLoading: regByEventLoading } = useRegistrationsByEventStats();

  const statsCards = useMemo(() => {
    if (!stats) return [];
    const totalCapacity = stats.recentEvents?.reduce((sum, e) => sum + (e.capacity ?? 0), 0) ?? 0;
    const capacityUtilization =
      totalCapacity > 0 ? Math.round((stats.totalRegistrations / totalCapacity) * 100) : 0;
    const totalAttendance = stats.totalTickets;

    return [
      { label: 'Total Events', value: stats.totalEvents, icon: Calendar },
      { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users },
      { label: 'Total Attendance', value: totalAttendance, icon: CheckCircle },
      {
        label: 'Avg Capacity Utilization',
        value: `${capacityUtilization}%`,
        icon: BarChart3,
        percentage: capacityUtilization,
      },
    ];
  }, [stats]);

  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    PUBLISHED: { label: 'Published', className: 'bg-blue-100 text-blue-700' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
  };

  const regByEventData = useMemo(() => {
    if (!regsByEvent) return [];
    return regsByEvent.map((e) => ({ label: e.title, value: e.count }));
  }, [regsByEvent]);

  const maxRegByEvent = Math.max(...regByEventData.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Insights and statistics for your events</p>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px] animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-7 w-16 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))
            : statsCards.map((card) => (
                <div
                  key={card.label}
                  className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#232F3E]/10 p-2.5 rounded-[8px]">
                      <card.icon className="h-5 w-5 text-[#232F3E]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{card.label}</p>
                    </div>
                  </div>
                  {card.percentage !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-[#232F3E] h-2 rounded-full transition-all"
                          style={{ width: `${card.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>

        {/* Registration & Attendance Trends */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Registration Trend */}
          <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-[#232F3E]" />
              <h2 className="text-sm font-semibold text-slate-800">Registration Trend</h2>
            </div>
            {regTimeLoading ? (
              <div className="h-24 bg-slate-50 rounded animate-pulse" />
            ) : (
              <>
                <MiniBarChart data={regOverTime ?? []} />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-400">
                    {regOverTime && regOverTime.length > 0 ? regOverTime[0]?.date : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {regOverTime && regOverTime.length > 0
                      ? regOverTime[regOverTime.length - 1]?.date
                      : '—'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Attendance Trend */}
          <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-[#232F3E]" />
              <h2 className="text-sm font-semibold text-slate-800">Attendance Trend</h2>
            </div>
            {attTimeLoading ? (
              <div className="h-24 bg-slate-50 rounded animate-pulse" />
            ) : (
              <>
                <MiniBarChart data={attOverTime ?? []} />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-400">
                    {attOverTime && attOverTime.length > 0 ? attOverTime[0]?.date : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {attOverTime && attOverTime.length > 0
                      ? attOverTime[attOverTime.length - 1]?.date
                      : '—'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Popular Events */}
        <div className="border border-slate-200 bg-white shadow-sm rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Popular Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Event Title
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Registrations
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Capacity Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popularLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3">
                        <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-10 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : popularEvents && popularEvents.length > 0 ? (
                  popularEvents.map((event) => {
                    const utilization = event.registrationCount;
                    const maxReg = Math.max(...popularEvents.map((e) => e.registrationCount), 1);
                    const barWidth = (utilization / maxReg) * 100;

                    return (
                      <tr key={event.eventId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">{event.title}</td>
                        <td className="px-5 py-3 text-slate-600">{event.registrationCount}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                              <div
                                className="bg-[#232F3E] h-2 rounded-full"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">
                              {event.registrationCount}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-xs text-slate-400">
                      No popular events data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Events by Status */}
        <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Events by Status</h2>
          {statusLoading ? (
            <div className="h-20 bg-slate-50 rounded animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(eventsByStatus ?? []).map((item) => {
                const config = statusConfig[item.status] ?? {
                  label: item.status,
                  className: 'bg-slate-100 text-slate-600',
                };
                return (
                  <div
                    key={item.status}
                    className="border border-slate-200 rounded-[10px] p-4 text-center"
                  >
                    <span
                      className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${config.className}`}
                    >
                      {config.label}
                    </span>
                    <p className="text-2xl font-bold text-slate-800 mt-2">{item.count}</p>
                  </div>
                );
              })}
              {(!eventsByStatus || eventsByStatus.length === 0) && (
                <p className="col-span-full text-xs text-slate-400 text-center py-4">
                  No status data available.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Registrations by Event */}
        <div className="border border-slate-200 bg-white p-5 shadow-sm rounded-[10px]">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Registrations by Event</h2>
          {regByEventLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-slate-50 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <BarChart data={regByEventData} maxVal={maxRegByEvent} />
          )}
        </div>
      </div>
    </div>
  );
}
