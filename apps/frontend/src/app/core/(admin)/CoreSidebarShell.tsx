'use client';

import React, { useEffect, useState } from 'react';
// Force recompile trigger: 2
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  Map,
  MessageSquare,
  Award,
  Users,
  Ticket,
  ClipboardList,
  BarChart3,
  Newspaper,
} from 'lucide-react';

const coreNavItems: NavItem[] = [
  { icon: <CalendarDays className="w-4 h-4" />, label: 'events', href: '/core/events' },
  { icon: <Newspaper className="w-4 h-4" />, label: 'news', href: '/news' },
  { icon: <Map className="w-4 h-4" />, label: 'roadmap', href: '/core/dashboard#roadmap' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'chat', href: '/core/dashboard#chat' },
  { icon: <Award className="w-4 h-4" />, label: 'certification', href: '/certifications' },
  { icon: <Users className="w-4 h-4" />, label: 'registrations', href: '/core/registrations' },
  { icon: <Ticket className="w-4 h-4" />, label: 'tickets', href: '/core/tickets' },
  { icon: <ClipboardList className="w-4 h-4" />, label: 'attendance', href: '/core/attendance' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'analytics', href: '/core/analytics' },
];

export default function CoreSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Admin';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Core Admin' });
      }
    } catch { /* ignore */ }
  }, []);

  console.log('CoreSidebarShell render: coreNavItems length =', coreNavItems.length, 'items =', coreNavItems.map(item => item.label));

  return (
    <SidebarLayout
      navItems={coreNavItems}
      user={user}
      brandTitle={user?.name || 'Admin'}
      brandSubtitle={user?.badge || 'Core Admin'}
      homeHref="/core/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
