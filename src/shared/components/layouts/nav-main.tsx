"use client"

import { useCallback, type MouseEvent } from "react"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  useSidebar,
} from "@/shared/components/ui/sidebar"

const MOBILE_SIDEBAR_CLOSE_MS = 300
const MOBILE_TOKEN_UPDATE_DELAY_MS = 420

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
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const prefetchCalendarData = useCallback(() => {
    if (isLoading || !isAuthenticated || !user?.id) return
    void prefetchDashboardReservations(queryClient, user.id)
  }, [isAuthenticated, isLoading, queryClient, user?.id])

  const handleNavigationIntent = useCallback((title: string) => {
    if (title === "Calendar") prefetchCalendarData()
  }, [prefetchCalendarData])

  const scheduleTokenUpdate = useCallback(() => {
    if (!isMobile) {
      triggerTokenUpdate()
      return
    }

    window.setTimeout(() => {
      triggerTokenUpdate()
    }, MOBILE_TOKEN_UPDATE_DELAY_MS)
  }, [isMobile])

  const handleNavItemClick = useCallback((
    event: MouseEvent<HTMLAnchorElement>,
    title: string,
    url: string,
  ) => {
    if (!isMobile) {
      handleNavigationIntent(title)
      scheduleTokenUpdate()
      return
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    setOpenMobile(false)

    if (pathname !== url) {
      window.setTimeout(() => {
        router.push(url)
      }, MOBILE_SIDEBAR_CLOSE_MS)
    }

    // Trigger debounced, non-blocking token update.
    scheduleTokenUpdate()
  }, [handleNavigationIntent, isMobile, pathname, router, scheduleTokenUpdate, setOpenMobile])

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
                onFocus={() => {
                  if (!isMobile) handleNavigationIntent(item.title)
                }}
                onPointerDown={() => {
                  if (!isMobile) handleNavigationIntent(item.title)
                }}
                onClick={(event) => handleNavItemClick(event, item.title, item.url)}
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
