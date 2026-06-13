'use client';

import Link from 'next/link';
import { CalendarPlus, Users, Ticket, BarChart3, ArrowRight } from 'lucide-react';
import { useEvents } from '@/lib/hooks';
import type { EventStatus } from '@/lib/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusConfig(status: EventStatus) {
  const map: Record<EventStatus, { label: string; className: string }> = {
    DRAFT: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-600',
    },
    PUBLISHED: {
      label: 'Published',
      className: 'bg-blue-100 text-blue-700',
    },
    REGISTRATION_OPEN: {
      label: 'Registration Open',
      className: 'bg-emerald-100 text-emerald-700',
    },
    REGISTRATION_CLOSED: {
      label: 'Registration Closed',
      className: 'bg-amber-100 text-amber-700',
    },
    ONGOING: {
      label: 'Ongoing',
      className: 'bg-blue-100 text-blue-700',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-slate-100 text-slate-600',
    },
    ARCHIVED: {
      label: 'Archived',
      className: 'bg-slate-100 text-slate-600',
    },
  };
  return map[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
}

export default function DashboardPage() {
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const quickActions = [
    {
      label: 'Create Event',
      href: '/events/create',
      icon: CalendarPlus,
    },
    {
      label: 'View Registrations',
      href: '/registrations',
      icon: Users,
    },
    {
      label: 'View Tickets',
      href: '/tickets',
      icon: Ticket,
    },
    {
      label: 'View Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
  ];

  const recentEvents = eventsData?.data ?? [];

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-xl mx-auto space-y-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-semibold text-2xl text-slate-900 mb-1 font-display">
              Event Management Dashboard
            </h1>
            <p className="text-slate-500 max-w-xl text-xs sm:text-sm font-normal">
              Manage events, registrations, and attendees
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 font-display">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="border border-slate-200 bg-white p-4 shadow-sm rounded-[10px] premium-glow-container transition cursor-pointer text-center group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-[#232F3E]/10 p-2.5 rounded-[8px] group-hover:bg-[#232F3E]/15 transition">
                    <action.icon className="h-5 w-5 text-[#232F3E]" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900 font-display">Recent Events</h2>
            <Link
              href="/events"
              className="text-xs font-medium text-[#232F3E] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="border border-slate-200 bg-white shadow-sm rounded-[10px] overflow-hidden premium-glow-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Registrations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventsLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-5 py-3">
                            <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                          </td>
                          <td className="px-5 py-3">
                            <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                          </td>
                          <td className="px-5 py-3">
                            <div className="h-5 w-20 rounded-[6px] bg-slate-100 animate-pulse" />
                          </td>
                          <td className="px-5 py-3">
                            <div className="h-4 w-10 rounded bg-slate-100 animate-pulse" />
                          </td>
                        </tr>
                      ))
                    : recentEvents.map((event) => {
                        const sc = statusConfig(event.status);
                        return (
                          <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800">{event.title}</td>
                            <td className="px-5 py-3 text-slate-500 text-xs">
                              {event.date ? formatDate(event.date) : '—'}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-semibold uppercase ${sc.className}`}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600 text-xs">
                              {event.registrations?.length ?? 0}
                            </td>
                          </tr>
                        );
                      })}
                  {!eventsLoading && recentEvents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400">
                        No events found. Create your first event to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
