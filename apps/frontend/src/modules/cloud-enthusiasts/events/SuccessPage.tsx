'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useEventDetails } from '../shared/hooks/useCloudEnthusiasts';
import { apiService } from '../shared/services/apiService';
import { EC2ConsoleLoader, AnimatedSuccessCheck, ErrorAlert } from '../shared/components/Animations';
import { Calendar, MapPin, ArrowRight, Home, Ticket, Clock, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const regId = searchParams.get('regId');
  const ticketId = searchParams.get('ticketId');
  const warning = searchParams.get('warning');

  const { data: detailData, isLoading, error } = useEventDetails(eventId);

  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  useEffect(() => {
    if (ticketId) {
      setLoadingTicket(true);
      apiService.getTicketVerification(ticketId)
        .then((data) => {
          if (data.success && data.ticket) {
            setTicketDetails(data.ticket);
          }
        })
        .catch((err) => {
          console.error('Failed to load ticket for success page:', err);
        })
        .finally(() => {
          setLoadingTicket(false);
        });
    }
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <EC2ConsoleLoader message="Finalizing credentials mapping..." />
      </div>
    );
  }

  if (error || !detailData?.event) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <ErrorAlert message="Registration completed, but could not load success event summary details." />
          <div className="text-center mt-4">
            <Link href="/events" className="bg-[#232F3E] text-white px-4.5 py-2 rounded-[8px] font-medium text-xs inline-block">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event } = detailData;
  const eventDateStr = new Date(event.start_datetime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  const eventTimeStr = new Date(event.start_datetime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F4F6F9] to-[#EDF0F5] text-[#1A1C1E] flex flex-col font-jakarta justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow (matches events page style) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.07)_0%,rgba(255,153,0,0.03)_40%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-xl w-full mx-auto z-10 relative">
        
        {/* Success Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-50 border border-emerald-200/60 p-3 rounded-full mb-4 shadow-sm shadow-emerald-500/5">
            <AnimatedSuccessCheck />
          </div>
          <h1 className="text-2xl font-extrabold text-[#232F3E] tracking-tight">
            Registration Successful!
          </h1>
          <p className="text-slate-550 mt-2 text-xs font-normal max-w-sm mx-auto leading-relaxed">
            Your seat is reserved. A confirmation email has been dispatched via Gmail SMTP.
          </p>
        </div>

        {/* Warn if email delivery failed */}
        {warning && (
          <div className="bg-amber-50 border border-amber-250 text-amber-800 rounded-2xl p-4.5 mb-6 text-xs shadow-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Notice</p>
              <p className="text-amber-700 mt-1 leading-relaxed font-normal">{warning}</p>
            </div>
          </div>
        )}

        {/* Ticket Boarding Pass Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white mb-8">
          
          {/* Left/Right Notched Cutouts - must stay rounded-full circles */}
          <div className="absolute left-0 top-[60%] -translate-y-1/2 -ml-3.5 w-7 h-7 rounded-full border border-slate-200/80 z-10 bg-[#F8F9FA]" />
          <div className="absolute right-0 top-[60%] -translate-y-1/2 -mr-3.5 w-7 h-7 rounded-full border border-slate-200/80 z-10 bg-[#F8F9FA]" />

          {/* Header Accent (Primary dark color) */}
          <div className="bg-[#1A1C1E] text-white p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,153,0,0.08)_0%,transparent_60%)] pointer-events-none" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#FF9900]">
              Cloud Enthusiasts Success Ticket
            </span>
            <h2 className="font-extrabold text-lg mt-1 font-display line-clamp-1 text-white">
              {event.title}
            </h2>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            
            {/* Participant Grid */}
            <div className="grid grid-cols-2 gap-5 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Registration Reference</p>
                <p className="font-bold text-sm text-slate-800 mt-1">{regId || 'PENDING_REG'}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ticket Status</p>
                {ticketDetails ? (
                  <p className="font-bold text-sm text-emerald-600 mt-1">Pass Active</p>
                ) : (
                  <p className="font-bold text-sm text-amber-600 mt-1">
                    {loadingTicket ? 'Loading...' : 'Not Yet Available'}
                  </p>
                )}
              </div>
            </div>

            {/* Perforated teardrop dashed line */}
            <div className="border-t-2 border-dashed border-slate-100 my-2" />

            {/* Logistics & Mock Check QR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3.5 text-xs text-slate-650 w-full sm:w-auto font-medium">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{eventDateStr}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{eventTimeStr} ({event.mode})</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[220px]">{event.venue}</span>
                </div>
              </div>

              {/* QR Image Placeholder or Real QR Code */}
              {ticketDetails ? (
                <div className="bg-white p-2 border border-slate-200 rounded-xl shrink-0 w-28 h-28 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${ticketDetails.ticket_id}` : ''}
                    size={96}
                    level="H"
                  />
                </div>
              ) : (
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl text-center shrink-0 w-28 h-28 flex flex-col justify-center items-center gap-1">
                  <Ticket className="w-5 h-5 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-snug">
                    {loadingTicket ? 'Generating QR...' : 'Ticket Released shortly'}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/events"
            className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer shadow-sm hover:shadow"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Return to Events</span>
          </Link>
          
          <Link
            href={`/events/${eventId}?showTicket=true`}
            className="flex items-center justify-center gap-2 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg text-xs transition-all duration-200 hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer"
          >
            <span>View Ticket on Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
