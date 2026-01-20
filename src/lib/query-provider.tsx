"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // CRITICAL: Data stays fresh for 5 minutes - no refetch during navigation
        staleTime: 5 * 60 * 1000, // 5 minutes

        // CRITICAL: Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes

        // Don't refetch when window regains focus
        refetchOnWindowFocus: false,

        // CRITICAL FOR INSTANT NAV: Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // CRITICAL: Keep components mounted, only fetch once
        refetchOnReconnect: false,

        // Retry failed requests once
        retry: 1,

        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Prevent multiple identical requests
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Network mode for mutations
        networkMode: 'online',
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}