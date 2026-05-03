"use client"

import { useCallback } from "react"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { triggerTokenUpdate } from "@/core/auth/token-refresh"
import { prefetchDashboardReservations } from "@/features/calendar/services/reservation-service"
import { useAuth } from "@/shared/components/context/auth-context"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading } = useAuth()

  const prefetchCalendarData = useCallback(() => {
    if (isLoading || !isAuthenticated || !user?.id) return
    void prefetchDashboardReservations(queryClient, user.id)
  }, [isAuthenticated, isLoading, queryClient, user?.id])

  const handleNavigationIntent = useCallback((title: string) => {
    if (title === "Calendar") prefetchCalendarData()
  }, [prefetchCalendarData])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={pathname === item.url}
            >
              <Link 
                href={item.url}
                onMouseEnter={() => handleNavigationIntent(item.title)}
                onFocus={() => handleNavigationIntent(item.title)}
                onPointerDown={() => handleNavigationIntent(item.title)}
                onClick={() => {
                  handleNavigationIntent(item.title)
                  // Trigger debounced, non-blocking token update
                  triggerTokenUpdate();
                }}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
