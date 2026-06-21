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
  GraduationCap,
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
    icon: GraduationCap,
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
  const [showAllLogs, setShowAllLogs] = useState(false);
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

  // Memoized crew members with active permissions
  const activeMembers = useMemo(() => {
    return tempCrew.filter(c => c.permissions && c.permissions.length > 0);
  }, [tempCrew]);

  // Find current user's active permissions for Crew view
  const myCrewObject = useMemo(() => {
    return tempCrew.find(m => m.id === currentUser?.id);
  }, [tempCrew, currentUser]);

  // Memoized filtered audit logs (default to last 1 week unless showAllLogs is toggled)
  const filteredLogs = useMemo(() => {
    if (showAllLogs) return securityLogs;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return securityLogs.filter((log) => {
      if (!log.createdAt) return false;
      return new Date(log.createdAt) >= oneWeekAgo;
    });
  }, [securityLogs, showAllLogs]);

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
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-6 py-3.5 rounded-[8px] shadow-xl border backdrop-blur-md animate-[fadeIn_0.2s_ease-out] ${
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
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5 flex-wrap gap-4 bg-white/40 p-4 rounded-[8px] backdrop-blur-xs border shadow-xs relative z-50">
          <div className="flex items-center gap-3 relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-slate-200 bg-white shadow-xs text-xs select-none hover:border-slate-350 transition-all duration-200">
              {currentUser?.role === "core" ? (
                <User size={13} className="text-[#FF9900] shrink-0" />
              ) : (
                <User size={13} className="text-slate-400 shrink-0" />
              )}
              <span className="font-semibold text-slate-700">{currentUser ? currentUser.name : "Anonymous Member"}</span>
              <span className="text-slate-400 font-medium uppercase text-[10px]">
                ({currentUser ? currentUser.role : "OPERATOR"})
              </span>
            </div>
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-[4px] border border-slate-200/80">
            {workspaceTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-[2px] transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-slate-900 border border-slate-200/50 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/35"
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
            {isCore && (
              <>
                <div className={`space-y-6 animate-[fadeIn_0.3s_ease-out] ${activeTab === "Access Directory" ? "" : "hidden"}`}>
                
                {permissionsError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-[8px] text-xs font-semibold flex items-center gap-2 shadow-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{permissionsError}</span>
                  </div>
                )}

                {/* Unified Main Workspace Container Card */}
                <div className="bg-white border border-slate-200 rounded-[8px] p-8 shadow-xs space-y-6">
                  
                  {/* Dropdown Crew Selector & Active Header Row */}
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 flex-wrap gap-4">
                    <div className="max-w-md w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                        Target Crew Member
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCrewMemberId}
                          onChange={(e) => setSelectedCrewMemberId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[8px] text-sm px-4 py-3.5 pr-10 outline-none focus:border-slate-350 transition-all font-semibold text-slate-800 appearance-none cursor-pointer"
                        >
                          <option value="">Select a crew member...</option>
                          {tempCrew.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {selectedCrewMember && (
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-[8px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-sm">
                          <span className="font-bold text-slate-800">{selectedCrewMember.name}</span>
                          <span className="text-slate-400 font-semibold ml-1.5 uppercase text-xs">({selectedCrewMember.role})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main content workspace area */}
                  {!selectedCrewMember ? (
                    activeMembers.length > 0 ? (
                      <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between pb-1">
                          <div>
                            <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Active Core Access Directory</h3>
                            <p className="text-xs text-slate-405 font-semibold uppercase tracking-wide mt-0.5">
                              Crew members currently holding elevated credentials to core modules
                            </p>
                          </div>
                          <span className="inline-block bg-[#232F3E]/5 text-[#232F3E] border border-slate-200 px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wide">
                            Active Grants: {activeMembers.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeMembers.map((member) => {
                            const roleColors: Record<string, string> = {
                              volunteer: "bg-emerald-50 text-emerald-700 border-emerald-100",
                              scanner: "bg-sky-50 text-sky-700 border-sky-100",
                              crew: "bg-slate-50 text-slate-700 border-slate-150"
                            };
                            const roleNameNormalized = (member.role || "crew").toLowerCase();
                            const roleBadgeClass = roleColors[roleNameNormalized] || roleColors.crew;

                            return (
                              <div
                                key={member.id}
                                onClick={() => setSelectedCrewMemberId(member.id)}
                                className="bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-6 hover:bg-slate-50/90 hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                              >
                                {/* Background subtle glow effect */}
                                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/50 rounded-full group-hover:scale-125 transition-all duration-500 blur-xl pointer-events-none" />

                                {/* Card Top / Identity */}
                                <div>
                                  <div className="flex items-center gap-3.5 pr-16">
                                    {/* Avatar */}
                                    {member.avatar?.photo ? (
                                      <img
                                        src={member.avatar.photo}
                                        alt={member.name}
                                        className="w-11 h-11 rounded-[8px] object-cover ring-2 ring-slate-100 group-hover:ring-[#FF9900]/30 transition-all duration-300"
                                      />
                                    ) : (
                                      <div
                                        className="w-11 h-11 rounded-[8px] flex items-center justify-center font-bold text-xs text-white shadow-xs group-hover:scale-105 ring-2 ring-slate-100 group-hover:ring-[#FF9900]/30 transition-all duration-300"
                                        style={{ backgroundColor: member.avatar?.color || '#232F3E' }}
                                      >
                                        {member.avatar?.initials || "CR"}
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <h4 className="text-base font-bold text-[#232F3E] group-hover:text-[#FF9900] transition-colors duration-300 truncate">
                                        {member.name}
                                      </h4>
                                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Absolute Role Badge */}
                                  <span className={`absolute top-6 right-6 px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-wide border ${roleBadgeClass}`}>
                                    {member.role || "CREW"}
                                  </span>

                                  <div className="border-b border-slate-200/60 my-4" />

                                  {/* Active Permissions List */}
                                  <div className="space-y-2 relative z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                                      Active Permissions
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {member.permissions.map((p) => {
                                        const matchedModule = SECURITY_MODULES.find(m => m.key === p.permission);
                                        const label = matchedModule?.label || p.permission;
                                        const Icon = matchedModule?.icon || Shield;

                                        return (
                                          <span
                                            key={p.permission}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 shadow-xs group-hover:shadow transition-shadow duration-300"
                                          >
                                            <Icon size={11} className="shrink-0 text-slate-500" />
                                            <span>{label}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Click Action Hint */}
                                <div className="mt-6 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 group-hover:text-[#FF9900] transition-colors duration-300 relative z-10">
                                  <span>Configure Member</span>
                                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center select-none relative overflow-hidden flex flex-col items-center justify-center">
                        {/* Decorative glowing background elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-slate-50 to-orange-50/10 rounded-full filter blur-2xl pointer-events-none" />
                        
                        <div className="relative z-10 space-y-4 max-w-sm mx-auto">
                          <div className="w-14 h-14 rounded-[8px] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto shadow-xs ring-4 ring-slate-50/50">
                            <Lock className="w-6 h-6 text-slate-500" />
                          </div>
                          <div className="space-y-1.5 px-4">
                            <h3 className="text-[#232F3E] font-bold text-lg tracking-tight">No Active Access Grants</h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                              There are currently no crew members with elevated permissions. Select a crew member from the dropdown above to assign tasks and delegate credentials.
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Selected Operator View Inset Grid */
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Left Block: Assign Task Form */}
                        <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-6 flex flex-col justify-between">
                          <div>
                            <div className="pb-3 border-b border-slate-200/60 mb-6 flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Assign New Task</h3>
                                <p className="text-xs text-slate-455 uppercase font-bold tracking-wide mt-0.5">Delegate event duties to {selectedCrewMember.name}</p>
                              </div>
                              <span className="inline-block bg-orange-50 text-[#FF9900] border border-orange-100 px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-wide">
                                TASK DELEGATOR
                              </span>
                            </div>

                            <form onSubmit={handleAssignTask} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Event Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. AWS Cloud Day, GenAI Hackathon..."
                                    value={taskEventName}
                                    onChange={(e) => setTaskEventName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Priority</label>
                                  <select
                                    value={taskPriority}
                                    onChange={(e) => setTaskPriority(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-700 focus:border-slate-350 cursor-pointer"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Task Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Design Event Banner, Scan QR Codes..."
                                  value={taskName}
                                  onChange={(e) => setTaskName(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Deadline</label>
                                <input
                                  type="datetime-local"
                                  value={taskDeadline}
                                  onChange={(e) => setTaskDeadline(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Short Description</label>
                                <textarea
                                  rows={3}
                                  placeholder="Write description or notes for the crew member..."
                                  value={taskDescription}
                                  onChange={(e) => setTaskDescription(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-[8px] text-sm px-3.5 py-3 outline-none font-semibold text-slate-800 focus:border-slate-350 resize-none leading-relaxed"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={assigningTask}
                                className="w-full bg-[#232F3E] hover:bg-[#1a232f] text-white py-3.5 rounded-[8px] font-bold text-sm uppercase tracking-tight transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
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

                        {/* Right Block: Capability Authorizations */}
                        <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-6 flex flex-col justify-between">
                          <div>
                            <div className="pb-3 border-b border-slate-200/60 mb-6">
                              <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Capability Authorizations</h3>
                              <p className="text-xs text-slate-455 uppercase font-bold tracking-tight mt-0.5">Toggle security permissions for {selectedCrewMember.name}</p>
                            </div>

                            <div className="space-y-4">
                              {SECURITY_MODULES.map((module) => {
                                const isEnabled = selectedCrewMember.permissions.some(p => p.permission === module.key);
                                const isToggling = togglingKey === `${selectedCrewMember.id}_${module.key}`;
                                const Icon = module.icon;

                                return (
                                  <div 
                                    key={module.key}
                                    className={`flex items-center justify-between p-3.5 rounded-[8px] border transition-all ${
                                      isEnabled 
                                        ? "bg-white border-slate-200/80 text-slate-800 shadow-xs" 
                                        : "bg-slate-100/10 border-slate-200/40 text-slate-400 opacity-75"
                                    }`}
                                  >
                                    <div className="min-w-0 flex items-start gap-3">
                                      <div className={`p-2.5 rounded-[6px] shrink-0 mt-0.5 border ${
                                        isEnabled 
                                          ? "bg-[#232F3E] text-white border-[#232F3E] shadow-xs" 
                                          : "bg-slate-100 text-slate-400 border-slate-200/40"
                                      }`}>
                                        <Icon size={14} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-sm font-semibold leading-tight ${isEnabled ? "text-slate-800" : "text-slate-500"}`}>
                                          {module.label}
                                        </p>
                                        <p className="text-xs text-slate-405 font-medium leading-relaxed mt-1">
                                          {module.desc}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center shrink-0 pl-4">
                                      <button
                                        onClick={() => handleTogglePermission(selectedCrewMember.id, module.key, isEnabled)}
                                        disabled={isToggling}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                          isEnabled ? "bg-emerald-500" : "bg-slate-300"
                                        } ${isToggling ? "opacity-60 cursor-not-allowed" : ""}`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                            isEnabled ? "translate-x-4" : "translate-x-0"
                                          } flex items-center justify-center`}
                                        >
                                          {isToggling && <RefreshCw size={8} className="animate-spin text-slate-500" />}
                                        </span>
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
                      <div className="bg-slate-50/40 border border-slate-200/80 rounded-[8px] p-6">
                        <div className="pb-3 border-b border-slate-200/60 mb-6 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Currently Assigned Tasks</h3>
                            <p className="text-xs text-slate-455 uppercase font-bold tracking-tight mt-0.5">Active event operations workload of {selectedCrewMember.name}</p>
                          </div>
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-[6px] text-xs font-bold uppercase tracking-tight border border-slate-200/40">
                            Total Tasks: {selectedCrewTasks.length}
                          </span>
                        </div>

                        {loadingTasks ? (
                          <div className="py-12 flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="animate-spin text-[#FF9900]" size={20} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Syncing tasks list...</p>
                          </div>
                        ) : selectedCrewTasks.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-[8px] bg-white/20">
                            No tasks currently assigned to this crew member.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200/60 text-xs uppercase tracking-tight text-slate-400 font-bold">
                                  <th className="pb-3 font-bold">Task Name</th>
                                  <th className="pb-3 font-bold">Event Name</th>
                                  <th className="pb-3 font-bold">Priority</th>
                                  <th className="pb-3 font-bold">Deadline</th>
                                  <th className="pb-3 font-bold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {selectedCrewTasks.map((task) => {
                                  const { eventName, description } = parseTaskNotes(task.notes);
                                  const priorityColors: Record<string, string> = {
                                    low: "bg-slate-50 text-slate-600 border-slate-150",
                                    medium: "bg-amber-50 text-amber-800 border-amber-100",
                                    high: "bg-orange-50 text-orange-800 border-orange-100",
                                    critical: "bg-red-50 text-red-800 border-red-100"
                                  };
                                  const statusColors: Record<string, string> = {
                                    not_assigned: "bg-slate-50 text-slate-500 border-slate-150",
                                    assigned: "bg-blue-50 text-blue-800 border-blue-100",
                                    yet_to_start: "bg-amber-50 text-amber-800 border-amber-100",
                                    in_progress: "bg-orange-50 text-orange-850 border-orange-150",
                                    under_review: "bg-violet-50 text-violet-800 border-violet-100",
                                    completed: "bg-emerald-50 text-emerald-800 border-emerald-100",
                                    blocked: "bg-red-50 text-red-800 border-red-100"
                                  };

                                  return (
                                    <tr key={task.id} className="hover:bg-slate-50/20 transition-colors">
                                      <td className="py-3.5 pr-4">
                                        <div className="font-semibold text-slate-800 text-sm">{task.name}</div>
                                        {description && (
                                          <div className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1 max-w-sm">
                                            {description}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3.5">
                                        <span className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-white text-slate-700 border border-slate-200/60 uppercase">
                                          {eventName || "—"}
                                        </span>
                                      </td>
                                      <td className="py-3.5">
                                        <span className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold border uppercase ${priorityColors[task.priority] || "bg-slate-55 text-slate-700 border-slate-150"}`}>
                                          {task.priority}
                                        </span>
                                      </td>
                                      <td className="py-3.5 text-slate-500 font-medium text-xs">
                                        {formatDate(task.dueDate)}
                                      </td>
                                      <td className="py-3.5">
                                        <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase tracking-tight border ${statusColors[task.status] || "bg-slate-55 text-slate-700 border-slate-150"}`}>
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
                </div>

                {/* 2. CORE: SECURITY AUDIT LOGS */}
                <div className={`space-y-4 w-full ${activeTab === "Security Audit Logs" ? "" : "hidden"}`}>
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Access Control Audit Timeline</h3>
                    <p className="text-[9.5px] text-slate-500 uppercase font-semibold tracking-tight mt-0.5">Verifiable log entries of security credential changes.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAllLogs(prev => !prev)}
                      className="px-3.5 py-1.5 rounded-[8px] text-xs font-bold uppercase tracking-tight transition-all border border-slate-200 hover:bg-slate-50 cursor-pointer bg-white text-slate-700 shadow-sm hover:shadow"
                    >
                      {showAllLogs ? "Show Last 7 Days" : "Show All History"}
                    </button>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-[8px] p-6 shadow-sm">
                  <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6 text-xs py-2">
                    {filteredLogs.map((log) => {
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
                              <span className="font-bold text-slate-800 text-sm">{log.operator?.name || "System Administrator"}</span>
                              
                              <span className={`px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-tight ${
                                isGranted 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {isGranted ? "Granted" : "Revoked"}
                              </span>
                              
                              <span className="text-xs text-slate-400 font-semibold ml-auto">{formatDate(log.createdAt)}</span>
                            </div>

                            <p className="text-slate-600 text-xs leading-relaxed mt-1">
                              {isGranted ? (
                                <>
                                  Granted <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">{label}</span> access to{" "}
                                  <span className="font-semibold text-[#232F3E]">{log.target?.name || "Crew Operator"}</span> ({log.target?.email || ""}) with{" "}
                                  <span className="font-bold text-emerald-600 uppercase tracking-tight">Infinite Duration (Manual Revocation Only)</span>.
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

                    {filteredLogs.length === 0 && (
                      <div className="text-center py-12 text-slate-400 font-semibold">
                        No access control modifications logged in the selected timeframe.
                      </div>
                    )}

                    {!showAllLogs && securityLogs.length > filteredLogs.length && (
                      <div className="text-center py-4 border-t border-slate-100 mt-4 select-none">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-2">
                          {securityLogs.length - filteredLogs.length} older entries are hidden
                        </p>
                        <button
                          onClick={() => setShowAllLogs(true)}
                          className="px-4 py-2 rounded-[8px] text-xs font-bold uppercase tracking-tight bg-[#232F3E] hover:bg-[#1a232f] text-white border border-[#232F3E] cursor-pointer shadow-sm hover:shadow"
                        >
                          View Complete Log History
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </>
            )}

            {/* 3. CREW: MY ACTIVE PERMISSIONS */}
            {!isCore && activeTab === "My Active Permissions" && (
              <div className="w-full space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-[8px] p-6 shadow-sm relative overflow-hidden">
                  
                  {/* Decorative background pulse */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF9900]/10 to-transparent rounded-full filter blur-xl animate-pulse" />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-[8px] bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9900] shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#232F3E] tracking-tight">Active Credentials Console</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">Elevated Session Privileges</p>
                    </div>
                  </div>

                  {myCrewObject && myCrewObject.permissions.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight border-b border-slate-100 pb-2">
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
                              className="p-4 rounded-[8px] border bg-slate-50 border-slate-200/80 text-slate-700 flex items-start justify-between gap-4"
                            >
                              <div className="flex gap-3">
                                <div className={`p-2.5 rounded-[6px] shrink-0 mt-0.5 bg-gradient-to-br ${matchedModule?.color || "from-slate-500 to-slate-700"} text-white`}>
                                  <Icon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-slate-800 leading-tight">
                                    {label}
                                  </p>
                                  <p className="text-xs text-slate-400 leading-normal font-medium mt-1">
                                    {desc}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-450 font-semibold uppercase tracking-tight">
                                    <span>Authorized by: {p.grantedByName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-600 shrink-0 uppercase tracking-tight select-none">
                                <Clock size={10} className="mr-0.5" />
                                <span>Infinite</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-[8px] text-center space-y-4">
                      <Lock size={32} className="text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#232F3E] uppercase tracking-tight">Default Permissions Mode</h4>
                        <p className="text-[10px] text-slate-450 font-semibold px-6 leading-relaxed">
                          You are currently running with default baseline permissions. Elevated credentials will appear here once toggled by a Core administrator.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Profile Context Indicator footer */}
                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-tight">
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
