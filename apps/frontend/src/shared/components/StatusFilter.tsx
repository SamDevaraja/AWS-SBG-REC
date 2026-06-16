import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function StatusFilter({
  value,
  onChange,
  options,
  placeholder = 'All Status',
}: StatusFilterProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-slate-200 rounded-[8px] text-sm pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}
