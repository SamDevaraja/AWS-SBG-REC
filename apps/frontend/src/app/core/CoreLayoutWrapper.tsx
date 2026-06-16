'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CoreSidebarShell from './CoreSidebarShell';

export default function CoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/core' || pathname === '/core/';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <CoreSidebarShell>{children}</CoreSidebarShell>;
}
