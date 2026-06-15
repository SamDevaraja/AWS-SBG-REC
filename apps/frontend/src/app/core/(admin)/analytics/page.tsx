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

/* ─── Date Formatter Helper ────────────────────────────────────── */
function formatDateLabel(dateStr: string) {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ─── Horizontal Bar Chart Component ───────────────────────────── */
function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {data.map((item) => (
        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF9900' }}>
              {item.value} {item.value === 1 ? 'registration' : 'registrations'}
            </span>
          </div>
          <div style={{ backgroundColor: 'rgba(35,47,62,0.05)', borderRadius: '100px', height: '10px', overflow: 'hidden', position: 'relative' }}>
            <div
              style={{
                background: 'linear-gradient(90deg, #232F3E, #FF9900)',
                height: '100%',
                borderRadius: '100px',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px 0', margin: 0 }}>
          No data available.
        </p>
      )}
    </div>
  );
}

/* ─── Mini Bar Chart Component ─────────────────────────────────── */
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: '5px', height: '110px', paddingBottom: '4px' }}>
      {data.slice(-30).map((item, i) => {
        const heightPct = item.count > 0 ? `${(item.count / maxCount) * 100}%` : '4px';
        const barBg = item.count > 0 ? 'linear-gradient(to top, #232F3E, #FF9900)' : 'rgba(35,47,62,0.06)';
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              position: 'relative',
            }}
            className="group"
          >
            <div
              style={{
                width: '100%',
                background: barBg,
                borderRadius: '3px 3px 0 0',
                transition: 'all 0.3s ease',
                height: heightPct,
                cursor: 'pointer',
              }}
              className="hover:scale-y-105 transition-transform origin-bottom hover:shadow-[0_0_8px_rgba(255,153,0,0.3)]"
            />
            {/* Tooltip */}
            <div
              style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#232F3E',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
              className="group-hover:opacity-100"
            >
              {item.count} ({formatDateLabel(item.date)})
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Analytics Page Component ────────────────────────────── */
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
      { label: 'Total Events', value: stats.totalEvents, icon: Calendar, accent: 'rgba(35,47,62,0.06)' },
      { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, accent: 'rgba(16,185,129,0.10)' },
      { label: 'Total Attendance', value: totalAttendance, icon: CheckCircle, accent: 'rgba(255,153,0,0.10)' },
      {
        label: 'Avg Capacity Utilization',
        value: `${capacityUtilization}%`,
        icon: BarChart3,
        accent: 'rgba(59,130,246,0.08)',
        percentage: capacityUtilization,
      },
    ];
  }, [stats]);

  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'border border-slate-200 bg-slate-50 text-slate-600' },
    PUBLISHED: { label: 'Published', className: 'border border-blue-200 bg-blue-50/50 text-blue-700' },
    REGISTRATION_OPEN: { label: 'Registration Open', className: 'border border-emerald-200 bg-emerald-50/50 text-emerald-700' },
    COMPLETED: { label: 'Completed', className: 'border border-amber-200 bg-amber-50/50 text-amber-700' },
  };

  const statusCardsData = useMemo(() => {
    const counts: Record<string, number> = { DRAFT: 0, PUBLISHED: 0, REGISTRATION_OPEN: 0, COMPLETED: 0 };
    if (eventsByStatus) {
      eventsByStatus.forEach((item) => {
        const statusKey = item.status.toUpperCase();
        if (statusKey in counts) {
          counts[statusKey] = item.count;
        } else if (statusKey === 'ARCHIVED' || statusKey === 'ONGOING') {
          counts['COMPLETED'] = (counts['COMPLETED'] || 0) + item.count;
        }
      });
    }
    return [
      { status: 'DRAFT', count: counts.DRAFT },
      { status: 'PUBLISHED', count: counts.PUBLISHED },
      { status: 'REGISTRATION_OPEN', count: counts.REGISTRATION_OPEN },
      { status: 'COMPLETED', count: counts.COMPLETED },
    ];
  }, [eventsByStatus]);

  const regByEventData = useMemo(() => {
    if (!regsByEvent) return [];
    return regsByEvent.map((e) => ({ label: e.title, value: e.count }));
  }, [regsByEvent]);

  const maxRegByEvent = Math.max(...regByEventData.map((d) => d.value), 1);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient background blur blobs */}
      <div style={{ position: 'fixed', top: '12%', right: '10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,115,187,0.05) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '8%', left: '6%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }} className="space-y-8">
        
        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(255,153,0,0.07),rgba(35,47,62,0.04))', border: '1px solid rgba(255,153,0,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px', marginBottom: 12, boxShadow: '0 2px 12px rgba(255,153,0,0.08)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#F7BA45)', boxShadow: '0 0 6px rgba(255,153,0,0.5)', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin · Analytics</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 600, color: '#232F3E', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Analytics
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: 8 }}>Insights and statistics for your events</p>

          {/* Orange gradient divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF9900 40%, #F7BA45 60%, transparent)', marginTop: 20, borderRadius: 2 }} />
        </div>

        {/* ── Overview Stats Grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '18px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 4px 16px rgba(35,47,62,0.04)', padding: '20px', height: '110px' }}
                  className="animate-pulse flex items-center gap-4"
                >
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(35,47,62,0.05)' }} />
                  <div className="flex-1 space-y-2">
                    <div style={{ height: 24, width: '40%', borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
                    <div style={{ height: 14, width: '70%', borderRadius: 6, background: 'rgba(35,47,62,0.04)' }} />
                  </div>
                </div>
              ))
            : statsCards.map((card) => (
                <div
                  key={card.label}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '18px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 4px 16px rgba(35,47,62,0.04)', padding: '20px', position: 'relative', overflow: 'hidden' }}
                  className="hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-[fadeIn_0.4s_ease-out]"
                >
                  {/* Subtle Glow Corner Accent */}
                  <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: card.accent, filter: 'blur(20px)', pointerEvents: 'none' }} />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div style={{ background: 'rgba(35,47,62,0.05)', border: '1px solid rgba(35,47,62,0.08)', padding: '10px', borderRadius: '12px' }}>
                      <card.icon className="h-5 w-5 text-[#232F3E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '26px', fontWeight: 800, color: '#232F3E', lineHeight: 1, margin: 0 }}>{card.value}</p>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '6px 0 0' }}>{card.label}</p>
                    </div>
                  </div>
                  {card.percentage !== undefined && (
                    <div style={{ marginTop: '14px', position: 'relative', zIndex: 10 }}>
                      <div style={{ width: '100%', backgroundColor: 'rgba(35,47,62,0.05)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            background: 'linear-gradient(90deg, #FF9900, #F7BA45)',
                            height: '100%',
                            borderRadius: '100px',
                            transition: 'all 0.5s ease-out',
                            width: `${card.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>

        {/* ── Registration & Attendance Trends ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Registration Trend */}
          <div
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)', padding: '24px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex items-center gap-2 mb-6">
                <div style={{ background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.2)', padding: '6px', borderRadius: '8px' }}>
                  <TrendingUp className="h-4 w-4 text-[#FF9900]" />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#232F3E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Trend</h2>
              </div>
              
              {regTimeLoading ? (
                <div style={{ height: '110px', background: 'rgba(35,47,62,0.02)', borderRadius: '12px' }} className="animate-pulse" />
              ) : (
                <>
                  <MiniBarChart data={regOverTime ?? []} />
                  <div className="flex justify-between mt-3">
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                      {regOverTime && regOverTime.length > 0 ? formatDateLabel(regOverTime[0]?.date) : '—'}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                      {regOverTime && regOverTime.length > 0
                        ? formatDateLabel(regOverTime[regOverTime.length - 1]?.date)
                        : '—'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Attendance Trend */}
          <div
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)', padding: '24px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex items-center gap-2 mb-6">
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px', borderRadius: '8px' }}>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#232F3E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Trend</h2>
              </div>
              
              {attTimeLoading ? (
                <div style={{ height: '110px', background: 'rgba(35,47,62,0.02)', borderRadius: '12px' }} className="animate-pulse" />
              ) : (
                <>
                  <MiniBarChart data={attOverTime ?? []} />
                  <div className="flex justify-between mt-3">
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                      {attOverTime && attOverTime.length > 0 ? formatDateLabel(attOverTime[0]?.date) : '—'}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                      {attOverTime && attOverTime.length > 0
                        ? formatDateLabel(attOverTime[attOverTime.length - 1]?.date)
                        : '—'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Popular Events ── */}
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 20px 40px rgba(35,47,62,0.06)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.02) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0 }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.01)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#232F3E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Events</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
                    <th style={{ padding: '14px 24px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Event Title</th>
                    <th style={{ padding: '14px 24px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registrations</th>
                    <th style={{ padding: '14px 24px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Capacity Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {popularLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(35,47,62,0.04)' }}>
                        <td style={{ padding: '14px 24px' }}>
                          <div className="animate-pulse" style={{ height: 12, width: '140px', borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div className="animate-pulse" style={{ height: 12, width: '40px', borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div className="animate-pulse" style={{ height: 12, width: '100px', borderRadius: 6, background: 'rgba(35,47,62,0.06)' }} />
                        </td>
                      </tr>
                    ))
                  ) : popularEvents && popularEvents.length > 0 ? (
                    popularEvents.map((event) => {
                      const utilization = event.registrationCount;
                      const maxReg = Math.max(...popularEvents.map((e) => e.registrationCount), 1);
                      const barWidth = (utilization / maxReg) * 100;

                      return (
                        <tr
                          key={event.eventId}
                          style={{ borderBottom: '1px solid rgba(35,47,62,0.04)', transition: 'background-color 0.2s' }}
                          className="hover:bg-amber-500/[0.03]"
                        >
                          <td style={{ padding: '14px 24px', fontWeight: 600, color: '#232F3E' }}>{event.title}</td>
                          <td style={{ padding: '14px 24px', fontWeight: 700, color: '#475569' }}>{event.registrationCount}</td>
                          <td style={{ padding: '14px 24px' }}>
                            <div className="flex items-center gap-3">
                              <div style={{ flex: 1, backgroundColor: 'rgba(35,47,62,0.05)', borderRadius: '100px', height: '8px', maxWidth: '160px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    background: 'linear-gradient(90deg, #FF9900, #F7BA45)',
                                    height: '100%',
                                    borderRadius: '100px',
                                    width: `${barWidth}%`,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#232F3E' }}>
                                {event.registrationCount}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                        No popular events data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Events by Status ── */}
        <div
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)', padding: '24px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#232F3E', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Events by Status</h2>
            
            {statusLoading ? (
              <div style={{ height: '90px', background: 'rgba(35,47,62,0.02)', borderRadius: '12px' }} className="animate-pulse" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {statusCardsData.map((item) => {
                  const config = statusConfig[item.status] ?? {
                    label: item.status,
                    className: 'border border-slate-200 bg-slate-50 text-slate-600',
                  };
                  return (
                    <div
                      key={item.status}
                      style={{ background: '#ffffff', border: '1px solid rgba(35,47,62,0.08)', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(35,47,62,0.02)' }}
                      className="hover:scale-[1.03] hover:shadow-md transition-all duration-300"
                    >
                      <span
                        className={`inline-block rounded-[100px] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${config.className}`}
                      >
                        {config.label}
                      </span>
                      <p style={{ fontSize: '26px', fontWeight: 800, color: '#232F3E', margin: '10px 0 0', lineHeight: 1 }}>{item.count}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Registrations by Event ── */}
        <div
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', border: '1.5px solid rgba(35,47,62,0.08)', boxShadow: '0 8px 32px rgba(35,47,62,0.05)', padding: '24px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(35,47,62,0.025) 1.2px, transparent 1.2px)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0, borderRadius: '24px' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#232F3E', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registrations by Event</h2>
            
            {regByEventLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: '16px', background: 'rgba(35,47,62,0.02)', borderRadius: '8px' }} className="animate-pulse" />
                ))}
              </div>
            ) : (
              <BarChart data={regByEventData} maxVal={maxRegByEvent} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
