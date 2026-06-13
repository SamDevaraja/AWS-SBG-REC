'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useEventDetails } from '../shared/hooks/useCloudEnthusiasts';
import { EC2ConsoleLoader, AnimatedSuccessCheck, ErrorAlert } from '../shared/components/Animations';
import { Calendar, MapPin, ArrowRight, Home, Ticket, Clock, AlertCircle } from 'lucide-react';

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const regId = searchParams.get('regId');
  const warning = searchParams.get('warning');

  const { data: detailData, isLoading, error } = useEventDetails(eventId);

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
    <div className="bg-transparent min-h-screen pt-4 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        {/* Success Header Banner - Preserved MVP Layout */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 p-2.5 rounded-full mb-3 border border-emerald-100/30">
            <AnimatedSuccessCheck />
          </div>
          <h1 className="font-semibold text-2xl text-slate-800 font-display">
            Registration Successful!
          </h1>
          <p className="text-slate-500 mt-1 text-xs font-normal max-w-sm mx-auto leading-relaxed">
            Your seat is reserved. A confirmation email has been dispatched via Gmail SMTP.
          </p>
        </div>

        {/* Warn if email delivery failed */}
        {warning && (
          <div className="bg-amber-50 border border-amber-250 text-amber-800 rounded-[10px] p-4.5 mb-6 text-xs shadow-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Notice</p>
              <p className="text-amber-700 mt-1 leading-relaxed font-normal">{warning}</p>
            </div>
          </div>
        )}

        {/* Ticket Boarding Pass Card - Preserved MVP notched layout, 10px rounded-[10px] */}
        <div className="relative rounded-[10px] overflow-hidden shadow-sm border border-slate-200 bg-white mb-6">
          
          {/* Left/Right Notched Cutouts - must stay rounded-full circles */}
          <div className="absolute left-0 top-[60%] -translate-y-1/2 -ml-3.5 w-7 h-7 rounded-full border border-slate-200 z-10" style={{ backgroundColor: 'var(--bg-mesh-base)' }} />
          <div className="absolute right-0 top-[60%] -translate-y-1/2 -mr-3.5 w-7 h-7 rounded-full border border-slate-200 z-10" style={{ backgroundColor: 'var(--bg-mesh-base)' }} />

          {/* Header Accent (Primary dark color) */}
          <div className="bg-[#232F3E] text-white p-5">
            <span className="text-[10px] font-medium tracking-widest uppercase text-slate-300">
              Cloud Enthusiasts Success Ticket
            </span>
            <h2 className="font-medium text-base mt-1 font-display line-clamp-1 text-white">
              {event.title}
            </h2>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Participant Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-xs font-normal uppercase tracking-wider">Registration Reference</p>
                <p className="font-medium text-sm text-slate-800 mt-0.5">{regId || 'PENDING_REG'}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-xs font-normal uppercase tracking-wider">Ticket Status</p>
                <p className="font-medium text-sm text-amber-600 mt-0.5">Not Yet Available</p>
              </div>
            </div>

            {/* Perforated teardrop dashed line */}
            <div className="border-t-2 border-dashed border-slate-200 my-2" />

            {/* Logistics & Mock Check QR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-xs text-slate-500 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span>{eventDateStr}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span>{eventTimeStr} ({event.mode})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span className="truncate max-w-[200px]">{event.venue}</span>
                </div>
              </div>

              {/* QR Image Placeholder - "Ticket Not Yet Available" state, 10px rounded-[10px] */}
              <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-[10px] text-center shrink-0 w-28 h-28 flex flex-col justify-center items-center">
                <Ticket className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-snug">
                  Ticket Released shortly
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls - 8px rounded-[8px] */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/events"
            className="flex items-center justify-center space-x-1.5 border border-slate-200 text-slate-700 font-medium py-2 px-4.5 rounded-[8px] text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Events</span>
          </Link>
          
          <Link
            href={`/events/${eventId}?showTicket=true`}
            className="flex items-center justify-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 px-5 rounded-[8px] shadow-md text-xs"
          >
            <span>View Ticket on Event Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
