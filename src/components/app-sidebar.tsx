"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  AudioWaveform,
  CalendarClock,
  Calendar,
  Command,
  GalleryVerticalEnd,
  Users,
  House,
  Archive,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  // SidebarRail,
} from "@/components/ui/sidebar"

// ... imports

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Admin",
      logo: GalleryVerticalEnd,
      // plan: "Enterprise",
    },
    {
      name: "Dean",
      logo: AudioWaveform,
      // plan: "Startup",
    },
    {
      name: "Staff",
      logo: Command,
      // plan: "Free",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  // Path format: /page/[role]/[section]
  // split('/') -> ["", "page", "role", "section"]
  // The role is at index 2
  const pathParts = pathname?.split("/")
  const role = pathParts?.[2] || "4" // Default to 4 (guest/user) if not found

  const navMain = [
    {
      title: "Dashboard",
      url: `/page/${role}/dashboard`,
      icon: House,
    },
    {
      title: "Calendar",
      url: `/page/${role}/calendar`,
      icon: Calendar,
    },
    {
      title: "Reservations",
      url: `/page/${role}/reservations`,
      icon: CalendarClock,
    },
    {
      title: "Accounts",
      url: `/page/${role}/accounts`,
      icon: Users,
    },
    {
      title: "Assets",
      url: `/page/${role}/asset-management`,
      icon: Archive,
    }
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
