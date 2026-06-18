'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEventDetails } from '../shared/hooks/useCloudEnthusiasts';
import { apiService } from '../shared/services/apiService';
import { EC2ConsoleLoader, ErrorAlert } from '../shared/components/Animations';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ShieldAlert, Ticket as TicketIcon, Linkedin } from 'lucide-react';
import TicketModal from '../shared/components/TicketModal';
import { Ticket } from '../shared/types';
import { STORAGE_KEYS } from '../../../context/mockData';
import { cn } from '@/lib/utils';

/** Shape of a ticket entry saved to localStorage */
interface LocalTicket {
  ticketId: string;
  eventId: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;

  const { data: detailData, isLoading, error, refetch } = useEventDetails(eventId);

  const [registeredTicket, setRegisteredTicket] = useState<LocalTicket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const handleRemoveStale = useCallback(() => {
    const localTickets: LocalTicket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
    const filtered = localTickets.filter((t) => t.eventId !== eventId);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(filtered));
    setRegisteredTicket(null);
  }, [eventId]);

  useEffect(() => {
    const localTickets: LocalTicket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
    const found = localTickets.find((t) => t.eventId === eventId);
    
    if (found) {
      apiService.getTicketVerification(found.ticketId)
        .then((data) => {
          if (data.success && data.ticket) {
            setRegisteredTicket(found);
            if (searchParams.get('showTicket') === 'true') {
              setIsTicketModalOpen(true);
            }
          } else if (data.status === 'Invalid Ticket' || data.error?.includes('not found') || data.error?.includes('registration logs')) {
            // Ticket invalid, remove stale data from localStorage
            handleRemoveStale();
          } else {
            // Keep ticket for local display
            setRegisteredTicket(found);
          }
        })
        .catch(() => {
          // Do not delete on transient network error, keep registration ticket
          setRegisteredTicket(found);
        })
        .finally(() => {
          setCheckingRegistration(false);
        });
    } else {
      setCheckingRegistration(false);
    }
  }, [eventId, searchParams, handleRemoveStale]);

  useEffect(() => {
    if (isTicketModalOpen && registeredTicket && !ticketDetails) {
      setLoadingTicket(true);
      setTicketError(null);
      apiService.getTicketVerification(registeredTicket.ticketId)
        .then((data) => {
          if (data.success) {
            setTicketDetails(data.ticket ?? null);
          } else {
            setTicketError(data.error || 'Failed to load ticket');
            if (data.status === 'Invalid Ticket' || data.error?.includes('not found') || data.error?.includes('registration logs')) {
              handleRemoveStale();
            }
          }
        })
        .catch((err: Error) => {
          setTicketError(err.message || 'An error occurred while loading your ticket');
          if (err.message?.includes('not found') || err.message?.includes('Invalid Ticket') || err.message?.includes('registration logs')) {
            handleRemoveStale();
          }
        })
        .finally(() => {
          setLoadingTicket(false);
        });
    }
  }, [isTicketModalOpen, registeredTicket, ticketDetails, handleRemoveStale]);


  if (isLoading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <EC2ConsoleLoader message="Retrieving event details logs..." />
      </div>
    );
  }

  if (error || !detailData?.event) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <ErrorAlert
            message={error ? (error as Error).message : 'The requested cloud event could not be found.'}
            onRetry={refetch}
          />
          <div className="text-center mt-4">
              <Link
                href="/events"
                className="inline-flex items-center space-x-1.5 text-[#232F3E] hover:text-[#1a232f] font-medium transition text-xs"
              >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event } = detailData;
  const seatsLeft = Math.max(0, event.max_capacity - (event.registered || 0));
  const isFull = seatsLeft === 0;
  const isEnded = event.event_status === 'Ended';

  const startTimeStr = new Date(event.start_datetime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const startDateStr = new Date(event.start_datetime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const deadlineDate = new Date(event.registration_deadline);
  const deadlineDateStr = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' - ' + deadlineDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
      <div className="w-full max-w-screen-xl mx-auto">
        
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-lg text-xs shadow-sm transition-all duration-150 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150 text-slate-500" />
            <span className="tracking-wide">Back to Events</span>
          </Link>
        </div>

        {/* Single Unified Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Main Content Area */}
          <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Details & Speakers */}
            <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-start">
              
              {/* Left Sub-column: Poster & Speakers (Desktop) */}
              <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 md:sticky md:top-6 space-y-6 mx-auto md:mx-0">
                {/* Poster Container */}
                {event.banner_url ? (
                  <div className="relative w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                    {/* Sharp Centered Poster */}
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="relative z-10 max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                    <Users className="w-12 h-12 text-slate-300" />
                  </div>
                )}

                {/* Speakers Section (Desktop Only) */}
                {event.speaker_details && event.speaker_details.length > 0 && (
                  <div className="hidden md:block pt-6 border-t border-slate-100 space-y-5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Event Host & Speakers
                    </h3>
                    
                    <div className="space-y-5">
                      {event.speaker_details.map((speaker, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          {/* Rectangular Portrait Avatar Placeholder */}
                          <div className="w-12 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-center shadow-xs">
                            {speaker.avatar_url ? (
                              <img
                                src={speaker.avatar_url}
                                alt={speaker.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-slate-400/80" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-800 leading-snug">{speaker.name}</h4>
                              {speaker.linkedin_url && (
                                <a
                                  href={speaker.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-[#0A66C2] transition-colors inline-flex items-center mt-0.5 shrink-0"
                                  title={`${speaker.name}'s LinkedIn Profile`}
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                            {speaker.designation && (
                              <span className="text-[#FF9900] text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                                {speaker.designation}
                              </span>
                            )}
                            {speaker.bio && (
                              <p className="text-slate-500 text-xs mt-1 leading-relaxed font-normal">
                                {speaker.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sub-column: Title, About, Speakers (Mobile) */}
              <div className="flex-1 space-y-6">
                
                {/* Event Title Block */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border",
                      event.mode === "Virtual"
                        ? "bg-blue-50 text-blue-700 border-blue-200/60"
                        : "bg-purple-50 text-purple-700 border-purple-200/60"
                    )}>
                      {event.mode}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border",
                      isEnded
                        ? "bg-slate-100 text-slate-650 border-slate-200"
                        : isFull
                          ? "bg-rose-50 text-rose-700 border-rose-200/60"
                          : "bg-emerald-50 text-emerald-755 border-emerald-200/60"
                    )}>
                      {isEnded ? "Ended" : isFull ? "Fully Booked" : "Registration Open"}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#232F3E] tracking-tight leading-tight">
                    {event.title}
                  </h1>
                  {event.short_description && (
                    <p className="text-slate-500 text-sm font-normal leading-relaxed">
                      {event.short_description}
                    </p>
                  )}
                </div>

                {/* About Event Description */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    About the Event
                  </h3>
                  <p className="text-slate-600 text-sm font-normal leading-relaxed whitespace-pre-line">
                    {event.full_description}
                  </p>
                </div>

                {/* Speakers Section (Mobile Only) */}
                {event.speaker_details && event.speaker_details.length > 0 && (
                  <div className="md:hidden pt-6 border-t border-slate-100 space-y-5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Event Host & Speakers
                    </h3>
                    
                    <div className="space-y-5">
                      {event.speaker_details.map((speaker, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          {/* Rectangular Portrait Avatar Placeholder */}
                          <div className="w-12 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-center shadow-xs">
                            {speaker.avatar_url ? (
                              <img
                                src={speaker.avatar_url}
                                alt={speaker.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-slate-400/80" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-800 leading-snug">{speaker.name}</h4>
                              {speaker.linkedin_url && (
                                <a
                                  href={speaker.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-[#0A66C2] transition-colors inline-flex items-center mt-0.5 shrink-0"
                                  title={`${speaker.name}'s LinkedIn Profile`}
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                            {speaker.designation && (
                              <span className="text-[#FF9900] text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                                {speaker.designation}
                              </span>
                            )}
                            {speaker.bio && (
                              <p className="text-slate-500 text-xs mt-1 leading-relaxed font-normal">
                                {speaker.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              
            </div>

            {/* Right Column: Logistics Details (Sticky on desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start lg:border-l lg:border-slate-100 lg:pl-8 space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450">
                  Event Details
                </h3>
                
                <div className="space-y-5">
                  {/* Date */}
                  <div className="flex items-start gap-3.5">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1">{startDateStr}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3.5">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time & Mode</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1">{startTimeStr} ({event.mode})</span>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Location / Venue</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1 leading-snug">{event.venue}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  {!isEnded && (
                    <div className="flex items-start gap-3.5 pt-4 border-t border-slate-100">
                      <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Registration Deadline</span>
                        <span className="text-sm sm:text-base font-extrabold text-rose-600 block mt-1 leading-snug">{deadlineDateStr}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity Progress Bar */}
              {!isEnded && (
                <div className="pt-6 border-t border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                    <span>Seats Filled</span>
                    <span>{isFull ? "100%" : `${Math.round(((event.registered || 0) / event.max_capacity) * 100)}%`}</span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isFull ? "bg-rose-500" : "bg-[#FF9900]"
                      )}
                      style={{ width: `${Math.min(100, Math.max(2, ((event.registered || 0) / event.max_capacity) * 100))}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                    <span>{event.registered || 0} Registered</span>
                    <span>{seatsLeft} Seats Available</span>
                  </div>
                </div>
              )}

              {/* Action Button (Desktop Only) */}
              <div className="hidden lg:block pt-4 border-t border-slate-100">
                {checkingRegistration ? (
                  <button
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
                  >
                    Checking status...
                  </button>
                ) : registeredTicket ? (
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="w-full bg-[#232F3E] text-white hover:bg-[#1f2735] font-extrabold py-3 rounded-xl text-sm transition-colors duration-150 cursor-pointer shadow-sm"
                  >
                    View Secure Pass
                  </button>
                ) : isEnded ? (
                  <button
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
                  >
                    Event Ended
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
                  >
                    Sold Out
                  </button>
                ) : (
                  <Link
                    href={`/events/${eventId}/register`}
                    className="w-full flex items-center justify-center bg-[#232F3E] text-white hover:bg-[#1f2735] border border-transparent hover:border-[#FF9900] hover:shadow-[0_0_0_3px_rgba(255,153,0,0.12),0_8px_24px_rgba(255,153,0,0.10)] hover:-translate-y-1 font-extrabold py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <span>Register Now</span>
                  </Link>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Mobile Fixed Bottom Registration Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seats Available</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-0.5">{seatsLeft} / {event.max_capacity} Left</span>
        </div>
        <div className="shrink-0 w-48">
          {checkingRegistration ? (
            <button
              disabled
              className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
            >
              Checking status...
            </button>
          ) : registeredTicket ? (
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="w-full bg-[#232F3E] text-white hover:bg-[#1f2735] font-extrabold py-3 rounded-xl text-sm transition-colors duration-150 cursor-pointer shadow-sm"
            >
              View Secure Pass
            </button>
          ) : isEnded ? (
            <button
              disabled
              className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
            >
              Event Ended
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
            >
              Sold Out
            </button>
          ) : (
            <Link
              href={`/events/${eventId}/register`}
              className="w-full flex items-center justify-center bg-[#232F3E] text-white hover:bg-[#1f2735] border border-transparent hover:border-[#FF9900] hover:shadow-[0_0_0_3px_rgba(255,153,0,0.12),0_8px_24px_rgba(255,153,0,0.10)] hover:-translate-y-1 font-extrabold py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer shadow-sm"
            >
              <span>Register Now</span>
            </Link>
          )}
        </div>
      </div>

      {/* Loading Ticket details Overlay */}
      {isTicketModalOpen && loadingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[10px] shadow-xl border border-slate-200 w-full max-w-md overflow-hidden z-10 p-6 text-center">
            <EC2ConsoleLoader message="Retrieving secure entry pass..." />
          </div>
        </div>
      )}

      {/* Ticket load Error dialog */}
      {isTicketModalOpen && ticketError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTicketModalOpen(false)} />
          <div className="relative bg-white rounded-[10px] shadow-xl border border-slate-200 w-full max-w-md overflow-hidden z-10 p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-lg mb-2 font-display">Failed to Load Ticket</h3>
            <p className="text-slate-500 text-xs mb-5 leading-relaxed font-normal">{ticketError}</p>
            <button 
              onClick={() => setIsTicketModalOpen(false)}
              className="bg-[#232F3E] text-white px-5 py-2 rounded-[8px] text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full Ticket Modal Pass */}
      {isTicketModalOpen && ticketDetails && (
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          ticket={ticketDetails}
        />
      )}
    </div>
  );
}
