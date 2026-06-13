import React from 'react';

interface TableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function TableToolbar({ children, className = '' }: TableToolbarProps) {
  return (
    <div className={`border border-slate-200 bg-white rounded-[10px] shadow-sm p-4 ${className}`}>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
