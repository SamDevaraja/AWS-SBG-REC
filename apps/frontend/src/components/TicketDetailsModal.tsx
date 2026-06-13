'use client';

import React, { useRef } from 'react';
import { X, Download, Clock, RefreshCw, Mail } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import type { Ticket } from '@/lib/types';

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
  onRegenerate: (id: string) => void;
  onEmail: (id: string) => void;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export default function TicketDetailsModal({
  ticket,
  onClose,
  onRegenerate,
  onEmail,
}: TicketDetailsModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const dataUrl = await toPng(ticketRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1,
      });

      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticketCode.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download ticket:', error);
    }
  };

  const formattedDate = formatDate(ticket.event?.date);
  const attendeeName = ticket.registration?.user
    ? `${ticket.registration.user.firstName} ${ticket.registration.user.lastName}`
    : '—';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'border-emerald-200 bg-emerald-50/50 text-emerald-700';
      case 'USED':
        return 'border-blue-200 bg-blue-50/50 text-blue-700';
      case 'CANCELLED':
        return 'border-rose-200 bg-rose-50/50 text-rose-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Pass Active';
      case 'USED':
        return 'Pass Used';
      case 'CANCELLED':
        return 'Pass Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Close Button - Floating outside ticket top-right */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-20 bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 w-9 h-9 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket Card */}
        <div
          ref={ticketRef}
          className="bg-white rounded-[24px] shadow-2xl relative overflow-hidden"
        >
          {/* Top Curved Notch */}
          <div className="relative h-5 bg-white">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-5 bg-slate-100 rounded-b-[14px]" />
          </div>

          {/* QR Section */}
          <div className="px-6 pt-1 pb-4">
            <div className="border border-slate-200/80 rounded-[14px] p-3 bg-white">
              <div className="w-[140px] h-[140px] mx-auto bg-slate-50/50 rounded-[10px] flex items-center justify-center">
                {ticket.ticketCode ? (
                  <QRCodeSVG value={ticket.ticketCode} size={120} level="H" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-300">
                    <svg
                      className="w-10 h-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="7"
                        y="7"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <rect
                        x="14"
                        y="7"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <rect
                        x="7"
                        y="14"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="3"
                        height="3"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.3"
                      />
                    </svg>
                    <span className="text-sm font-normal text-slate-600 font-display">
                      QR Code Pending
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tear Line */}
          <div className="my-1">
            <div className="border-t-2 border-dotted border-slate-200 mx-3" />
          </div>

          {/* Content */}
          <div className="px-6 pt-4 pb-5">
            {/* Event Title */}
            <h2 className="text-lg font-medium text-slate-800 leading-tight mb-4 text-center font-display">
              {ticket.event?.title ?? '—'}
            </h2>

            {/* Info Rows */}
            <div className="space-y-3 font-display">
              <div className="flex items-center justify-between">
                <span className="text-base font-normal text-slate-800 w-[80px] shrink-0">Name</span>
                <span className="text-base font-medium text-slate-800 text-right flex-1 truncate">
                  {attendeeName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-normal text-slate-800 w-[80px] shrink-0">Date</span>
                <span className="text-base font-medium text-slate-800 text-right flex-1">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-normal text-slate-800 w-[80px] shrink-0">Time</span>
                <span className="text-base font-medium text-slate-800 text-right flex-1">
                  {ticket.event?.time ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-normal text-slate-800 w-[80px] shrink-0">
                  Venue
                </span>
                <span className="text-base font-medium text-slate-800 text-right flex-1 break-words">
                  {ticket.event?.venue ?? '—'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-5 font-display">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-medium uppercase tracking-wider ${getStatusStyle(
                  ticket.status,
                )}`}
              >
                <Clock className="w-4 h-4" />
                <span>{getStatusLabel(ticket.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={handleDownload}
            className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-3 px-3 rounded-xl shadow-md text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={() => onRegenerate(ticket.id)}
            className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-3 px-3 rounded-xl shadow-md text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={() => onEmail(ticket.id)}
            className="bg-[#232F3E] hover:opacity-90 text-white font-medium py-3 px-3 rounded-xl shadow-md text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
