'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify', '/crew', '/core'];

function getHomeForRole(role: string): string {
  if (role === 'core') return '/core/dashboard';
  if (role === 'crew') return '/crew/dashboard';
  return '/events';
}

/** Cache parsed user so repeated navigations don't re-parse localStorage */
let _cachedUser: { role: string } | null | undefined = undefined;

function getSession(): { role: string } | null {
  if (_cachedUser !== undefined) return _cachedUser;
  try {
    const raw = localStorage.getItem('aws_sgb_rec_user');
    if (!raw) { _cachedUser = null; return null; }
    const parsed = JSON.parse(raw);
    _cachedUser = { role: (parsed?.role ?? 'enthusiasts').toLowerCase().trim() };
    return _cachedUser;
  } catch {
    localStorage.removeItem('aws_sgb_rec_user');
    _cachedUser = null;
    return null;
  }
}

/** Invalidate cache on logout / login */
export function clearSessionCache() {
  _cachedUser = undefined;
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

  useEffect(() => {
    // Determine if the current route is public
    // We treat /core and /crew strictly as exact matches so we don't accidentally expose /core/dashboard
    const isPublicRoute = PUBLIC_ROUTES.some(r => {
      if (r === '/core' || r === '/crew') {
        return pathname === r;
      }
      return pathname === r || pathname.startsWith(r + '/');
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

    const { role } = session;

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

    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
    }
    setReady(true);
  }, [pathname, router]);

  // Show spinner only during initial hydration, not on navigations
  if (!ready) {
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
