'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiService } from '../shared/services/apiService';
import { Ticket } from '../shared/types';
import { EC2ConsoleLoader } from '../shared/components/Animations';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, Award, Calendar, User, FileText, Check, QrCode } from 'lucide-react';

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    const parts = dateString.split(' ');
    if (parts.length >= 4) {
      return `${parts[1]} ${parts[2]} ${parts[3]}`;
    }
    return dateString;
  } catch {
    const parts = dateString.split(' ');
    if (parts.length >= 4) {
      return `${parts[1]} ${parts[2]} ${parts[3]}`;
    }
    return dateString;
  }
}

export default function TicketVerificationPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  
  // Organizer panel state
  const [organizerMode, setOrganizerMode] = useState(false);
  const [scannerId, setScannerId] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  const fetchVerificationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getTicketVerification(ticketId);
      if (res.success) {
        setStatus(res.status);
        setTicket(res.ticket || null);
      } else {
        setStatus(res.status || 'Invalid Ticket');
        setError(res.error || 'Failed to verify ticket details.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Invalid Ticket');
      const errMsg = err instanceof Error ? err.message : 'Ticket not found in the system.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchVerificationDetails();
    }
  }, [ticketId, fetchVerificationDetails]);

  const handleCheckIn = async () => {
    if (!ticketId || !ticket?.ticket_code) return;
    try {
      setCheckingIn(true);
      setCheckInError(null);
      const res = await apiService.markAttendance(ticket.ticket_code, scannerId);
      if (res.success) {
        // Refresh local status
        setStatus('Already Scanned');
        if (res.ticket) {
          setTicket(res.ticket);
        }
      } else {
        setCheckInError(res.error || 'Failed to mark attendance.');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Check-in request failed.';
      setCheckInError(errMsg);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-16 px-4">
        <EC2ConsoleLoader message="Contacting verification auth registry..." />
      </div>
    );
  }

  // Get status color configuration
  const getStatusStyles = () => {
    switch (status) {
      case 'Valid Ticket':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />,
          label: 'Valid Ticket',
          desc: 'This ticket is active and ready for check-in.'
        };
      case 'Already Scanned':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />,
          label: 'Already Scanned / Used',
          desc: 'Attendance has already been logged for this pass.'
        };
      case 'Expired Ticket':
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: <Clock className="w-8 h-8 text-slate-500 shrink-0" />,
          label: 'Event Expired',
          desc: 'This ticket belongs to an event that has already ended.'
        };
      case 'Cancelled Ticket':
        return {
          bg: 'bg-rose-50 border-rose-250 text-rose-800',
          icon: <XCircle className="w-8 h-8 text-rose-600 shrink-0" />,
          label: 'Ticket Cancelled',
          desc: 'This registration has been marked as inactive or cancelled.'
        };
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />,
          label: 'Invalid Ticket',
          desc: 'No matching ticket record could be verified in the database.'
        };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <div className="bg-transparent min-h-screen pt-4 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header - Compact left-aligned layout */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-[#232F3E]" />
            <h1 className="font-semibold text-2xl text-slate-900 font-display">
              Verification Hub
            </h1>
          </div>
          <Link
            href="/events"
            className="text-xs font-medium text-[#232F3E] hover:text-[#1a232f]"
          >
            Go to Events &rarr;
          </Link>
        </div>

        {/* Verification Status Banner Panel */}
        <div className={`rounded-[10px] border p-4.5 mb-5 flex items-start space-x-4 shadow-sm ${statusStyle.bg}`}>
          {statusStyle.icon}
          <div>
            <h2 className="font-semibold text-base mb-0.5">{statusStyle.label}</h2>
            <p className="text-xs font-normal opacity-90 leading-relaxed">{statusStyle.desc}</p>
            {ticket?.scanned_at && (
              <div className="mt-2 pt-2 border-t border-current/10 text-[10px] font-medium flex flex-wrap gap-x-4">
                <span>Check-in: {new Date(ticket.scanned_at).toLocaleString()}</span>
                <span>Scanner: {ticket.scanner_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Boarding Pass (Only if ticket is valid/exists) */}
        {ticket ? (
          <div className="bg-white border border-slate-200 rounded-[10px] shadow-sm overflow-hidden mb-5">
            {/* AWS Navy Accent Header */}
            <div className="bg-[#232F3E] text-white p-4.5">
              <span className="text-[10px] font-medium tracking-widest uppercase text-slate-300">
                Ticket Information Log
              </span>
              <h3 className="font-medium text-base mt-1 line-clamp-1 text-white font-display">
                {ticket.event_title}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Participant Details */}
              <div>
                <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider mb-2 font-display flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-[#232F3E]" />
                  <span>Attendee Credentials</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-[10px] border border-slate-150">
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Full Name</p>
                    <p className="text-xs font-medium text-slate-800 truncate">{ticket.user_name}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Registration / Roll No</p>
                    <p className="text-xs font-medium text-slate-800 font-mono truncate">{ticket.user_roll}</p>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Department</p>
                    <p className="text-xs font-medium text-slate-800 truncate">{ticket.user_email?.split('@')[0] || 'Cloud Club REC'}</p>
                  </div>
                </div>
              </div>

              {/* Logistics Grid */}
              <div>
                <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider mb-2 font-display flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#232F3E]" />
                  <span>Event Logistics</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-[10px] border border-slate-150 text-slate-600">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Event Date</p>
                    <p className="text-xs font-medium text-slate-800">{formatDate(ticket.event_date || '')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Event Time</p>
                    <p className="text-xs font-medium text-slate-800">{ticket.event_time}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase font-normal">Venue</p>
                    <p className="text-xs font-medium text-slate-800 truncate">{ticket.event_venue}</p>
                  </div>
                </div>
              </div>

              {/* Registry IDs */}
              <div>
                <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider mb-2 font-display flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#232F3E]" />
                  <span>Registry Credentials</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400">Ticket ID:</span>
                    <span className="ml-1.5 font-mono text-slate-700 select-all font-medium">{ticket.ticket_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Registration ID:</span>
                    <span className="ml-1.5 font-mono text-slate-700 select-all font-medium">{ticket.registration_id}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[10px] p-6 shadow-sm text-center mb-5">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-slate-800 mb-1">Ticket Not Found</h3>
            <p className="text-slate-500 text-xs font-normal leading-relaxed max-w-sm mx-auto">
              {error || 'This ticket key is not registered in the system database. Verify the QR scanner code or contact the AWS Cloud Club REC committee.'}
            </p>
          </div>
        )}

        {/* Organizer Administration Panel */}
        {ticket && (
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-[10px] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-slate-400 shrink-0" />
                <h4 className="text-xs sm:text-sm font-medium tracking-wider text-slate-200 uppercase font-display">
                  Authorized Organizer Operations
                </h4>
              </div>
              <button
                onClick={() => setOrganizerMode(!organizerMode)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-[6px] border ${
                  organizerMode 
                    ? 'bg-[#232F3E]/30 border-slate-700 text-slate-250' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {organizerMode ? 'Deactivate Panel' : 'Unlock Panel'}
              </button>
            </div>

            {organizerMode ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Log user attendance instantly using REC check-in nodes. Scanned events are securely registered and synced with student database modules.
                </p>

                {checkInError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-[8px] text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{checkInError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase font-medium mb-1">
                      Authorized Scanner Node ID
                    </label>
                    <input
                      type="text"
                      value={scannerId}
                      onChange={(e) => setScannerId(e.target.value)}
                      placeholder="Enter your scanner ID"
                      className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-[8px] text-slate-200 placeholder-slate-650 focus:outline-none focus:border-[#232F3E] text-xs font-mono"
                    />
                  </div>

                  {status === 'Already Scanned' ? (
                    <button
                      disabled
                      className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium py-1.5 rounded-[8px] cursor-not-allowed text-xs flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Check-In Recorded</span>
                    </button>
                  ) : status !== 'Valid Ticket' ? (
                    <button
                      disabled
                      className="w-full bg-slate-850 border border-slate-800 text-slate-500 font-medium py-1.5 rounded-[8px] cursor-not-allowed text-xs"
                    >
                      Check-In Unavailable
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full bg-[#232F3E] text-white font-medium py-1.5 rounded-[8px] shadow-sm text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {checkingIn ? 'Synching pass logs...' : 'Confirm Check-In Pass'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-normal italic">
                Organizer operations are locked. Toggle &quot;Unlock Panel&quot; to test ticket attendance scanning and check-in workflows.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
