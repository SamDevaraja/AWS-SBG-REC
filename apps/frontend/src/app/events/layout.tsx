import type { Metadata } from 'next';
import EventsSidebarShell from './EventsSidebarShell';

export const metadata: Metadata = {
  title: 'AWS SBG REC',
  description: 'Browse and register for upcoming AWS cloud events, bootcamps, and workshops.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <EventsSidebarShell>{children}</EventsSidebarShell>;
}
