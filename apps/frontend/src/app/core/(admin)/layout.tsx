import type { Metadata } from 'next';
import CoreSidebarShell from './CoreSidebarShell';

export const metadata: Metadata = {
  title: 'Event Registration Core',
  description: 'Event Registration and Management System',
  icons: {
    icon: '/brand-logo.png',
  },
};

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return <CoreSidebarShell>{children}</CoreSidebarShell>;
}
