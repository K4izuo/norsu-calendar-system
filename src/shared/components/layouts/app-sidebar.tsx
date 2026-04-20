"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  AudioWaveform,
  CalendarClock,
  Calendar,
  Command,
  GalleryVerticalEnd,
  UserCog,
  BookUser,
  House,
  Archive,
} from "lucide-react"

import { NavMain } from "@/shared/components/layouts/nav-main"
// import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/shared/components/layouts/team-switcher"
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  // SidebarRail,
} from "@/shared/components/ui/sidebar"

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
  // Path format: /[role]/[section]
  // For example: /admin/dashboard
  // split('/') -> ["", "admin", "dashboard"]
  // The role is at index 1 (after the first empty string from leading /)
  const pathParts = pathname?.split("/")
  const role = pathParts?.[1] || "admin" // Default to admin if not found

  const navMain = [
    {
      title: "Dashboard",
      url: `/${role}/dashboard`,
      icon: House,
    },
    {
      title: "Calendar",
      url: `/${role}/calendar`,
      icon: Calendar,
    },
    {
      title: "Reservations",
      url: `/${role}/reservations`,
      icon: CalendarClock,
    },
    {
      title: "Accounts",
      url: `/${role}/accounts`,
      icon: UserCog,
    },
    {
      title: "People",
      url: `/${role}/people`,
      icon: BookUser,
    },
    {
      title: "Assets",
      url: `/${role}/asset-management`,
      icon: Archive,
    }
  ]

  const initialTeam = data.teams.find(t => t.name.toLowerCase() === role) ?? data.teams[0]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} initialTeam={initialTeam} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
