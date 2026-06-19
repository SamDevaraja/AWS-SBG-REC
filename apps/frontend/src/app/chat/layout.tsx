import type { Metadata } from 'next';
import EventsSidebarShell from '../events/EventsSidebarShell';

export const metadata: Metadata = {
  title: 'AWS SBG REC - Chat',
  description: 'Chat with the Chat Assistant or the Core team.',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <EventsSidebarShell>{children}</EventsSidebarShell>;
}
