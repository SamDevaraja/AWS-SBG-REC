'use client';

import { useCrewTasks, useUpdateCrewTaskStatus } from '@/lib/hooks';
import { Play, Check, RotateCcw } from 'lucide-react';

export default function CrewTasksPage() {
  const { data: tasks, isLoading } = useCrewTasks();
  const updateTaskMutation = useUpdateCrewTaskStatus();

  function handleStatusChange(taskId: string, newStatus: string) {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  }

  const pendingTasks = (tasks ?? []).filter((t) => t.status === 'PENDING');
  const inProgressTasks = (tasks ?? []).filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = (tasks ?? []).filter((t) => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">
            Operational Crew Tasks
          </h1>
          <p className="text-sm text-slate-500">
            Track and update assigned crew duties, logistics tasks, and speaker coordination.
          </p>
        </div>

        {/* Task Columns Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Column 1: Pending */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Pending ({isLoading ? 0 : pendingTasks.length})
              </h2>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 bg-white rounded-lg p-4 animate-pulse space-y-2"
                  >
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                  </div>
                ))
              ) : pendingTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                  No pending tasks
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 bg-white p-4 shadow-sm rounded-lg hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-800">{task.title}</h3>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {task.description}
                        </p>
                      )}
                      {task.event?.title && (
                        <span className="inline-block text-[9px] font-semibold text-[#232F3E] bg-[#232F3E]/5 px-1.5 py-0.5 rounded">
                          {task.event.title}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 bg-[#232F3E]/10 hover:bg-[#232F3E]/15 text-[#232F3E] text-[10px] font-semibold px-2.5 py-1.5 rounded transition cursor-pointer"
                      >
                        <Play className="h-3 w-3" /> Start
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                In Progress ({isLoading ? 0 : inProgressTasks.length})
              </h2>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 bg-white rounded-lg p-4 animate-pulse space-y-2"
                  >
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                  </div>
                ))
              ) : inProgressTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                  No tasks currently in progress
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-[#232F3E]/20 bg-white p-4 shadow-sm rounded-lg hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-800">{task.title}</h3>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {task.description}
                        </p>
                      )}
                      {task.event?.title && (
                        <span className="inline-block text-[9px] font-semibold text-[#232F3E] bg-[#232F3E]/5 px-1.5 py-0.5 rounded">
                          {task.event.title}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                      <button
                        onClick={() => handleStatusChange(task.id, 'PENDING')}
                        className="inline-flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-semibold px-2 py-1.5 rounded transition cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Stop
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1 bg-[#232F3E] text-white hover:bg-[#161e27] text-[10px] font-semibold px-2.5 py-1.5 rounded shadow-sm transition cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Complete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed ({isLoading ? 0 : completedTasks.length})
              </h2>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 bg-white rounded-lg p-4 animate-pulse space-y-2"
                  >
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                  </div>
                ))
              ) : completedTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                  No completed tasks
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 bg-slate-50/50 p-4 rounded-lg flex flex-col justify-between opacity-80"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-500 line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {task.description}
                        </p>
                      )}
                      {task.event?.title && (
                        <span className="inline-block text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {task.event.title}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-end gap-1.5">
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 bg-slate-200/50 hover:bg-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-1.5 rounded transition cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Re-open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
