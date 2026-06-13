import type { Metadata } from 'next';
import CrewSidebarShell from './CrewSidebarShell';
// HMR cache reload trigger: 2

export const metadata: Metadata = {
  title: 'Nexus Connect - Crew Operations Platform',
  description:
    'Real-time event operations, ticket scanning, attendance verification, tasks tracking, and incident logging.',
  icons: {
    icon: '/brand-logo.png',
  },
};

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  return <CrewSidebarShell>{children}</CrewSidebarShell>;
}
