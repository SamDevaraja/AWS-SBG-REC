'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

// 1. Standard AWS Loading Spinner
export function EC2ConsoleLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative w-8 h-8">
        {/* Spinner Track */}
        <div className="w-8 h-8 rounded-full border-2 border-slate-100" />
        {/* Spinning Active Border */}
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-[#ff9900] border-t-transparent animate-spin" />
      </div>
      {message && (
        <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
          {message}
        </span>
      )}
    </div>
  );
}

// 2. Static Cloud Sync Loader
export function CloudSyncLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <p className="text-sm font-medium text-slate-700">Loading cloud data...</p>
    </div>
  );
}

// 3. Static Empty State
export function AnimatedEmptyState({
  title = 'No Events Discovered',
  description = 'There are no events currently scheduled matching your specific configuration criteria.',
  onClear,
}: {
  title?: string;
  description?: string;
  onClear?: () => void;
}) {
  return (
    <div className="text-center py-12 px-6 bg-white border border-slate-200 rounded-[10px] max-w-md mx-auto shadow-sm flex flex-col items-center justify-center">
      <h3 className="font-medium text-base text-[#232F3E] mb-1.5 font-display">{title}</h3>
      <p className="text-xs font-normal text-slate-500 mb-5 leading-relaxed max-w-xs">{description}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-[#232F3E] hover:text-[#1a232f] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-[8px] transition duration-200"
        >
          Reset View Filters
        </button>
      )}
    </div>
  );
}

// 4. Static Success Check
export function AnimatedSuccessCheck() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-teal-50 border border-teal-100 text-teal-600 p-4 rounded-full shadow-inner">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

// 5. Static Error Alert Panel
export function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="max-w-md mx-auto my-8 p-5 border border-rose-100 text-rose-800 rounded-[10px] shadow-sm text-center">
      <div className="inline-flex bg-rose-100 p-2 rounded-full text-rose-500 mb-3">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h4 className="font-medium text-sm text-slate-800 mb-1">Module Integration Fault</h4>
      <p className="text-xs font-normal text-rose-700/80 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#232F3E] hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-[8px] transition shadow-sm hover:shadow-md"
        >
          Retry Service Request
        </button>
      )}
    </div>
  );
}
