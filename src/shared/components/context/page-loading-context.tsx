"use client"

import { createContext, useContext, useEffect } from "react"

interface PageLoadingContextValue {
  setPageReady: () => void
}

export const PageLoadingContext = createContext<PageLoadingContextValue | null>(null)

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext)
  if (!ctx) throw new Error("usePageLoading must be used within RoleLayout")
  return ctx
}

// Call this in any page with the page's combined loading state.
// The layout overlay stays visible until isLoading flips to false.
export function usePageReady(isLoading: boolean) {
  const { setPageReady } = usePageLoading()
  useEffect(() => {
    if (!isLoading) setPageReady()
  }, [isLoading, setPageReady])
}
