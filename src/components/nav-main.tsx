"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
  const [isPending, startTransition] = useTransition()

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    // Don't navigate if already on the page
    if (pathname === url) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    
    startTransition(() => {
      router.push(url)
    })
  }

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
              disabled={isPending}
            >
              <Link 
                href={item.url}
                onClick={(e) => handleNavigation(e, item.url)}
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