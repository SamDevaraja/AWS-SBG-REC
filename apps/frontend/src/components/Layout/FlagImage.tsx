"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface FlagImageProps {
  flag: string | null | undefined; // Legacy emoji or flagUrl
  name?: string; // Optional region/category name for fallback character
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FlagImage({ flag, name, className = "w-5 h-5 object-contain" }: FlagImageProps) {
  const [hasError, setHasError] = useState(false);

  // If missing flag or flag has error, render the fallback placeholder
  if (!flag || hasError) {
    const fallbackText = name ? name.trim().charAt(0).toUpperCase() : "";
    return (
      <div 
        className={`${className} flex items-center justify-center bg-slate-800 text-white rounded-md font-black select-none text-[10px] border border-slate-700/50 shadow-sm`}
        style={{ minWidth: '20px', minHeight: '15px' }}
      >
        {fallbackText || <Globe size={10} className="text-slate-400" />}
      </div>
    );
  }

  const isUrl = flag.startsWith('/') || flag.startsWith('http') || flag.includes('.') || flag.includes('data:');

  if (isUrl) {
    const src = flag.startsWith('/') ? `${API_URL}${flag}` : flag;
    return (
      <img 
        src={src} 
        className={`${className} rounded-sm`} 
        alt={name || "Flag"} 
        onError={() => setHasError(true)}
      />
    );
  }

  // Legacy emoji fallback
  return <span className={`${className} flex items-center justify-center select-none`}>{flag}</span>;
}
