'use client';

import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  Map,
  MessageSquare,
  Newspaper,
  Award,
  QrCode,
  SearchCheck,
  ListTodo,
  ShieldAlert,
} from 'lucide-react';

const crewNavItems: NavItem[] = [
  { icon: <CalendarDays className="w-4 h-4" />, label: 'events', href: '/crew/events' },
  { icon: <Map className="w-4 h-4" />, label: 'roadmap', href: '/crew/dashboard#roadmap' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'chat', href: '/crew/dashboard#chat' },
  { icon: <Newspaper className="w-4 h-4" />, label: 'newsbot', href: '/news' },
  { icon: <Award className="w-4 h-4" />, label: 'certification', href: '/certifications' },
  { icon: <QrCode className="w-4 h-4" />, label: 'scanner', href: '/crew/scanner' },
  { icon: <SearchCheck className="w-4 h-4" />, label: 'verification', href: '/crew/verification' },
  { icon: <ListTodo className="w-4 h-4" />, label: 'tasks', href: '/crew/tasks' },
  { icon: <ShieldAlert className="w-4 h-4" />, label: 'incidents', href: '/crew/incidents' },
];
// HMR cache reload trigger: 1

export default function CrewSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Crew Member';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Crew' });
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <SidebarLayout
      navItems={crewNavItems}
      user={user}
      brandTitle={user?.name || 'Crew Member'}
      brandSubtitle={user?.badge || 'Crew'}
      homeHref="/crew/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
