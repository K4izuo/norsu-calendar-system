"use client"

import { createContext, useContext, useEffect } from "react"

interface PageLoadingContextValue {
  setPageReady: () => void
}

export const PageLoadingContext = createContext<PageLoadingContextValue | null>(null)

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

export function usePageReady(isLoading: boolean, isFetching = false) {
  const { setPageReady } = usePageLoading()
  useEffect(() => {
    if (!isLoading && !isFetching) setPageReady()
  }, [isLoading, isFetching, setPageReady])
}
