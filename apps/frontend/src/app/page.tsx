'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const user = JSON.parse(raw);
        const role: string = (user?.role ?? '').toLowerCase().trim();
        if (role === 'core') {
          router.replace('/core/dashboard');
        } else if (role === 'crew') {
          router.replace('/crew/dashboard');
        } else {
          router.replace('/events');
        }
      } else {
        router.replace('/login');
      }
    } catch {
      localStorage.removeItem('aws_sgb_rec_user');
      router.replace('/login');
    }
  }, [router]);

  // Blank screen while deciding — keeps the transition clean
  return null;
}
