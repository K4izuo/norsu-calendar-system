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
export function usePageReady(isLoading: boolean) {
  const { setPageReady, reportHasData } = usePageLoading()

  // Capture whether data was already available when this page first mounted.
  // useRef initialises once per mount, so revisiting a cached page gives false here.
  const hadDataOnMountRef = useRef(!isLoading)

  // Children's useLayoutEffect fires BEFORE the parent layout's useLayoutEffect.
  // Signalling here lets the layout read hasCachedDataRef before it decides
  // whether to show the overlay — resulting in zero-delay navigation.
  useLayoutEffect(() => {
    if (hadDataOnMountRef.current) reportHasData()
  }, [reportHasData])

  useEffect(() => {
    if (!isLoading) setPageReady()
  }, [isLoading, setPageReady])
}
