"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  User, 
  Shield, 
  Check, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ShieldCheck,
  CalendarDays,
  Award,
  Cpu,
  MessageSquare,
  Map as MapIcon,
  Power,
  Clock
} from "lucide-react";

// User context & API imports
import { UserProvider, useUser } from "@/lib/user-context";
import { workspaceApi as api } from "@/lib/workspace-api";
import { formatDate } from "@/lib/utils";

// Workspace Layout
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

// Temporary Access Control Types
interface PermissionState {
  id: string;
  permission: string;
  expiresAt: string;
  grantedAt: string;
  grantedById: string;
  grantedByName: string;
}

interface TemporaryCrewMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: {
    photo?: string | null;
    initials: string;
    color: string;
  };
  isActive: boolean;
  permissions: PermissionState[];
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

// Helper to parse event name and description from task notes
function parseTaskNotes(notes: string | null | undefined) {
  if (!notes) return { eventName: "", description: "" };
  if (notes.startsWith("Event: ")) {
    const index = notes.indexOf("\nDescription: ");
    if (index !== -1) {
      const eventName = notes.substring(7, index).trim();
      const description = notes.substring(index + 14).trim();
      return { eventName, description };
    } else {
      return { eventName: notes.substring(7).trim(), description: "" };
    }
  }
  return { eventName: "", description: notes };
}

// Permissions Metadata mapping
const SECURITY_MODULES = [
  { 
    key: "create_event", 
    label: "Events Space Elevation", 
    desc: "Redirects Crew operator to Core event space with create/delete capabilities.",
    icon: CalendarDays,
    color: "from-amber-500 to-orange-600"
  },
  { 
    key: "view_analytics", 
    label: "Certifications Addition", 
    desc: "Unlocks core certifications creation & deletion panel on the certifications page.",
    icon: Award,
    color: "from-blue-500 to-indigo-600"
  },
  { 
    key: "edit_event", 
    label: "Services Hub Admin", 
    desc: "Allows Crew to add regions, edit presence nodes and configure service mesh parameters.",
    icon: Cpu,
    color: "from-teal-500 to-emerald-600"
  },
  { 
    key: "manage_announcements", 
    label: "Roadmap Builder Access", 
    desc: "Allows creating, updating, and deleting curriculum topics & modules on roadmap pages.",
    icon: MapIcon,
    color: "from-violet-500 to-fuchsia-600"
  },
  { 
    key: "scan_ticket", 
    label: "Chats Response Privileges", 
    desc: "Allows viewing unhandled enthusiast queries and answering/adding them to the FAQ KB.",
    icon: MessageSquare,
    color: "from-sky-500 to-cyan-600"
  }
];

function AccessControlDashboard() {
  const { currentUser, users, setCurrentUserById, isLoading: userContextLoading } = useUser();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("Access Directory");

  // Data lists
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Overlay states
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  // Crew & Permission States
  const [tempCrew, setTempCrew] = useState<TemporaryCrewMember[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Selected Crew Member State
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>("");
  const [selectedCrewTasks, setSelectedCrewTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  // Task Form States
  const [taskName, setTaskName] = useState("");
  const [taskEventName, setTaskEventName] = useState("");
  const [taskPriority, setTaskPriority] = useState<string>("medium");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assigningTask, setAssigningTask] = useState(false);

  const isCore = currentUser?.role === "core";

  // Available tabs based on active developer identity role
  const workspaceTabs = useMemo(() => {
    if (isCore) {
      return ["Access Directory", "Security Audit Logs"];
    } else {
      return ["My Active Permissions"];
    }
  }, [isCore]);

  // Handle identity switch - default to appropriate primary view
  useEffect(() => {
    setActiveTab(isCore ? "Access Directory" : "My Active Permissions");
    setIsWorkspaceMenuOpen(false);
    // Reset selection when role switches
    setSelectedCrewMemberId("");
    setSelectedCrewTasks([]);
  }, [currentUser, isCore]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load temporary permissions list
  const loadPermissionsData = async () => {
    try {
      setLoadingPermissions(true);
      setPermissionsError(null);
      const res = await fetch("/api/auth/permissions");
      if (!res.ok) {
        throw new Error("Failed to query permissions database.");
      }
      const data = await res.json();
      if (data.success) {
        setTempCrew(data.crew || []);
      } else {
        throw new Error(data.error || "Failed to load delegation dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setPermissionsError(err.message || "Failed to sync connection.");
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Core API loader
  const loadWorkspaceData = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      if (isCore) {
        const logs = await api.getSecurityLogs();
        setSecurityLogs(logs);
        await loadPermissionsData();
      } else {
        await loadPermissionsData();
      }
    } catch (err) {
      console.error("Failed to load workspace data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [currentUser]);

  // Load assigned tasks when target crew member is selected
  const loadAssignedTasks = async (memberId: string) => {
    if (!memberId) {
      setSelectedCrewTasks([]);
      return;
    }
    try {
      setLoadingTasks(true);
      const res = await api.getTasks({ assigneeId: memberId });
      setSelectedCrewTasks(res?.data || []);
    } catch (err) {
      console.error("Failed to load tasks for crew member:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isCore && selectedCrewMemberId) {
      loadAssignedTasks(selectedCrewMemberId);
    }
  }, [selectedCrewMemberId, isCore]);

  // Toggle permission handler
  const handleTogglePermission = async (userId: string, permission: string, currentEnabled: boolean) => {
    const key = `${userId}_${permission}`;
    try {
      setTogglingKey(key);
      if (currentEnabled) {
        const res = await fetch(`/api/auth/permissions?userId=${userId}&permission=${permission}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser?.id || ""
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to revoke permission.");
        }
        showToast("Security access revoked.", "success");
      } else {
        const res = await fetch("/api/auth/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser?.id || ""
          },
          body: JSON.stringify({
            userId,
            permission,
            durationMinutes: 52560000, // 100 years, effectively no time limit
            grantedById: currentUser?.id || null
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to grant permission.");
        }
        showToast("Elevated authority granted permanently.", "success");
      }
      // Reload workspace and logs
      await loadWorkspaceData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Action failed.", "error");
    } finally {
      setTogglingKey(null);
    }
  };

  // Task Assign Form Submission
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewMemberId) {
      showToast("Please select a crew member first.", "error");
      return;
    }
    if (!taskName.trim()) {
      showToast("Task name is required.", "error");
      return;
    }
    if (!taskEventName.trim()) {
      showToast("Event name is required.", "error");
      return;
    }
    if (!taskDeadline) {
      showToast("Deadline is required.", "error");
      return;
    }

    try {
      setAssigningTask(true);
      await api.createTask({
        name: taskName.trim(),
        category: "during_event", // default enum category compatibility
        priority: taskPriority as any,
        assignedToId: selectedCrewMemberId,
        dueDate: new Date(taskDeadline).toISOString(),
        notes: `Event: ${taskEventName.trim()}\nDescription: ${taskDescription.trim() || 'No description provided.'}`
      });

      showToast(`Task assigned & announcement posted!`, "success");
      
      // Reset task fields
      setTaskName("");
      setTaskEventName("");
      setTaskDescription("");
      setTaskDeadline("");
      
      // Refresh task assignments and workspace security logs
      await loadAssignedTasks(selectedCrewMemberId);
      const logs = await api.getSecurityLogs();
      setSecurityLogs(logs);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to assign task.", "error");
    } finally {
      setAssigningTask(false);
    }
  };

  // Memoized current selection target crew member
  const selectedCrewMember = useMemo(() => {
    return tempCrew.find(c => c.id === selectedCrewMemberId);
  }, [tempCrew, selectedCrewMemberId]);

  // Find current user's active permissions for Crew view
  const myCrewObject = useMemo(() => {
    return tempCrew.find(m => m.id === currentUser?.id);
  }, [tempCrew, currentUser]);

  if (userContextLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF9900] border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Configuring Workspace Identity...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-6 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md animate-[fadeIn_0.2s_ease-out] ${
          toast.type === "success"
            ? "bg-emerald-50/95 text-emerald-800 border-emerald-100"
            : "bg-red-50/95 text-red-800 border-red-100"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
          <p className="text-[10px] font-extrabold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      <div className="space-y-6 relative z-10">
        
        {/* Workspace Toolbar Context Control Row */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5 flex-wrap gap-4 bg-white/40 p-4 rounded-2xl backdrop-blur-xs border shadow-xs relative z-50">
          <div className="flex items-center gap-3 relative">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white shadow-sm font-bold text-xs text-slate-800">
              {currentUser?.role === "core" ? (
                <Shield size={14} className="text-[#FF9900]" />
              ) : (
                <User size={14} className="text-slate-500" />
              )}
              <span>
                {currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : "Anonymous Operator"}
              </span>
            </div>
            
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" title="API Connected" />
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {workspaceTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-12 sm:block hidden" />
        </div>

        {/* Workspace Body */}
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-6 h-6 rounded-full border border-slate-800 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-semibold">Syncing security states...</p>
          </div>
        ) : (
          <div className="relative">
            
            {/* 1. CORE: ACCESS DIRECTORY (ENABLE/DISABLE CONTROLS & ASSIGNMENTS) */}
            {isCore && activeTab === "Access Directory" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                
                {permissionsError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{permissionsError}</span>
                  </div>
                )}

                {/* Dropdown Crew Selector */}
                <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs">
                  <div className="max-w-md">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Target Crew Member
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCrewMemberId}
                        onChange={(e) => setSelectedCrewMemberId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl text-xs px-4 py-3.5 pr-10 outline-none shadow-sm focus:border-slate-350 transition-all font-bold text-slate-800 appearance-none cursor-pointer text-slate-800"
                      >
                        <option value="">Select a crew member...</option>
                        {tempCrew.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.role.toUpperCase()} - {member.email})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Content Workspaces when Crew Selected */}
                {!selectedCrewMember ? (
                  <div className="py-24 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-xs select-none">
                    <User className="text-slate-200 mx-auto mb-5 w-12 h-12" />
                    <h3 className="text-[#232F3E] font-bold text-base">No Crew Member Selected</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                      Choose a crew member from the dropdown to assign tasks and manage authorizations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left Block: Assign Task Form (Col Span 7) */}
                      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="pb-3 border-b border-slate-100 mb-6 flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-extrabold text-[#232F3E] tracking-tight">Assign New Task</h3>
                              <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-0.5">Delegate event duties to {selectedCrewMember.name}</p>
                            </div>
                            <span className="inline-block bg-orange-50 text-[#FF9900] border border-orange-100 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              TASK DELEGATOR
                            </span>
                          </div>

                          <form onSubmit={handleAssignTask} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Event Name */}
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Event Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AWS Cloud Day, GenAI Hackathon..."
                                  value={taskEventName}
                                  onChange={(e) => setTaskEventName(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3.5 py-3 outline-none font-bold text-slate-800 focus:border-slate-350"
                                />
                              </div>

                              {/* Priority */}
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                                <select
                                  value={taskPriority}
                                  onChange={(e) => setTaskPriority(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3.5 py-3 outline-none font-bold text-slate-700 focus:border-slate-350 cursor-pointer"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="critical">Critical</option>
                                </select>
                              </div>
                            </div>

                            {/* Task Name */}
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Task Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Design Event Banner, Scan QR Codes..."
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3.5 py-3 outline-none font-bold text-slate-800 focus:border-slate-350"
                              />
                            </div>

                            {/* Deadline */}
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Deadline</label>
                              <input
                                type="datetime-local"
                                value={taskDeadline}
                                onChange={(e) => setTaskDeadline(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3.5 py-3 outline-none font-bold text-slate-800 focus:border-slate-350"
                              />
                            </div>

                            {/* Short Description */}
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Short Description</label>
                              <textarea
                                rows={3}
                                placeholder="Write description or notes for the crew member..."
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3.5 py-3 outline-none font-bold text-slate-800 focus:border-slate-350 resize-none leading-relaxed"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={assigningTask}
                              className="w-full bg-[#232F3E] hover:bg-[#1a232f] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                            >
                              {assigningTask ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                "Assign Task & Notify"
                              )}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right Block: Capability Authorizations (Col Span 5) */}
                      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="pb-3 border-b border-slate-100 mb-6">
                            <h3 className="text-base font-extrabold text-[#232F3E] tracking-tight">Capability Authorizations</h3>
                            <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-0.5">Toggle security permissions for {selectedCrewMember.name}</p>
                          </div>

                          <div className="space-y-4">
                            {SECURITY_MODULES.map((module) => {
                              const isEnabled = selectedCrewMember.permissions.some(p => p.permission === module.key);
                              const isToggling = togglingKey === `${selectedCrewMember.id}_${module.key}`;
                              const Icon = module.icon;

                              return (
                                <div 
                                  key={module.key}
                                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                    isEnabled 
                                      ? "bg-slate-50 border-slate-200/80 text-slate-800" 
                                      : "bg-white border-slate-100 text-slate-400 opacity-75"
                                  }`}
                                >
                                  <div className="min-w-0 flex items-start gap-3">
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                      isEnabled 
                                        ? `bg-gradient-to-br ${module.color} text-white shadow-xs` 
                                        : "bg-slate-50 text-slate-400 border border-slate-100"
                                    }`}>
                                      <Icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold leading-tight ${isEnabled ? "text-slate-800" : "text-slate-500"}`}>
                                        {module.label}
                                      </p>
                                      <p className="text-[9px] text-slate-405 font-semibold leading-relaxed mt-1">
                                        {module.desc}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isEnabled ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
                                      {isEnabled ? "Enabled" : "Disabled"}
                                    </span>

                                    <button
                                      onClick={() => handleTogglePermission(selectedCrewMember.id, module.key, isEnabled)}
                                      disabled={isToggling}
                                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1 border ${
                                        isToggling 
                                          ? "bg-slate-50 text-slate-400 border-slate-200" 
                                          : isEnabled
                                            ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
                                            : "bg-[#232F3E] hover:bg-[#1a232f] text-white border-[#232F3E] shadow-sm hover:shadow"
                                      }`}
                                    >
                                      {isToggling ? (
                                        <RefreshCw size={10} className="animate-spin" />
                                      ) : isEnabled ? (
                                        "Disable"
                                      ) : (
                                        "Enable"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Block: Currently Assigned Tasks */}
                    <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs">
                      <div className="pb-3 border-b border-slate-100 mb-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-[#232F3E] tracking-tight">Currently Assigned Tasks</h3>
                          <p className="text-[10px] text-slate-455 uppercase font-black tracking-wider mt-0.5">Active event operations workload of {selectedCrewMember.name}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border border-slate-200/40">
                          Total Tasks: {selectedCrewTasks.length}
                        </span>
                      </div>

                      {loadingTasks ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="animate-spin text-[#FF9900]" size={20} />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Syncing tasks list...</p>
                        </div>
                      ) : selectedCrewTasks.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                          No tasks currently assigned to this crew member.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-black">
                                <th className="pb-3 font-black">Task Name</th>
                                <th className="pb-3 font-black">Event Name</th>
                                <th className="pb-3 font-black">Priority</th>
                                <th className="pb-3 font-black">Deadline</th>
                                <th className="pb-3 font-black">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                              {selectedCrewTasks.map((task) => {
                                const { eventName, description } = parseTaskNotes(task.notes);
                                const catLabel = task.category === 'pre_event' ? 'Pre Event' : task.category === 'during_event' ? 'New Event' : 'Post Event';
                                const priorityColors: Record<string, string> = {
                                  low: "bg-slate-50 text-slate-600 border-slate-100",
                                  medium: "bg-amber-50 text-amber-800 border-amber-100",
                                  high: "bg-orange-50 text-orange-800 border-orange-100",
                                  critical: "bg-red-50 text-red-800 border-red-100"
                                };
                                const statusColors: Record<string, string> = {
                                  not_assigned: "bg-slate-50 text-slate-500 border-slate-100",
                                  assigned: "bg-blue-50 text-blue-805 text-blue-800 border-blue-100",
                                  yet_to_start: "bg-amber-50 text-amber-800 border-amber-100",
                                  in_progress: "bg-orange-50 text-orange-850 border-orange-150",
                                  under_review: "bg-violet-50 text-violet-800 border-violet-100",
                                  completed: "bg-emerald-50 text-emerald-800 border-emerald-100",
                                  blocked: "bg-red-50 text-red-800 border-red-100"
                                };

                                return (
                                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 pr-4">
                                      <div className="font-bold text-slate-800">{task.name}</div>
                                      {description && (
                                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1 max-w-sm">
                                          {description}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3.5">
                                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/40 uppercase">
                                        {eventName || "—"}
                                      </span>
                                    </td>
                                    <td className="py-3.5">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase ${priorityColors[task.priority] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
                                        {task.priority}
                                      </span>
                                    </td>
                                    <td className="py-3.5 text-slate-500 font-medium">
                                      {formatDate(task.dueDate)}
                                    </td>
                                    <td className="py-3.5">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColors[task.status] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
                                        {task.status.replace(/_/g, ' ')}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CORE: SECURITY AUDIT LOGS */}
            {isCore && activeTab === "Security Audit Logs" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Access Control Audit Timeline</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">Verifiable log entries of security credential changes.</p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                  <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6 text-xs py-2">
                    {securityLogs.map((log) => {
                      const isGranted = log.action === "permission_granted";
                      const permissionKey = log.metadata?.permission || "Custom Access";
                      const matchedModule = SECURITY_MODULES.find(m => m.key === permissionKey);
                      const label = matchedModule?.label || permissionKey;
                      const Icon = matchedModule?.icon || Lock;

                      return (
                        <div key={log.id} className="relative group">
                          {/* Left dot icon */}
                          <div className={`absolute left-[-31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center shadow-xs ${
                            isGranted ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
                          }`}>
                            <Icon size={8} />
                          </div>
                          
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-800 text-xs">{log.operator?.name || "System Administrator"}</span>
                              
                              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                isGranted 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {isGranted ? "Granted" : "Revoked"}
                              </span>
                              
                              <span className="text-[10px] text-slate-400 font-bold ml-auto">{formatDate(log.createdAt)}</span>
                            </div>

                            <p className="text-slate-600 text-xs leading-relaxed mt-1">
                              {isGranted ? (
                                <>
                                  Granted <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px]">{label}</span> access to{" "}
                                  <span className="font-bold text-[#232F3E]">{log.target?.name || "Crew Operator"}</span> ({log.target?.email || ""}) with{" "}
                                  <span className="font-black text-emerald-600 uppercase tracking-wider">Infinite Duration (Manual Revocation Only)</span>.
                                </>
                              ) : (
                                <>
                                  Revoked <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px]">{label}</span> access from{" "}
                                  <span className="font-bold text-[#232F3E]">{log.target?.name || "Crew Operator"}</span> ({log.target?.email || ""}).
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {securityLogs.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        No access control modifications logged in this environment.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. CREW: MY ACTIVE PERMISSIONS */}
            {!isCore && activeTab === "My Active Permissions" && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
                  
                  {/* Decorative background pulse */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF9900]/10 to-transparent rounded-full filter blur-xl animate-pulse" />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900] shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#232F3E] tracking-tight">Active Credentials Console</h3>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Elevated Session Privileges</p>
                    </div>
                  </div>

                  {myCrewObject && myCrewObject.permissions.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Privileges Granted to You ({myCrewObject.permissions.length})
                      </p>

                      <div className="space-y-3">
                        {myCrewObject.permissions.map((p) => {
                          const matchedModule = SECURITY_MODULES.find(m => m.key === p.permission);
                          const label = matchedModule?.label || p.permission;
                          const desc = matchedModule?.desc || "No description available.";
                          const Icon = matchedModule?.icon || Lock;

                          return (
                            <div 
                              key={p.permission}
                              className="p-4 rounded-2xl border bg-slate-50 border-slate-200/80 text-slate-700 flex items-start justify-between gap-4"
                            >
                              <div className="flex gap-3">
                                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 bg-gradient-to-br ${matchedModule?.color || "from-slate-500 to-slate-700"} text-white`}>
                                  <Icon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-800 leading-tight">
                                    {label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 leading-normal font-medium mt-1">
                                    {desc}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">
                                    <span>Authorized by: {p.grantedByName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black border border-emerald-200 bg-emerald-50 text-emerald-600 shrink-0 uppercase tracking-widest select-none">
                                <Clock size={10} className="mr-0.5" />
                                <span>Infinite</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center space-y-4">
                      <Lock size={32} className="text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#232F3E] uppercase tracking-wider">Default Permissions Mode</h4>
                        <p className="text-[10px] text-slate-450 font-semibold px-6 leading-relaxed">
                          You are currently running with default baseline permissions. Elevated credentials will appear here once toggled by a Core administrator.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Profile Context Indicator footer */}
                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-455 text-slate-400 font-bold uppercase tracking-wider">
                    <span>Identity context: {currentUser?.role}</span>
                    <span>Status: Synchronized</span>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </DashboardLayout>
  );
}

export default function AccessControlPage() {
  return (
    <UserProvider>
      <AccessControlDashboard />
    </UserProvider>
  );
}
