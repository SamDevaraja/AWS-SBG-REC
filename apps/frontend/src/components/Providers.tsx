'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Singleton QueryClient — best-of-both config merged from the two providers.
 *
 * Performance config:
 * - staleTime: 5min  — data considered fresh, no background refetch within window
 * - gcTime:   30min  — inactive query results kept in memory for 30min
 * - retry: 1         — retry failed queries once instead of the default 3 times
 * - retryDelay: 800ms — fast retry on transient errors
 * - refetchOnWindowFocus: false — avoid noisy refetches on tab switch
 * - refetchOnReconnect: true  — refetch when network comes back
 * - mutations: retry: 0 — never retry mutations (registration, login)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 1,
            retryDelay: 800,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
