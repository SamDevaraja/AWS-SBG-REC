'use client';

import dynamic from 'next/dynamic';
import React from 'react';

function ChartSpinner() {
  return (
    <div className="w-full h-[220px] flex items-center justify-center text-sm text-foreground/40 font-medium animate-pulse">
      Loading chart...
    </div>
  );
}

function ModalSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MotionSpinner() {
  return <div className="animate-pulse" />;
}

export const DynamicAnalyticsCharts = dynamic(
  () => import('./AnalyticsCharts').then(mod => ({
    default: mod.PointsProgressChart,
  })),
  { ssr: false, loading: ChartSpinner }
);

export const DynamicParticipationChart = dynamic(
  () => import('./AnalyticsCharts').then(mod => ({
    default: mod.ParticipationTrendChart,
  })),
  { ssr: false, loading: ChartSpinner }
);

export const DynamicAchievementChart = dynamic(
  () => import('./AnalyticsCharts').then(mod => ({
    default: mod.AchievementDistributionChart,
  })),
  { ssr: false, loading: ChartSpinner }
);

export const DynamicTicketDetailsModal = dynamic(
  () => import('./TicketDetailsModal'),
  { ssr: false, loading: ModalSpinner }
);

export const DynamicHeroBanner = dynamic(
  () => import('./HeroBanner'),
  { ssr: false, loading: MotionSpinner }
);

export const DynamicMeshBackground = dynamic(
  () => import('./MeshBackground').then(mod => ({ default: mod.MeshBackground })),
  { ssr: false, loading: () => null }
);

export const DynamicCalendarCard = dynamic(
  () => import('./CalendarCard'),
  { ssr: false, loading: ChartSpinner }
);

export const DynamicGlassCard = dynamic(
  () => import('./GlassCard'),
  { ssr: false, loading: MotionSpinner }
);
