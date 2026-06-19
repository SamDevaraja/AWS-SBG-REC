'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkCrewAttendance } from '@/lib/hooks';
import type { Ticket } from '@/lib/types';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  QrCode,
  Keyboard,
  FlipHorizontal,
  Clock,
  Trash2,
  Activity,
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

// ─── Types ──────────────────────────────────────────────────────────────────

type ScanStatus = 'success' | 'already' | 'error';

interface ScanRecord {
  id: string;
  ticketCode: string;
  status: ScanStatus;
  statusMessage: string;
  attendeeName?: string;
  eventTitle?: string;
  ticketId?: string;
  scannedAt: Date;
}

interface ToastNotification {
  id: string;
  status: ScanStatus;
  message: string;
  attendeeName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function statusColor(status: ScanStatus) {
  return {
    success: {
      bg: 'bg-emerald-50/40 hover:bg-emerald-50/60',
      border: 'border-emerald-100/60',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/40',
      icon: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      leftAccent: 'bg-emerald-500',
    },
    already: {
      bg: 'bg-amber-50/40 hover:bg-amber-50/60',
      border: 'border-amber-100/60',
      text: 'text-amber-800',
      badge: 'bg-amber-100/70 text-amber-800 border-amber-200/40',
      icon: 'text-amber-600 bg-amber-50 border-amber-100',
      leftAccent: 'bg-amber-500',
    },
    error: {
      bg: 'bg-rose-50/40 hover:bg-rose-50/60',
      border: 'border-rose-100/60',
      text: 'text-rose-800',
      badge: 'bg-rose-100/70 text-rose-800 border-rose-200/40',
      icon: 'text-rose-600 bg-rose-50 border-rose-100',
      leftAccent: 'bg-rose-500',
    },
  }[status];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TicketScannerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'manual' | 'camera'>('manual');
  const [isMirrored, setIsMirrored] = useState(true);

  // Last single scan result (for manual mode result panel)
  const [manualResult, setManualResult] = useState<{
    success: boolean;
    status: string;
    ticket?: Ticket;
  } | null>(null);

  // Toast notifications (camera mode)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Scan history list
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  // Debounce: prevent the same QR code from being re-scanned within 2s
  const lastScannedCode = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);

  const checkInMutation = useMarkCrewAttendance();

  // ── Toast helpers ─────────────────────────────────────────────────────────

  function addToast(toast: Omit<ToastNotification, 'id'>) {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ ...toast, id }, ...prev.slice(0, 2)]); // max 3 toasts
    // Auto-dismiss after 3.5 s
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  // ── Scan handler ──────────────────────────────────────────────────────────

  function handleScan(codeToScan: string) {
    if (!codeToScan.trim()) return;

    // Debounce: same code within 2 s → skip
    const now = Date.now();
    if (codeToScan === lastScannedCode.current && now - lastScannedTime.current < 2000) return;
    lastScannedCode.current = codeToScan;
    lastScannedTime.current = now;

    checkInMutation.mutate(
      { ticketCode: codeToScan.trim(), scannerId: 'crew-scanner-terminal-01' },
      {
        onSuccess: (res) => {
          const isAlready = !res.success && res.status?.toLowerCase().includes('already');
          const scanStatus: ScanStatus = res.success ? 'success' : isAlready ? 'already' : 'error';
          const attendeeName =
            res.ticket?.userName ||
            (res.ticket?.registration ? res.ticket.registration.name : undefined);

          if (mode === 'camera') {
            // Stay in camera mode — show toast
            addToast({
              status: scanStatus,
              message: res.status,
              attendeeName,
            });
          } else {
            // Manual mode — show full result panel
            setManualResult(res);
            setSearchQuery('');
          }

          // Add to scan history regardless of mode
          setScanHistory((prev) => [
            {
              id: crypto.randomUUID(),
              ticketCode: codeToScan.trim(),
              status: scanStatus,
              statusMessage: res.status,
              attendeeName,
              eventTitle: res.ticket?.event?.title,
              ticketId: res.ticket?.id,
              scannedAt: new Date(),
            },
            ...prev,
          ]);
        },
        onError: (err: Error) => {
          const msg = err.message || 'Verification system error.';
          if (mode === 'camera') {
            addToast({ status: 'error', message: msg });
          } else {
            setManualResult({ success: false, status: msg });
          }
          setScanHistory((prev) => [
            {
              id: crypto.randomUUID(),
              ticketCode: codeToScan.trim(),
              status: 'error',
              statusMessage: msg,
              scannedAt: new Date(),
            },
            ...prev,
          ]);
        },
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleScan(searchQuery);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Dynamic Keyframes & Custom HUD classes */}
      <style>{`
        @keyframes scan-laser-sweep {
          0% { top: 4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }
        @keyframes subtle-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes slide-in-hud-toast {
          0% { transform: translateY(-1.5rem) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-laser-sweep {
          animation: scan-laser-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-pulse-dot {
          animation: subtle-pulse-dot 1.8s ease-in-out infinite;
        }
        .animate-hud-toast {
          animation: slide-in-hud-toast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hud-glass-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }
        .hud-glass-card-dark {
          background: rgba(26, 35, 47, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.03);
        }
        .hud-terminal-log::-webkit-scrollbar {
          width: 5px;
        }
        .hud-terminal-log::-webkit-scrollbar-track {
          background: transparent;
        }
        .hud-terminal-log::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 9999px;
        }
        .hud-terminal-log::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>

      {/* Floating HUD notifications stack */}
      {toasts.length > 0 && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
          {toasts.map((toast) => {
            const c = statusColor(toast.status);
            return (
              <div
                key={toast.id}
                className="pointer-events-auto relative flex items-start gap-4 p-4 rounded-[16px] border bg-white/95 border-slate-200/60 shadow-xl backdrop-blur-md animate-hud-toast overflow-hidden"
              >
                {/* Accent stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${toast.status === 'success' ? 'bg-emerald-500' : toast.status === 'already' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                
                {/* Icon badge */}
                <div className={`p-2 rounded-xl border shrink-0 ${
                  toast.status === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : toast.status === 'already'
                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  {toast.status === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : toast.status === 'already' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <p className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    toast.status === 'success'
                      ? 'text-emerald-600'
                      : toast.status === 'already'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                  }`}>
                    {toast.status === 'success' ? 'Access Granted' : toast.status === 'already' ? 'Already Checked In' : 'Access Denied'}
                  </p>
                  {toast.attendeeName && (
                    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{toast.attendeeName}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{toast.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/45 backdrop-blur-md rounded-[22px] border border-white/50 p-6 sm:p-8 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#232F3E]/5 text-[#232F3E] border border-[#232F3E]/10 mb-2">
            <Activity className="w-3.5 h-3.5" />
            Live Verification Node
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#232F3E] font-display">
            Registration Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scan QR passes or search attendee registers to verify registration status.
          </p>
        </div>

        {/* Mode Toggle Pill */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/50 shadow-inner relative w-64 h-12 self-start md:self-auto shrink-0">
          <div
            className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm border border-slate-200/50 transition-all duration-300 ease-out"
            style={{ width: 'calc(50% - 4px)', left: mode === 'manual' ? '4px' : '50%' }}
          />
          <button
            onClick={() => { setMode('manual'); setManualResult(null); }}
            className={`relative flex-1 h-full flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 rounded-full focus:outline-none ${
              mode === 'manual' ? 'text-[#232F3E]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Search</span>
          </button>
          <button
            onClick={() => { setMode('camera'); setManualResult(null); }}
            className={`relative flex-1 h-full flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 rounded-full focus:outline-none ${
              mode === 'camera' ? 'text-[#232F3E]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Scanner</span>
          </button>
        </div>
      </div>

      {/* ── Dashboard Grid Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Active Station */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/45 backdrop-blur-md rounded-[22px] border border-white/50 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-[#232F3E] flex items-center gap-2">
                {mode === 'manual' ? (
                  <>
                    <Keyboard className="w-5 h-5 text-slate-500" />
                    <span>Database Record Query</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 text-slate-500" />
                    <span>Live Camera Portal</span>
                  </>
                )}
              </h2>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                mode === 'manual' 
                  ? 'bg-slate-100 border-slate-200 text-slate-600' 
                  : 'bg-emerald-50 border-emerald-200/50 text-emerald-700 animate-pulse'
              }`}>
                {mode === 'manual' ? 'Manual Mode' : 'Scanner Engaged'}
              </span>
            </div>

            {/* View panels */}
            <div>
              {mode === 'manual' ? (
                /* Manual Search Section */
                <div className="space-y-6">
                  <form onSubmit={handleSubmit} className="relative w-full">
                    <div className="flex items-center bg-white border border-slate-200 rounded-[14px] px-4 py-3.5 focus-within:border-brand-orange/60 focus-within:ring-2 focus-within:ring-brand-orange/10 transition-all shadow-sm">
                      <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Name, Email, Roll Number, or Ticket Code..."
                        className="bg-transparent w-full outline-none text-[#232F3E] text-[15px] placeholder:text-slate-400 font-medium"
                        autoFocus
                      />
                      {checkInMutation.isPending && (
                        <div className="w-5 h-5 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin ml-3 shrink-0" />
                      )}
                    </div>
                  </form>

                  {/* Result display */}
                  <div className="pt-2">
                    {!manualResult ? (
                      <div
                        style={{ background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.04), rgba(35, 47, 62, 0.03))' }}
                        className="border-[2px] border-dashed border-slate-200 rounded-[16px] min-h-[220px] flex flex-col items-center justify-center p-6 text-center"
                      >
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 text-slate-400">
                          <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold text-[#232F3E]">Record Verification Pending</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Enter credentials above. Verified data maps instantly from the AWS/Postgres backend cache.
                        </p>
                      </div>
                    ) : (
                      /* Credential pass styling */
                      <div className={`overflow-hidden rounded-[20px] border ${
                        manualResult.success 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : manualResult.status.toLowerCase().includes('already')
                            ? 'border-amber-200 bg-amber-50/20'
                            : 'border-rose-200 bg-rose-50/20'
                      }`}>
                        {/* Header banner */}
                        <div className={`px-6 py-4 flex items-center justify-between border-b ${
                          manualResult.success 
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-100' 
                            : manualResult.status.toLowerCase().includes('already') 
                              ? 'bg-amber-500/10 text-amber-800 border-amber-100' 
                              : 'bg-rose-500/10 text-rose-800 border-rose-100'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg bg-white border ${
                              manualResult.success 
                                ? 'border-emerald-200 text-emerald-600' 
                                : manualResult.status.toLowerCase().includes('already') 
                                  ? 'border-amber-200 text-amber-600' 
                                  : 'border-rose-200 text-rose-600'
                            }`}>
                              {manualResult.success ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : manualResult.status.toLowerCase().includes('already') ? (
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Verification Result</p>
                              <h3 className="font-extrabold text-sm sm:text-base">
                                {manualResult.success 
                                  ? 'Access Granted' 
                                  : manualResult.status.toLowerCase().includes('already') 
                                    ? 'Duplicate Access Check' 
                                    : 'Access Denied'}
                              </h3>
                            </div>
                          </div>
                          
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            manualResult.success 
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                              : manualResult.status.toLowerCase().includes('already') 
                                ? 'bg-amber-100 border-amber-200 text-amber-800' 
                                : 'bg-rose-100 border-rose-200 text-rose-800'
                          }`}>
                            {manualResult.success ? 'Verified' : manualResult.status.toLowerCase().includes('already') ? 'Duplicate' : 'Invalid'}
                          </span>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 space-y-4">
                          <p className="text-sm font-medium text-slate-700">{manualResult.status}</p>

                          {manualResult.success && manualResult.ticket && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="bg-white/70 rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendee</p>
                                  <p className="text-sm font-bold text-[#232F3E] truncate">
                                    {manualResult.ticket.userName || (manualResult.ticket.registration ? manualResult.ticket.registration.name : 'Unknown')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-white/70 rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event</p>
                                  <p className="text-sm font-bold text-[#232F3E] truncate">
                                    {manualResult.ticket.event?.title || 'Unknown Event'}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white/70 rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3 sm:col-span-2">
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                                  <Tag className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Code / ID</p>
                                  <p className="text-xs font-mono font-medium text-slate-600 break-all select-all">
                                    {manualResult.ticket.id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Camera Scanner Section */
                <div className="flex flex-col items-center justify-center py-4">
                  
                  {/* Camera Frame Viewport */}
                  <div className="relative w-full max-w-[320px] aspect-square rounded-[24px] bg-[#101720] overflow-hidden shadow-2xl flex items-center justify-center mb-6 scanner-glow border-2 border-white/5">
                    
                    {/* Camera Feed Container */}
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                    >
                      <Scanner
                        onScan={(result) => {
                          if (result && result.length > 0 && result[0].rawValue) {
                            handleScan(result[0].rawValue);
                          }
                        }}
                        onError={(error) => console.log(error?.message)}
                        sound={false}
                        components={{ finder: false }}
                        constraints={{ facingMode: 'environment' }}
                        styles={{ container: { width: '100%', height: '100%' } }}
                      />
                    </div>

                    {/* HUD Overlays */}
                    
                    {/* Blinking Live HUD indicator */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 bg-slate-950/70 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-md select-none text-[9px] font-extrabold text-white uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                      Live Feed
                    </div>

                    {/* Mirror Option HUD button */}
                    <button
                      type="button"
                      onClick={() => setIsMirrored(!isMirrored)}
                      title="Mirror Camera View"
                      className="absolute top-3 right-3 z-10 bg-slate-950/70 hover:bg-slate-950/90 text-white p-2 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center shadow-md hover:border-white/20"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>

                    {/* Aesthetic Corner brackets */}
                    <div className="absolute inset-0 pointer-events-none p-4">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-[3px] border-l-[3px] border-brand-orange rounded-tl-md" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-[3px] border-r-[3px] border-brand-orange rounded-tr-md" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[3px] border-l-[3px] border-brand-orange rounded-bl-md" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[3px] border-r-[3px] border-brand-orange rounded-br-md" />
                    </div>

                    {/* Neon Laser Line animation */}
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-80 shadow-[0_0_12px_#FF9900] animate-laser-sweep pointer-events-none" />

                    {/* Viewport Center Target Grid */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                      <div className="w-12 h-12 border border-dashed border-white rounded-full" />
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/50 shadow-inner">
                    Position QR Code in scanner window
                  </p>

                  {/* Processing indicator */}
                  {checkInMutation.isPending && (
                    <div className="mt-4 flex items-center gap-2.5 text-xs text-[#232F3E] font-bold bg-[#FF9900]/5 px-3 py-1.5 rounded-lg border border-[#FF9900]/20 shadow-sm">
                      <div className="w-3.5 h-3.5 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                      Verifying ticket...
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Scan History Activity Log */}
        <div className="lg:col-span-5">
          <div className="bg-white/45 backdrop-blur-md rounded-[22px] border border-white/50 shadow-sm p-6 flex flex-col min-h-[480px]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 animate-pulse-subtle" />
                <h2 className="text-sm font-bold text-[#232F3E] uppercase tracking-wider">Verification Stream</h2>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200/30">
                  {scanHistory.length}
                </span>
              </div>
              
              {scanHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScanHistory([])}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-rose-100 transition-all font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Log
                </button>
              )}
            </div>

            {/* History list stream */}
            <div className="flex-1 flex flex-col justify-start">
              {scanHistory.length === 0 ? (
                <div
                  style={{ background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.02), rgba(35, 47, 62, 0.02))' }}
                  className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-slate-200/65 rounded-[18px] min-h-[300px]"
                >
                  <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 text-slate-400 mb-3 animate-pulse-subtle">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#232F3E]">Stream Log Empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                    Check-in activity feeds here dynamically. Scanning passes or searching records launches entries.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1.5 hud-terminal-log">
                  {scanHistory.map((record) => {
                    const c = statusColor(record.status);
                    return (
                      <div
                        key={record.id}
                        className={`relative pl-4 pr-3.5 py-3 rounded-[14px] border ${c.bg} ${c.border} transition-all hover:translate-x-0.5 shadow-sm hover:shadow flex items-start gap-3 overflow-hidden`}
                      >
                        {/* Left edge boundary accent strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.leftAccent}`} />

                        {/* Status Icon */}
                        <div className={`p-1.5 rounded-lg border shrink-0 ${c.icon}`}>
                          {record.status === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : record.status === 'already' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            {record.attendeeName ? (
                              <span className="text-xs font-bold text-slate-800 truncate pr-1">
                                {record.attendeeName}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 italic">
                                Unknown Registrant
                              </span>
                            )}
                            
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider whitespace-nowrap shrink-0 ${c.badge}`}>
                              {record.status === 'success' ? 'Granted' : record.status === 'already' ? 'Duplicate' : 'Denied'}
                            </span>
                          </div>
                          
                          {record.eventTitle && (
                            <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                              {record.eventTitle}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-1 text-[9px] font-medium text-slate-400 font-mono">
                            <span className="truncate max-w-[160px]">{record.ticketCode}</span>
                            <span className="text-slate-400 pl-1 shrink-0">{formatTime(record.scannedAt)}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
