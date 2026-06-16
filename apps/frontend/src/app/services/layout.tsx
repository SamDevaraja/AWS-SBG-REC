'use client';

import React, { useEffect, useState } from 'react';
import CoreSidebarShell from '@/app/core/CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';
import EventsSidebarShell from '@/app/events/EventsSidebarShell';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const user = JSON.parse(raw);
        const userRole = (user?.role ?? '').toLowerCase().trim();
        setRole(userRole);
      }
    } catch { /* ignore */ }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#232F3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const servicesContent = (
    <div className="services-theme min-h-screen w-full bg-slate-50/50">
      {children}
    </div>
  );

  if (role === 'core') {
    return <CoreSidebarShell>{servicesContent}</CoreSidebarShell>;
  }
  if (role === 'crew') {
    return <CrewSidebarShell>{servicesContent}</CrewSidebarShell>;
  }
  // Default to attendee/events shell
  return <EventsSidebarShell>{servicesContent}</EventsSidebarShell>;
}
