'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify', '/crew', '/core'];

function getHomeForRole(role: string): string {
  if (role === 'core') return '/core/dashboard';
  if (role === 'crew') return '/crew/dashboard';
  return '/events';
}

function getSession(): { id?: string; role: string } | null {
  try {
    const raw = localStorage.getItem('aws_sgb_rec_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { 
      id: parsed?.id,
      role: (parsed?.role ?? 'enthusiasts').toLowerCase().trim() 
    };
  } catch {
    localStorage.removeItem('aws_sgb_rec_user');
    return null;
  }
}

function isCrewAllowedCorePath(pathname: string, permissions: string[]): boolean {
  if (
    (pathname.startsWith('/core/events') ||
     pathname.startsWith('/core/registrations') ||
     pathname.startsWith('/core/tickets') ||
     pathname.startsWith('/core/attendance') ||
     pathname.startsWith('/core/announcements')) &&
    permissions.includes('create_event')
  ) {
    return true;
  }
  if (pathname.startsWith('/core/chat') && permissions.includes('scan_ticket')) {
    return true;
  }
  if (
    (pathname.startsWith('/core/services') || 
     pathname.startsWith('/core/manage-regions') || 
     pathname.startsWith('/core/manage-categories')) && 
    permissions.includes('edit_event')
  ) {
    return true;
  }
  if (
    (pathname.startsWith('/core/topics') || 
     pathname.startsWith('/core/module')) && 
    permissions.includes('manage_announcements')
  ) {
    return true;
  }
  if (pathname.startsWith('/core/analytics') && permissions.includes('view_analytics')) {
    return true;
  }
  return false;
}

/** Keep for backward compatibility, no longer needed since we read dynamically */
export function clearSessionCache() {
  // No-op
}

/**
 * AuthWrapper — lightweight global auth guard.
 *
 * Uses router.replace() for instant client-side navigations.
 * Session parsing is module-level cached. The spinner only shows
 * on the very first mount (SSR -> client hydration), not on
 * subsequent client-side navigations.
 */
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const checkedRef = useRef<string>('');
  const initialCheckDone = useRef(false);

  const [crewPermissions, setCrewPermissions] = useState<string[] | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  useEffect(() => {
    // Determine if the current route is public
    // We treat /core and /crew strictly as exact matches so we don't accidentally expose /core/dashboard
    const isPublicRoute = PUBLIC_ROUTES.some(r => {
      const match = (r === '/core' || r === '/crew') ? pathname === r : (pathname === r || pathname.startsWith(r + '/'));
      return match;
    });

    const session = getSession();

    if (!session) {
      if (!isPublicRoute) {
        checkedRef.current = '';
        router.replace('/login');
      }
      if (!initialCheckDone.current) {
        initialCheckDone.current = true;
        setReady(true);
      }
      return;
    }

    const { role, id } = session;

    if (isPublicRoute) {
      checkedRef.current = '';
      router.replace(getHomeForRole(role));
      if (!initialCheckDone.current) {
        initialCheckDone.current = true;
        setReady(true);
      }
      return;
    }

    const isCorePath = pathname.startsWith('/core');
    const isCrewPath = pathname.startsWith('/crew');
    const isEnthusiastPath = pathname.startsWith('/events');

    // If it's a crew member accessing a core path, check permissions
    if (role === 'crew' && isCorePath) {
      if (crewPermissions === null) {
        if (!isLoadingPermissions) {
          setIsLoadingPermissions(true);
          fetch(`/api/auth/permissions/check?userId=${id}`)
            .then(res => res.json())
            .then(data => {
              const permissions = data.success ? (data.permissions || []) : [];
              setCrewPermissions(permissions);
              setIsLoadingPermissions(false);
            })
            .catch(err => {
              console.error("Failed to fetch crew permissions in AuthWrapper:", err);
              setCrewPermissions([]);
              setIsLoadingPermissions(false);
            });
        }
        return;
      }

      // Check permissions
      if (!isCrewAllowedCorePath(pathname, crewPermissions)) {
        checkedRef.current = '';
        router.replace(getHomeForRole(role));
        if (!initialCheckDone.current) {
          initialCheckDone.current = true;
          setReady(true);
        }
        return;
      }
    } else {
      if (
        (isCorePath && role !== 'core') ||
        (isCrewPath && role !== 'crew') ||
        (isEnthusiastPath && role !== 'enthusiasts')
      ) {
        checkedRef.current = '';
        router.replace(getHomeForRole(role));
        if (!initialCheckDone.current) {
          initialCheckDone.current = true;
          setReady(true);
        }
        return;
      }
    }

    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
    }
    setReady(true);
  }, [pathname, router, crewPermissions, isLoadingPermissions]);

  // Show spinner only during initial hydration or permission loading
  if (!ready || isLoadingPermissions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A222D] z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <div suppressHydrationWarning className="text-[10px] uppercase tracking-widest font-bold text-[#68717A] font-mono">
            Authenticating...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
