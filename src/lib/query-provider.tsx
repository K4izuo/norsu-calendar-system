"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ CRITICAL FIX: Set staleTime to 0 to always show loading on navigation
        // This forces queries to be treated as stale immediately
        staleTime: 0, // Was 30 seconds - this caused instant cached data display

        // ✅ Keep unused data in cache for 5 minutes for back navigation
        gcTime: 5 * 60 * 1000, // 5 minutes

        // ✅ Don't refetch when window regains focus
        refetchOnWindowFocus: false,

        // ✅ CRITICAL: Refetch on mount if data is stale
        refetchOnMount: true,

        // ✅ Refetch on reconnect to get latest data after connection loss
        refetchOnReconnect: true,

        // ✅ Retry failed requests twice with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // ✅ Network mode
        networkMode: 'online',

        // ✅ CRITICAL FIX: Remove placeholderData to prevent showing stale data
        // This was the main issue - it was showing old data immediately
        // placeholderData: (previousData: unknown) => previousData, // REMOVED
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