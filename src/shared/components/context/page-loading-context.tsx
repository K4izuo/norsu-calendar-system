"use client"

import { createContext, useContext, useEffect, useLayoutEffect, useRef } from "react"

interface PageLoadingContextValue {
  setPageReady: () => void
  reportHasData: () => void
}

export const PageLoadingContext = createContext<PageLoadingContextValue | null>(null)

// Module-level flag: call scheduleNavigationOverlay() after any mutation that
// produces fresh data. The next in-app navigation will force the overlay even
// when the destination page already has a React Query cache entry.
let _pendingOverlay = false
export const scheduleNavigationOverlay = () => { _pendingOverlay = true }
export const consumeNavigationOverlay = () => {
  const pending = _pendingOverlay
  _pendingOverlay = false
  return pending
}

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext)
  if (!ctx) throw new Error("usePageLoading must be used within RoleLayout")
  return ctx
}

// Call this in any page with the page's combined loading state.
// If isLoading is already false on mount (data cached), this signals the layout
// via useLayoutEffect — which fires before the parent layout's useLayoutEffect —
// so the layout skips the overlay entirely and the page appears instantly.
// If isLoading starts true (first visit or fresh refetch), the layout shows the
// overlay until isLoading flips to false.
export function usePageReady(isLoading: boolean, isFetching = false, isStale = false) {
  const { setPageReady, reportHasData } = usePageLoading()

  const hadDataOnMountRef = useRef(!isLoading && !isFetching && !isStale)

  useLayoutEffect(() => {
    if (hadDataOnMountRef.current) reportHasData()
  }, [reportHasData])

  useEffect(() => {
    if (!isLoading && !isFetching) setPageReady()
  }, [isLoading, isFetching, setPageReady])
}
