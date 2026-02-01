"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ⚡ PERFORMANCE: Balance between freshness and performance
        // 2 minutes allows reasonable caching while keeping data relatively fresh
        staleTime: 2 * 60 * 1000, // 2 minutes (was 0 - too aggressive)

        // ⚡ Keep unused data in cache for 5 minutes for instant back navigation
        gcTime: 5 * 60 * 1000, // 5 minutes

        // ⚡ Don't refetch when window regains focus to reduce unnecessary requests
        refetchOnWindowFocus: false,

        // ⚡ Refetch on mount only if data is stale (controlled by staleTime)
        refetchOnMount: true,

        // ⚡ Refetch on reconnect to get latest data after connection loss
        refetchOnReconnect: true,

        // ⚡ PERFORMANCE: Enable structural sharing to deduplicate identical requests
        structuralSharing: true,

        // ⚡ Retry failed requests with smart exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes('4')) return false;
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // ⚡ Network mode
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
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