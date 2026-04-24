"use client"

import * as React from "react"
import { useParams } from "next/navigation"
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
  Shield,
  Building2,
  Briefcase,
} from "lucide-react"

import { NavMain } from "@/shared/components/layouts/nav-main"
import { TeamSwitcher } from "@/shared/components/layouts/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar"

const data = {
  teams: [
    { name: "Admin",            logo: GalleryVerticalEnd },
    { name: "Dean",             logo: AudioWaveform },
    { name: "Staff",            logo: Command },
    { name: "Student Director", logo: BookUser },
    { name: "Campus Director",  logo: Shield },
    { name: "VPAA",             logo: Briefcase },
    { name: "VPSAS",            logo: Briefcase },
    { name: "VPAF",             logo: Briefcase },
    { name: "VPRDE",            logo: Briefcase },
    { name: "Head of Office",   logo: Building2 },
  ],
}

const PATH_TO_TEAM_NAME: Record<string, string> = {
  admin:               "Admin",
  dean:                "Dean",
  staff:               "Staff",
  "student-director":  "Student Director",
  "campus-director":   "Campus Director",
  vpaa:                "VPAA",
  vpsas:               "VPSAS",
  vpaf:                "VPAF",
  vprde:               "VPRDE",
  head:                "Head of Office",
}

const FULL_NAV_ROLES = new Set(["admin"])

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const role = (params.role as string) || "admin"

  const isFullNav = FULL_NAV_ROLES.has(role)

  const allNavItems = [
    { title: "Dashboard",    url: `/${role}/dashboard`,        icon: House },
    { title: "Calendar",     url: `/${role}/calendar`,         icon: Calendar },
    { title: "Reservations", url: `/${role}/reservations`,     icon: CalendarClock },
    { title: "Accounts",     url: `/${role}/accounts`,         icon: UserCog },
    { title: "People",       url: `/${role}/people`,           icon: BookUser },
    { title: "Assets",       url: `/${role}/asset-management`, icon: Archive },
  ]

  const navMain = isFullNav
    ? allNavItems
    : allNavItems.filter(item => item.title === "Calendar" || item.title === "Reservations")

  const teamName = PATH_TO_TEAM_NAME[role] ?? "Admin"
  const initialTeam = data.teams.find(t => t.name === teamName) ?? data.teams[0]

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
