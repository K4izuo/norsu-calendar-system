"use client"

import { createContext, useContext, useEffect, useLayoutEffect, useRef } from "react"

interface PageLoadingContextValue {
  setPageReady: () => void
  reportHasData: () => void
}

export const PageLoadingContext = createContext<PageLoadingContextValue | null>(null)

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext)
  if (!ctx) throw new Error("usePageLoading must be used within RoleLayout")
  return ctx
}

// Call this in any page with the page's combined loading state.
// If isLoading is already false on mount (data cached), this signals the layout
// via useLayoutEffect — which fires before the parent layout's useLayoutEffect —
// so the layout skips the overlay entirely and the page appears instantly.
// If isLoading starts true (first visit), the layout shows the overlay until
// isLoading flips to false.
export function usePageReady(isLoading: boolean, isFetching = false) {
  const { setPageReady, reportHasData } = usePageLoading()

  // Only skip the overlay when data is cached AND no background refetch is in flight.
  // isFetching=true on first render (e.g. refetchOnMount:'always') forces the overlay
  // to show even though isLoading=false (stale cache).
  const hadDataOnMountRef = useRef(!isLoading && !isFetching)

  useLayoutEffect(() => {
    if (hadDataOnMountRef.current) reportHasData()
  }, [reportHasData])

  useEffect(() => {
    if (!isLoading && !isFetching) setPageReady()
  }, [isLoading, isFetching, setPageReady])
}
