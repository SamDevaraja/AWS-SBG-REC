import React from 'react';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function DateFilter({ value, onChange, label, className = '' }: DateFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs text-slate-500">{label}</span>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
      />
    </div>
  );
}
