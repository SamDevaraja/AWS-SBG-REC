'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  placeholder = 'Filter by Date Range'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const initialDate = startDate ? new Date(startDate) : new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format YYYY-MM-DD to a nice label like "Jun 19, 2026"
  function formatDateLabel(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Month navigation helpers
  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Day of week of the 1st of the month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Helper to format date object to YYYY-MM-DD string
  function toDateString(d: number) {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  }

  // Handle day click logic
  function handleDayClick(day: number) {
    const clickedDateStr = toDateString(day);

    if (!startDate || (startDate && endDate)) {
      onStartChange(clickedDateStr);
      onEndChange('');
    } else {
      if (clickedDateStr < startDate) {
        onStartChange(clickedDateStr);
      } else {
        onEndChange(clickedDateStr);
        setIsOpen(false); // Close dropdown once full range is selected
      }
    }
  }

  // Check if a day is selected as start/end or falls within the selected range
  function getDayStatus(day: number) {
    const clickedDateStr = toDateString(day);
    if (clickedDateStr === startDate && clickedDateStr === endDate) {
      return 'endpoint';
    }
    if (clickedDateStr === startDate) return 'start';
    if (clickedDateStr === endDate) return 'end';
    if (startDate && endDate && clickedDateStr > startDate && clickedDateStr < endDate) {
      return 'in-range';
    }
    return 'none';
  }

  // Quick action helpers
  function clearRange() {
    onStartChange('');
    onEndChange('');
    setIsOpen(false);
  }

  function selectToday() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onStartChange(dateStr);
    onEndChange(dateStr);
    setIsOpen(false);
  }

  const rangeText = startDate
    ? `${formatDateLabel(startDate)}${endDate ? ` — ${formatDateLabel(endDate)}` : '...'}`
    : placeholder;

  // Month names for rendering
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="relative" ref={containerRef}>
      {/* Date Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50 rounded-xl px-3 py-2 transition-all focus:outline-none shrink-0 cursor-pointer text-left text-xs text-slate-600 font-medium min-w-[210px]"
      >
        <CalendarIcon size={13} className="text-slate-400 shrink-0" />
        <span className={startDate ? 'text-slate-700 font-semibold' : 'text-slate-400'}>
          {rangeText}
        </span>
        {startDate && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clearRange();
            }}
            className="ml-auto p-0.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {/* Calendar Dropdown Card */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 w-[280px] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-bold text-slate-800">{monthName}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Label */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 justify-items-center text-center">
            {/* Previous month days buffer */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-8 h-8" />
            ))}

            {/* Current month days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const status = getDayStatus(day);
              
              let dayClass = 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-full';
              if (status === 'start' || status === 'end' || status === 'endpoint') {
                dayClass = 'bg-[#FF9900] text-white shadow-sm shadow-orange-500/20 rounded-full';
              } else if (status === 'in-range') {
                dayClass = 'bg-orange-50 text-orange-600 rounded-none w-full';
              }

              return (
                <div
                  key={`day-${day}`}
                  className="w-full flex items-center justify-center relative"
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`h-8 w-8 text-[11.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${dayClass}`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={clearRange}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={selectToday}
              className="text-[11px] font-bold text-[#FF9900] hover:text-orange-600 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
