'use client';

import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  User,
  Award,
  Map,
  MessageSquare,
  Database,
  Newspaper,
} from 'lucide-react';

const eventsNavItems: NavItem[] = [
  { icon: <CalendarDays className="w-4 h-4" />, label: 'events', href: '/events' },
  { icon: <Newspaper className="w-4 h-4" />, label: 'news', href: '/news' },
  { icon: <Map className="w-4 h-4" />, label: 'roadmap', href: '/events#roadmap' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'chat', href: '/events#chat' },
  { icon: <Award className="w-4 h-4" />, label: 'certification', href: '/certifications' },
];

export default function EventsSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Attendee';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Enthusiast' });
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <SidebarLayout
      navItems={eventsNavItems}
      user={user}
      brandTitle={user?.name || 'Attendee'}
      brandSubtitle={user?.badge || 'Enthusiast'}
      homeHref="/events/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
