'use client';

import React, { useEffect, useState } from 'react';
import CoreSidebarShell from '@/app/core/CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';
import EventsSidebarShell from '@/app/events/EventsSidebarShell';

export default function CertificationsLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      console.log('CertificationsLayout: raw user from localStorage =', raw);
      if (raw) {
        const user = JSON.parse(raw);
        const userRole = (user?.role ?? '').toLowerCase().trim();
        console.log('CertificationsLayout: parsed userRole =', userRole);
        setRole(userRole);
      } else {
        console.log('CertificationsLayout: no user in localStorage');
      }
    } catch (e) {
      console.error('CertificationsLayout: error reading localStorage', e);
    }
  }, []);

  console.log('CertificationsLayout render: role =', role, 'mounted =', mounted);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role === 'core') {
    console.log('CertificationsLayout: rendering CoreSidebarShell');
    return <CoreSidebarShell>{children}</CoreSidebarShell>;
  }
  if (role === 'crew') {
    console.log('CertificationsLayout: rendering CrewSidebarShell');
    return <CrewSidebarShell>{children}</CrewSidebarShell>;
  }
  // Default to attendee/events shell
  console.log('CertificationsLayout: rendering default EventsSidebarShell');
  return <EventsSidebarShell>{children}</EventsSidebarShell>;
}
