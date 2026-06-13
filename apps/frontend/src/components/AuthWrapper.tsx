'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify'];

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
 * Uses router.replace() instead of window.location.replace() for all redirects
 * so they are instant client-side navigations rather than full page reloads.
 * Session parsing result is module-level cached to avoid repeated JSON.parse.
 */
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirecting'>('loading');
  const checkedRef = useRef<string>('');

  useEffect(() => {
    // Skip if we already checked this exact path (e.g. during Strict Mode double-invoke)
    if (checkedRef.current === pathname) return;
    checkedRef.current = pathname;

    const isPublicRoute = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    const session = getSession();

    if (!session) {
      if (!isPublicRoute) {
        setStatus('redirecting');
        // Reset the ref so the destination path will be checked fresh
        checkedRef.current = '';
        router.replace('/login');
      } else {
        setStatus('allowed');
      }
      return;
    }

    const { role } = session;

    if (isPublicRoute) {
      setStatus('redirecting');
      // Reset the ref so the destination path will be checked fresh
      checkedRef.current = '';
      router.replace(getHomeForRole(role));
      return;
    }

    const isCorePath = pathname.startsWith('/core');
    const isCrewPath = pathname.startsWith('/crew');

    if (isCorePath && role !== 'core') {
      setStatus('redirecting');
      checkedRef.current = '';
      router.replace(getHomeForRole(role));
      return;
    }

    if (isCrewPath && role !== 'crew') {
      setStatus('redirecting');
      checkedRef.current = '';
      router.replace(getHomeForRole(role));
      return;
    }

    setStatus('allowed');
  }, [pathname, router]);

  if (status !== 'allowed') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A222D] z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#68717A] font-mono">
            {status === 'redirecting' ? 'Redirecting...' : 'Authenticating...'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
