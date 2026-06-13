'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Singleton QueryClient — created once at module level (not inside React state).
 *
 * Performance config:
 * - staleTime: 5min  — data considered fresh, no background refetch within window
 * - gcTime:   10min  — inactive query results kept in memory for 10min (reduces cold fetches)
 * - retry: 1         — retry failed queries once instead of the default 3 times
 * - retryDelay: 800ms — fast retry on transient errors
 * - refetchOnWindowFocus: false — avoid noisy refetches on tab switch
 * - refetchOnReconnect: true  — but DO refetch when network comes back
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      retry: 1,
      retryDelay: 800,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Never retry mutations (registration, login) — side effects
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
