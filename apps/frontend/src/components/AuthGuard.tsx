'use client';

import { useEffect, useState } from 'react';

/**
 * AuthGuard — wraps Core-only pages.
 *
 * Logic:
 *  - While mounting (SSR / hydration): render a full-screen loader (never flash protected content)
 *  - No session found → hard redirect to /login
 *  - Role = 'core' → authorized, render children
 *  - Role = 'crew' → redirect to /crew/dashboard
 *  - Role = 'enthusiasts' → redirect to /events
 *  - Corrupted session → clear storage, redirect to /login
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('aws_sgb_rec_user');

    if (!userJson) {
      window.location.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role: string = (user?.role ?? '').toLowerCase().trim();

      if (role === 'core') {
        setAuthorized(true);
      } else if (role === 'crew') {
        window.location.replace('/crew/dashboard');
      } else {
        // enthusiasts or unknown role → events page
        window.location.replace('/events');
      }
    } catch {
      localStorage.removeItem('aws_sgb_rec_user');
      window.location.replace('/login');
    }
  }, []);

  // Always show a loader during the auth check — never flash protected content
  if (!authorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#161d26] text-white font-mono text-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-widest font-extrabold text-[#68717A]">
            Verifying Access...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
