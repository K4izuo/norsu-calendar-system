"use client"

import { createContext, useContext, useEffect } from "react"

interface PageLoadingContextValue {
  readySignal: number
  setPageReady: () => void
}

export const PageLoadingContext = createContext<PageLoadingContextValue | null>(null)

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext)
  if (!ctx) throw new Error("usePageLoading must be used within RoleLayout")
  return ctx
}

export function usePageReady(isLoading: boolean, isFetching = false) {
  const { readySignal, setPageReady } = usePageLoading()
  useEffect(() => {
    if (!isLoading && !isFetching) setPageReady()
  }, [isLoading, isFetching, readySignal, setPageReady])
}
