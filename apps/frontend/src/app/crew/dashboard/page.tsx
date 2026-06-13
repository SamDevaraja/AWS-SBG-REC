'use client';

import Link from 'next/link';
import { QrCode, SearchCheck, CalendarCheck, ListTodo, ShieldAlert, ArrowRight } from 'lucide-react';
import { useCrewDashboard } from '@/lib/hooks';

export default function CrewDashboardPage() {
  const { data, isLoading } = useCrewDashboard();

  const todayEvents = data?.todayEvents ?? [];
  const pendingTasks = data?.pendingTasks ?? [];

  const quickActions = [
    {
      label: 'Scan Ticket',
      href: '/crew/scanner',
      icon: QrCode,
      description: 'Verify and check-in attendee tickets',
    },
    {
      label: 'Verify Registration',
      href: '/crew/verification',
      icon: SearchCheck,
      description: 'Search registrations and details',
    },
    {
      label: 'View Assigned Events',
      href: '/crew/events',
      icon: CalendarCheck,
      description: 'Browse scheduled and active events',
    },
    {
      label: 'Crew Tasks',
      href: '/crew/tasks',
      icon: ListTodo,
      description: 'Track and update assigned crew duties',
    },
    {
      label: 'Report Incident',
      href: '/crew/incidents',
      icon: ShieldAlert,
      description: 'Log operational exceptions or issues',
    },
  ];

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8 select-none">
      <div className="w-full max-w-screen-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-bold text-2xl text-[#B07024] mb-1 font-display">
              Crew Operations Dashboard
            </h1>
            <p className="text-slate-500 max-w-xl text-xs sm:text-sm font-normal">
              Operational control, ticket scanning, task tracking, and check-in management
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 font-display">
            Quick Actions
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="border border-slate-200/80 p-5 rounded-[10px] shadow-sm cursor-pointer flex flex-col gap-3 group hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.15))' }}
              >
                <div className="bg-[#fbeee3] p-3 rounded-[8px] self-start transition text-[#B07024]">
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:underline">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-505 mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider font-display">Today&apos;s Schedule</h2>
              <Link
                href="/crew/events"
                className="text-xs font-semibold text-[#B07024] hover:underline flex items-center gap-1"
              >
                View All Events <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="border border-slate-200 bg-white shadow-sm rounded-[10px] overflow-hidden">
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-5 space-y-2 animate-pulse">
                      <div className="h-4 w-48 bg-slate-100 rounded" />
                      <div className="h-3.5 w-32 bg-slate-50 rounded" />
                    </div>
                  ))
                ) : todayEvents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No events scheduled for today.
                  </div>
                ) : (
                  todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-slate-850">{event.title}</h3>
                        <p className="text-xs text-slate-505">
                          {event.venue} • {event.time || 'All Day'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500 mr-1">
                          {event._count?.registrations ?? 0} registered
                        </span>

                        {((event.status as string) === 'COMPLETED' || (event.status as string) === 'ENDED') ? (
                          <div className="completed-stamp animate-stamp select-none scale-50 rotate-[-12deg] pointer-events-none opacity-90">
                            Completed
                          </div>
                        ) : (
                          <Link
                            href={`/crew/scanner?eventId=${event.id}`}
                            className="bg-[#232F3E] text-white hover:bg-[#161e27] text-xs font-medium px-3.5 py-1.5 rounded-[6px] shadow-sm transition flex items-center gap-1.5"
                          >
                            <QrCode className="h-3.5 w-3.5" /> Scan QR
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Assigned Crew Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider font-display">Assigned Tasks</h2>
              <Link
                href="/crew/tasks"
                className="text-xs font-semibold text-[#B07024] hover:underline flex items-center gap-1"
              >
                Go to Tasks Page <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="border border-slate-200 bg-white shadow-sm rounded-[10px] overflow-hidden">
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2 animate-pulse">
                      <div className="h-3.5 w-36 bg-slate-100 rounded" />
                      <div className="h-3 w-56 bg-slate-50 rounded" />
                    </div>
                  ))
                ) : pendingTasks.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No pending operational tasks. Excellent job!
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 flex items-start gap-3 hover:bg-slate-50/50 transition"
                    >
                      <div className="mt-0.5">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-slate-800">{task.title}</h4>
                        <p className="text-xs text-slate-500">{task.description}</p>
                        {task.event?.title && (
                          <span className="inline-block text-[10px] font-medium text-[#B07024] bg-[#FDF2E9] border border-[#B07024]/10 px-1.5 py-0.5 rounded mt-1.5">
                            {task.event.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
