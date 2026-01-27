"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ CRITICAL: Data is fresh for 30 seconds, then refetch
        // This ensures you see real-time data while minimizing unnecessary requests
        staleTime: 30 * 1000, // 30 seconds

        // ✅ Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes

        // ✅ Don't refetch when window regains focus (prevents surprise refetches)
        refetchOnWindowFocus: false,

        // ✅ CRITICAL FOR REAL-TIME: Refetch on mount if data is stale
        // This is the key to showing loading states and fetching fresh data
        refetchOnMount: true,

        // ✅ Refetch on reconnect to get latest data after connection loss
        refetchOnReconnect: true,

        // ✅ Retry failed requests twice with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // ✅ Network mode
        networkMode: 'online',

        // ✅ CRITICAL: Keep previous data while refetching
        // This prevents UI flicker - old data stays visible until new data arrives
        placeholderData: (previousData: unknown) => previousData,
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