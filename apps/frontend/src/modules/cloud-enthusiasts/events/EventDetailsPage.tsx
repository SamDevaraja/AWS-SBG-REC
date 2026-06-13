'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEventDetails } from '../shared/hooks/useCloudEnthusiasts';
import { apiService } from '../shared/services/apiService';
import { EC2ConsoleLoader, ErrorAlert } from '../shared/components/Animations';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ShieldAlert, Ticket as TicketIcon } from 'lucide-react';
import TicketModal from '../shared/components/TicketModal';
import { Ticket } from '../shared/types';
import { STORAGE_KEYS } from '../../../context/mockData';

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
          } else {
            // Ticket invalid, remove stale data from localStorage
            handleRemoveStale();
          }
        })
        .catch(() => {
          // On error, remove stale data
          handleRemoveStale();
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
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-xl mx-auto">
        

        {/* Main Hero Section - Poster + Event Info + CTA */}
        <div className="bg-white border border-slate-200 rounded-[10px] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 mb-6">
          
          {/* Left: Poster Image */}
          <div className="md:col-span-5 relative min-h-[280px] md:min-h-[400px] bg-slate-900">
            <img
              src={event.banner_url}
              alt={`${event.title} Poster`}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>

          {/* Right: Details & Registration */}
          <div className="md:col-span-7 p-5 sm:p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Title & Short Description */}
              <div>
                <h1 className="font-semibold text-xl sm:text-2xl text-slate-900 leading-tight font-display mb-1.5">
                  {event.title}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                  {event.short_description}
                </p>
              </div>

              {/* Logistics List - Simple icon + text style matching EventsPage */}
              <div className="space-y-2.5 text-sm font-normal text-slate-600 border-t border-slate-50 pt-3.5">
                
                {/* Date */}
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span>{startDateStr}</span>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span>{startTimeStr} ({event.mode})</span>
                </div>

                {/* Venue */}
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  <span className="leading-tight">{event.venue}</span>
                </div>

                {/* Seats */}
                <div className="flex items-center space-x-2.5">
                  <Users className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                  {isEnded ? (
                    <span>Ended</span>
                  ) : isFull ? (
                    <span className="text-rose-600">Fully Booked</span>
                  ) : (
                    <span>{seatsLeft} / {event.max_capacity} Registered</span>
                  )}
                </div>

                {/* Registration Deadline */}
                {!isEnded && (
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#232F3E] shrink-0" />
                    <span>{deadlineDateStr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Register / CTA Action Button */}
            <div className="pt-4">
              {checkingRegistration ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 font-medium py-2 rounded-[8px] cursor-not-allowed text-xs sm:text-sm"
                >
                  Checking registration status...
                </button>
              ) : registeredTicket ? (
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 rounded-[8px] shadow-sm text-xs sm:text-sm hover:shadow-[-12px_0_26px_rgba(255,105,180,0.45),12px_0_26px_rgba(168,85,247,0.45),0_8px_18px_rgba(15,23,42,0.12)] transition-[box-shadow] duration-[0.25s] ease-out"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>View Ticket</span>
                </button>
              ) : isEnded ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 font-medium py-2 rounded-[8px] cursor-not-allowed text-xs sm:text-sm"
                >
                  Event Closed
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 font-medium py-2 rounded-[8px] cursor-not-allowed text-xs sm:text-sm"
                >
                  Sold Out
                </button>
              ) : (
                <Link
                  href={`/events/${eventId}/register`}
                  className="w-full flex items-center justify-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 rounded-[8px] shadow-sm text-xs sm:text-sm hover:shadow-[-12px_0_26px_rgba(255,105,180,0.45),12px_0_26px_rgba(168,85,247,0.45),0_8px_18px_rgba(15,23,42,0.12)] transition-[box-shadow] duration-[0.25s] ease-out"
                >
                  <span>Register Now</span>
                </Link>
              )}
            </div>

          </div>

        </div>

        {/* About Event & Speaker - Continuous Flow (no separate cards) */}
        <div className="bg-white border border-slate-200 rounded-[10px] p-5 sm:p-6 shadow-sm">
          
          {/* About the Event */}
          <div className="mb-5">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2 font-display">
              About the Event
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line">
              {event.full_description}
            </p>
          </div>

          {/* Event Host & Speaker - visually connected */}
          {event.speaker_details && event.speaker_details.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-3 font-display">
                Event Host & Speaker
              </h3>
              <div className="space-y-3">
                {event.speaker_details.map((speaker, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    {speaker.avatar_url ? (
                      <img
                        src={speaker.avatar_url}
                        alt={speaker.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800">{speaker.name}</h4>
                      {speaker.designation && (
                        <p className="text-[#232F3E] text-[9px] font-semibold uppercase tracking-wider mt-0.5">{speaker.designation}</p>
                      )}
                      {speaker.bio && (
                        <p className="text-slate-500 text-[11px] font-normal mt-1 leading-relaxed">{speaker.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
