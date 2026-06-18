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
  Newspaper,
  Bell,
  Cpu,
} from 'lucide-react';

const coreNavItems: NavItem[] = [
  { icon: <CalendarDays className="w-4 h-4" />, label: 'events', href: '/core/events' },
  { icon: <Newspaper className="w-4 h-4" />, label: 'news', href: '/news' },
  { icon: <Map className="w-4 h-4" />, label: 'roadmap builder', href: '/core/topics' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'chat', href: '/core/chat' },
  { icon: <Award className="w-4 h-4" />, label: 'certifications', href: '/certifications' },
  { icon: <Cpu className="w-4 h-4" />, label: 'services', href: '/services' },
];

const coreBottomNavItems: NavItem[] = [
  { icon: <Bell className="w-4 h-4" />, label: 'announcements', href: '/core/announcements' },
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
      bottomNavItems={coreBottomNavItems}
      user={user}
      brandTitle={user?.name || 'Admin'}
      brandSubtitle={user?.badge || 'Core Admin'}
      homeHref="/core/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
