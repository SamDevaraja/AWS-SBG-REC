'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CoreSidebarShell from './CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';

export default function CoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setRole((parsed.role || 'enthusiasts').toLowerCase());
      }
    } catch {}
  }, []);

  const isLoginPage = pathname === '/core' || pathname === '/core/';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (role === 'crew') {
    return <CrewSidebarShell>{children}</CrewSidebarShell>;
  }

  return <CoreSidebarShell>{children}</CoreSidebarShell>;
}
