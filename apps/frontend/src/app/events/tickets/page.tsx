'use client';

import React from 'react';
import Link from 'next/link';
import { useTickets } from '@/modules/cloud-enthusiasts/shared/hooks/useCloudEnthusiasts';
import { Ticket as TicketIcon, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { EC2ConsoleLoader } from '@/modules/cloud-enthusiasts/shared/components/Animations';

export default function MyTicketsPage() {
  const { data: tickets = [], isLoading } = useTickets();

  if (isLoading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <EC2ConsoleLoader message="Retrieving your tickets..." />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="mb-6">
          <h1 className="font-semibold text-2xl text-slate-900 mb-1 font-display">
            My Tickets
          </h1>
          <p className="text-slate-500 max-w-xl text-xs sm:text-sm font-normal">
            Access your secure entry passes for registered cloud events and workshops.
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-[10px] p-12 text-center bg-white/50 backdrop-blur-sm">
            <div className="mx-auto bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <TicketIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-800 mb-1">No tickets found</h3>
            <p className="text-xs text-slate-500 mb-4">You haven't registered for any events yet.</p>
            <Link
              href="/events"
              className="inline-flex items-center space-x-1.5 bg-[#232F3E] text-white font-medium px-4 py-2 rounded-[8px] shadow-sm text-xs transition"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="bg-white border border-slate-200 rounded-[10px] shadow-sm overflow-hidden flex flex-col relative premium-glow-container"
              >
                <div className="h-20 w-full bg-[#232F3E] relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                   <h3 className="text-white font-bold text-lg font-display px-4 text-center line-clamp-1 relative z-10">
                     {ticket.event_title || 'Event Ticket'}
                   </h3>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between bg-white relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Ticket Code</span>
                      <p className="font-mono text-sm font-semibold text-slate-800">{ticket.ticket_code}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5 text-xs font-normal text-slate-600">
                    {ticket.event_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                        <span>{ticket.event_date}</span>
                      </div>
                    )}
                    {ticket.event_time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                        <span>{ticket.event_time}</span>
                      </div>
                    )}
                    {ticket.user_name && (
                      <div className="flex items-center space-x-2">
                        <TicketIcon className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                        <span className="truncate">{ticket.user_name}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/events/${ticket.event_id}?showTicket=true`}
                    className="w-full flex items-center justify-center space-x-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium py-2 rounded-[8px] transition text-xs"
                  >
                    <TicketIcon className="w-3.5 h-3.5" />
                    <span>View Secure Pass</span>
                  </Link>
                </div>
                
                {/* Perforation decorative line */}
                <div className="absolute left-0 right-0 top-20 h-[2px] bg-white flex justify-between z-20 px-1 transform -translate-y-1/2">
                   {Array.from({ length: 12 }).map((_, i) => (
                     <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-100 shadow-inner" />
                   ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
