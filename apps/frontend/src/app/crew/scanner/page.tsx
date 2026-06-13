'use client';

import { useState } from 'react';
import { useMarkCrewAttendance } from '@/lib/hooks';
import type { Ticket } from '@/lib/types';
import {
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  Info,
} from 'lucide-react';

export default function TicketScannerPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status: string;
    ticket?: Ticket;
  } | null>(null);

  const checkInMutation = useMarkCrewAttendance();

  function handleScan(codeToScan: string) {
    if (!codeToScan.trim()) return;

    setScanResult(null);
    checkInMutation.mutate(
      { ticketCode: codeToScan.trim(), scannerId: 'crew-scanner-terminal-01' },
      {
        onSuccess: (res) => {
          setScanResult(res);
        },
        onError: (err: Error) => {
          setScanResult({
            success: false,
            status: err.message || 'Verification system error.',
          });
        },
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleScan(ticketCode);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#232F3E]">Ticket Scanner</h1>
          <p className="text-sm text-slate-500">
            Scan QR Codes or enter ticket ID strings manually to check in attendees
          </p>
        </div>

        <div className="space-y-4">
          <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-[10px] space-y-6 flex flex-col items-center">
            {/* Animated QR Target Frame */}
            <div className="border-2 border-dashed border-slate-300 w-48 h-48 rounded-[12px] flex items-center justify-center relative overflow-hidden bg-slate-50">
              <QrCode className="h-16 w-16 text-slate-300" />
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#232F3E]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#232F3E]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#232F3E]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#232F3E]" />
              {/* Laser scan line simulation */}
              <div className="absolute left-0 w-full h-0.5 bg-[#232F3E]/60 animate-bounce top-1/2" />
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ticket Code String
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Type ticket code manually..."
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                  />
                  <button
                    type="submit"
                    disabled={checkInMutation.isPending || !ticketCode.trim()}
                    className="bg-[#232F3E] text-white hover:bg-[#161e27] rounded-[8px] text-xs font-semibold px-5 py-2.5 shadow-sm transition disabled:opacity-50"
                  >
                    {checkInMutation.isPending ? 'Verifying...' : 'Scan'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Validation Result Output */}
          {scanResult && (
            <div
              className={`border rounded-[10px] p-5 shadow-sm space-y-4 ${
                scanResult.success
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {scanResult.success ? (
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="bg-rose-100 p-2 rounded-full">
                    {scanResult.status.includes('Already') ? (
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-rose-600" />
                    )}
                  </div>
                )}
                <div>
                  <h3
                    className={`text-sm font-semibold uppercase tracking-wider ${
                      scanResult.success ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {scanResult.success ? 'Valid Ticket - Check-in Success' : scanResult.status}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {scanResult.success
                      ? 'Operational check-in recorded successfully in PostgreSQL.'
                      : 'Entry denied. Check ticket parameters below.'}
                  </p>
                </div>
              </div>

              {/* Valid Details */}
              {scanResult.success && scanResult.ticket && (
                <div className="bg-white border border-emerald-100 rounded-[8px] p-4 text-xs text-slate-700 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="h-3.5 w-3.5" /> Name
                    </div>
                    <span className="font-semibold text-slate-800">
                      {scanResult.ticket.userName ||
                        (scanResult.ticket.registration
                          ? `${scanResult.ticket.registration.name}`
                          : '—')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5" /> Event
                    </div>
                    <span className="font-semibold text-slate-850">
                      {scanResult.ticket.event?.title || '—'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Tag className="h-3.5 w-3.5" /> Ticket ID
                    </div>
                    <span className="font-mono font-medium text-slate-600">
                      {scanResult.ticket.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Info className="h-3.5 w-3.5" /> Status
                    </div>
                    <span className="inline-block rounded-md bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 uppercase tracking-wide text-[9px]">
                      {scanResult.ticket.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
