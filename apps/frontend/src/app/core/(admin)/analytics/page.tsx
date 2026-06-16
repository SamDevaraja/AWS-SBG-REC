'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Activity,
  X,
  ClipboardList,
} from 'lucide-react';
import {
  useDashboardStats,
  usePopularEvents,
  useRegistrationsOverTime,
  useAttendanceOverTime,
  useEventsByStatus,
  useRegistrationsByEventStats,
} from '@/lib/hooks';

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatDateLabel(dateStr: string) {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Skeleton({ w = '100%', h = 14 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{ width: w, height: h, borderRadius: 6, background: 'rgba(35,47,62,0.06)' }}
      className="animate-pulse"
    />
  );
}

/* ─── Detailed Bar Chart (for modal) ──────────────────────────── */
function DetailBarChart({
  data,
  color,
}: {
  data: { date: string; count: number }[];
  color: string;
}) {
  const slice = data.slice(-30);
  const maxCount = Math.max(...slice.map((d) => d.count), 1);
  const total = slice.reduce((s, d) => s + d.count, 0);
  const peak = slice.reduce((a, b) => (b.count > a.count ? b : a), slice[0] ?? { date: '', count: 0 });
  const avg = slice.length > 0 ? Math.round(total / slice.length) : 0;

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total (30d)', val: total },
          { label: 'Daily Avg', val: avg },
          { label: 'Peak Day', val: peak?.count ?? 0, sub: peak ? formatDateLabel(peak.date) : '' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              background: 'rgba(35,47,62,0.02)',
              border: '1px solid rgba(35,47,62,0.06)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#232F3E', lineHeight: 1 }}>
                {s.val}
              </span>
              {s.sub && (
                <span style={{ fontSize: 11, fontWeight: 700, color }}>
                  {s.sub}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, marginBottom: 6 }}>
        {slice.map((item, i) => {
          const hPct = item.count > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div
              key={i}
              title={`${item.count} on ${formatDateLabel(item.date)}`}
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
              {/* Tooltip */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#232F3E',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 7px',
                  borderRadius: 5,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.15s',
                  zIndex: 10,
                  marginBottom: 4,
                }}
                className="group-hover:opacity-100"
              >
                {item.count}
                <br />
                <span style={{ fontWeight: 400, opacity: 0.7 }}>{formatDateLabel(item.date)}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: hPct > 0 ? `${hPct}%` : 3,
                  minHeight: 3,
                  borderRadius: '3px 3px 0 0',
                  background:
                    item.count > 0
                      ? `linear-gradient(to top, ${color}, ${color}55)`
                      : 'rgba(35,47,62,0.06)',
                  transition: 'height 0.4s ease',
                }}
                className="group-hover:opacity-80 transition-opacity"
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      {slice.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
            {formatDateLabel(slice[0].date)}
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
            {formatDateLabel(slice[slice.length - 1].date)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Trend Modal ──────────────────────────────────────────────── */
function TrendModal({
  open,
  onClose,
  title,
  icon: Icon,
  color,
  iconBg,
  data,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  data: { date: string; count: number }[];
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: 'min(560px, 92vw)',
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(35,47,62,0.08)',
            background: 'rgba(35,47,62,0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: iconBg,
                border: `1px solid ${color}33`,
                borderRadius: 8,
                padding: 7,
                display: 'flex',
              }}
            >
              <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(35,47,62,0.06)',
              border: 'none',
              borderRadius: 8,
              padding: '5px 5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'background 0.2s',
            }}
            className="hover:bg-slate-100"
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '20px 20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Skeleton w={60} h={24} />
                    <Skeleton w={50} h={10} />
                  </div>
                ))}
              </div>
              <div style={{ height: 160, borderRadius: 8, background: 'rgba(35,47,62,0.04)' }} className="animate-pulse" />
            </div>
          ) : data.length > 0 ? (
            <DetailBarChart data={data} color={color} />
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '32px 0' }}>
              No trend data available yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Horizontal Bar ───────────────────────────────────────────── */
function HBar({ label, value, maxVal }: { label: string; value: number; maxVal: number }) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#232F3E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#FF9900', flexShrink: 0, marginLeft: 8 }}>
          {value}
        </span>
      </div>
      <div style={{ backgroundColor: 'rgba(35,47,62,0.06)', borderRadius: 100, height: 7, overflow: 'hidden' }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #232F3E, #FF9900)',
            height: '100%',
            borderRadius: 100,
            width: `${pct}%`,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Section Card ─────────────────────────────────────────────── */
function Card({
  children,
  title,
  icon: Icon,
  iconColor = '#FF9900',
  iconBg = 'rgba(255,153,0,0.08)',
  noPad = false,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(35,47,62,0.09)',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(35,47,62,0.04)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(35,47,62,0.07)',
          background: 'rgba(35,47,62,0.01)',
        }}
      >
        <div
          style={{
            background: iconBg,
            border: `1px solid ${iconColor}33`,
            borderRadius: 8,
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 14, height: 14, color: iconColor }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#232F3E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </span>
      </div>
      <div style={noPad ? {} : { padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: popularEvents, isLoading: popularLoading } = usePopularEvents();
  const { data: regOverTime, isLoading: regTimeLoading } = useRegistrationsOverTime();
  const { data: attOverTime, isLoading: attTimeLoading } = useAttendanceOverTime();
  const { data: eventsByStatus, isLoading: statusLoading } = useEventsByStatus();
  const { data: regsByEvent, isLoading: regByEventLoading } = useRegistrationsByEventStats();

  const [modal, setModal] = useState<'registrations' | 'attendance' | null>(null);

  /* ── KPI cards ── */
  const kpis = useMemo(() => {
    if (!stats) return null;
    const totalCapacity = stats.recentEvents?.reduce((s, e) => s + (e.capacity ?? 0), 0) ?? 0;
    const capPct = totalCapacity > 0 ? Math.round((stats.totalRegistrations / totalCapacity) * 100) : 0;
    return [
      {
        id: 'events',
        label: 'Total Events',
        value: stats.totalEvents,
        icon: Calendar,
        iconColor: '#0073BB',
        iconBg: 'rgba(0,115,187,0.08)',
        clickable: false,
      },
      {
        id: 'registrations',
        label: 'Total Registrations',
        value: stats.totalRegistrations,
        icon: Users,
        iconColor: '#10b981',
        iconBg: 'rgba(16,185,129,0.08)',
        clickable: true,
      },
      {
        id: 'attendance',
        label: 'Total Attendance',
        value: stats.totalTickets,
        icon: CheckCircle,
        iconColor: '#FF9900',
        iconBg: 'rgba(255,153,0,0.08)',
        pct:
          stats.totalRegistrations > 0
            ? Math.round((stats.totalTickets / stats.totalRegistrations) * 100)
            : 0,
        pctLabel: 'of registrations',
        accent: '#FF9900',
        clickable: true,
      },
      {
        id: 'capacity',
        label: 'Capacity Utilization',
        value: `${capPct}%`,
        icon: BarChart3,
        iconColor: '#8b5cf6',
        iconBg: 'rgba(139,92,246,0.08)',
        pct: capPct,
        pctLabel: 'utilization',
        accent: '#8b5cf6',
        clickable: false,
      },
    ];
  }, [stats]);

  /* ── Status breakdown ── */
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT: { label: 'Draft', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
    PUBLISHED: { label: 'Published', color: '#0073BB', bg: 'rgba(0,115,187,0.08)' },
    REGISTRATION_OPEN: { label: 'Open', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    COMPLETED: { label: 'Completed', color: '#FF9900', bg: 'rgba(255,153,0,0.08)' },
  };

  const statusCards = useMemo(() => {
    const counts: Record<string, number> = { DRAFT: 0, PUBLISHED: 0, REGISTRATION_OPEN: 0, COMPLETED: 0 };
    if (eventsByStatus) {
      eventsByStatus.forEach((item) => {
        const k = item.status.toUpperCase();
        if (k in counts) counts[k] = item.count;
        else if (k === 'ARCHIVED' || k === 'ONGOING') counts['COMPLETED'] += item.count;
      });
    }
    return Object.entries(statusMap).map(([status, cfg]) => ({
      status,
      count: counts[status] ?? 0,
      ...cfg,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsByStatus]);

  /* ── Registrations by event ── */
  const regByEventData = useMemo(() => {
    if (!regsByEvent) return [];
    return regsByEvent.map((e) => ({ label: e.title, value: e.count }));
  }, [regsByEvent]);

  const maxRegByEvent = Math.max(...regByEventData.map((d) => d.value), 1);

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: '#f8f9fb',
          padding: '20px 20px 40px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* ── Page Header ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
            className="max-sm:flex-col max-sm:items-start max-sm:gap-4"
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#232F3E', margin: 0, letterSpacing: '-0.02em' }}>
                Analytics
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Insights and statistics for your events
              </p>
            </div>
            {/* Report Generator Button */}
            <button
              onClick={() => window.location.href = '/core/analytics/report'}
              style={{
                background: '#232F3E',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                border: '1px solid rgba(255, 153, 0, 0.4)',
                borderRadius: 8,
                padding: '9px 18px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(35, 47, 62, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="hover:bg-[#FF9900] hover:text-[#232F3E] hover:border-[#FF9900] active:scale-95 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              Generate Event Report
            </button>
          </div>

          {/* ── KPI Row ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginBottom: 16,
            }}
            className="max-lg:grid-cols-2 max-sm:grid-cols-1"
          >
            {statsLoading || !kpis
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(35,47,62,0.09)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <Skeleton w={30} h={30} />
                    <Skeleton w="40%" h={22} />
                    <Skeleton w="65%" h={10} />
                  </div>
                ))
              : kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    onClick={kpi.clickable ? () => setModal(kpi.id as 'registrations' | 'attendance') : undefined}
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(35,47,62,0.09)',
                      borderRadius: 12,
                      padding: '14px 16px 12px',
                      boxShadow: '0 1px 6px rgba(35,47,62,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      cursor: kpi.clickable ? 'pointer' : 'default',
                    }}
                    className={
                      kpi.clickable
                        ? 'hover:shadow-md hover:ring-1 hover:ring-[rgba(35,47,62,0.12)] transition-all duration-200'
                        : 'hover:shadow-md transition-shadow duration-300'
                    }
                  >
                    {/* Clickable hint badge */}
                    {kpi.clickable && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 10,
                          fontSize: 8,
                          fontWeight: 700,
                          color: kpi.iconColor,
                          background: kpi.iconBg,
                          border: `1px solid ${kpi.iconColor}33`,
                          borderRadius: 100,
                          padding: '2px 6px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        View Trend
                      </div>
                    )}

                    {/* Top row: icon + value */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div
                        style={{
                          background: kpi.iconBg,
                          border: `1px solid ${kpi.iconColor}22`,
                          borderRadius: 8,
                          padding: 7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <kpi.icon style={{ width: 14, height: 14, color: kpi.iconColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#232F3E', lineHeight: 1, margin: 0 }}>
                          {kpi.value}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {kpi.label}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar — always rendered to keep uniform height */}
                    <div style={{ marginTop: 10 }}>
                      {'pct' in kpi && kpi.pct !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 9, color: '#94a3b8' }}>{kpi.pctLabel}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: kpi.iconColor }}>{kpi.pct}%</span>
                        </div>
                      )}
                      <div style={{ background: 'rgba(35,47,62,0.06)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            background: `linear-gradient(90deg, ${kpi.iconColor}bb, ${kpi.iconColor})`,
                            height: '100%',
                            borderRadius: 100,
                            width: `${'pct' in kpi && kpi.pct !== undefined ? Math.min(kpi.pct, 100) : 0}%`,
                            opacity: 'pct' in kpi && kpi.pct !== undefined ? 1 : 0,
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* ── Events by Status ── */}
          <div style={{ marginBottom: 16 }}>
            <Card title="Events by Status" icon={Calendar} iconColor="#0073BB" iconBg="rgba(0,115,187,0.08)">
              {statusLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 12, height: 72, background: 'rgba(35,47,62,0.04)' }} className="animate-pulse" />
                  ))}
                </div>
              ) : (
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}
                  className="max-sm:grid-cols-2"
                >
                  {statusCards.map((s) => (
                    <div
                      key={s.status}
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.color}22`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>
                        {s.count}
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: s.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '6px 0 0' }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Popular Events + Registrations by Event ── */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}
            className="max-lg:grid-cols-1"
          >
            {/* Popular Events Table */}
            <Card title="Popular Events" icon={Users} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.08)" noPad>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(35,47,62,0.07)', background: 'rgba(35,47,62,0.02)' }}>
                      {['Event', 'Registrations', 'Popularity'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {popularLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(35,47,62,0.04)' }}>
                            <td style={{ padding: '11px 16px' }}><Skeleton w="60%" /></td>
                            <td style={{ padding: '11px 16px' }}><Skeleton w={32} /></td>
                            <td style={{ padding: '11px 16px' }}><Skeleton w="80%" /></td>
                          </tr>
                        ))
                      : popularEvents && popularEvents.length > 0
                      ? popularEvents.map((event) => {
                          const maxReg = Math.max(...popularEvents.map((e) => e.registrationCount), 1);
                          const pct = (event.registrationCount / maxReg) * 100;
                          return (
                            <tr
                              key={event.eventId}
                              style={{ borderBottom: '1px solid rgba(35,47,62,0.04)', transition: 'background 0.2s' }}
                              className="hover:bg-slate-50"
                            >
                              <td style={{ padding: '11px 16px', fontWeight: 600, color: '#232F3E', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.title}
                              </td>
                              <td style={{ padding: '11px 16px', fontWeight: 700, color: '#232F3E' }}>
                                {event.registrationCount}
                              </td>
                              <td style={{ padding: '11px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ flex: 1, background: 'rgba(35,47,62,0.06)', borderRadius: 100, height: 6, overflow: 'hidden', maxWidth: 100 }}>
                                    <div
                                      style={{
                                        background: 'linear-gradient(90deg, #FF9900, #F7BA45)',
                                        height: '100%',
                                        borderRadius: 100,
                                        width: `${pct}%`,
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>
                                    {Math.round(pct)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      : (
                        <tr>
                          <td colSpan={3} style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                            No data available
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Registrations by Event */}
            <Card title="Registrations by Event" icon={BarChart3} iconColor="#FF9900" iconBg="rgba(255,153,0,0.08)">
              {regByEventLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Skeleton w="55%" h={12} />
                      <Skeleton w="100%" h={7} />
                    </div>
                  ))}
                </div>
              ) : regByEventData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {regByEventData.map((item) => (
                    <HBar key={item.label} label={item.label} value={item.value} maxVal={maxRegByEvent} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>
                  No data available
                </p>
              )}
            </Card>
          </div>

        </div>
      </div>

      {/* ── Registrations Trend Modal ── */}
      <TrendModal
        open={modal === 'registrations'}
        onClose={() => setModal(null)}
        title="Registration Trend"
        icon={TrendingUp}
        color="#10b981"
        iconBg="rgba(16,185,129,0.08)"
        data={regOverTime ?? []}
        loading={regTimeLoading}
      />

      {/* ── Attendance Trend Modal ── */}
      <TrendModal
        open={modal === 'attendance'}
        onClose={() => setModal(null)}
        title="Attendance Trend"
        icon={Activity}
        color="#FF9900"
        iconBg="rgba(255,153,0,0.08)"
        data={attOverTime ?? []}
        loading={attTimeLoading}
      />
    </>
  );
}
