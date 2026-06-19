'use client';

import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  Map,
  MessageSquare,
  Award,
  QrCode,
  SearchCheck,
  ListTodo,
  ShieldAlert,
  Newspaper,
  Cpu,
} from 'lucide-react';

const crewNavItems: NavItem[] = [
  { icon: <CalendarDays className="w-4 h-4" />, label: 'events', href: '/crew/events' },
  { icon: <Newspaper className="w-4 h-4" />, label: 'news', href: '/news' },
  { icon: <Map className="w-4 h-4" />, label: 'roadmap', href: '/learn' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'chat', href: '/crew/chat' },
  { icon: <Award className="w-4 h-4" />, label: 'certifications', href: '/certifications' },
  { icon: <Cpu className="w-4 h-4" />, label: 'services', href: '/services' },
];

const crewBottomNavItems: NavItem[] = [
  { icon: <ShieldAlert className="w-4 h-4" />, label: 'incidents', href: '/crew/incidents' },
];
// HMR cache reload trigger: 2

export default function CrewSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

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

        if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.permissions) {
                setActivePermissions(data.permissions);
              }
            })
            .catch((err) => console.error('Error fetching permissions for crew sidebar:', err));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const navItems = React.useMemo(() => {
    return crewNavItems.map(item => {
      if (item.label === 'events' && activePermissions.includes('create_event')) {
        return { ...item, href: '/core/events' };
      }
      if (item.label === 'chat' && activePermissions.includes('scan_ticket')) {
        return { ...item, href: '/core/chat' };
      }
      if (item.label === 'roadmap' && activePermissions.includes('manage_announcements')) {
        return { ...item, href: '/core/topics' };
      }
      if (item.label === 'services' && activePermissions.includes('edit_event')) {
        return { ...item, href: '/core/services' };
      }
      return item;
    });
  }, [activePermissions]);

  return (
    <SidebarLayout
      navItems={navItems}
      bottomNavItems={crewBottomNavItems}
      user={user}
      brandTitle={user?.name || 'Crew Member'}
      brandSubtitle={user?.badge || 'Crew'}
      homeHref="/crew/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
