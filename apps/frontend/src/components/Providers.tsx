'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes — no refetch within that window
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 30 minutes (e.g. when navigating away)
            gcTime: 30 * 60 * 1000,
            // Don't refetch just because the user switched browser tabs
            refetchOnWindowFocus: false,
            // Don't refetch when remounting a component that already has fresh data
            refetchOnMount: false,
            // Only retry once on network error (default 3 causes long waits)
            retry: 1,
            retryDelay: 1000,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
