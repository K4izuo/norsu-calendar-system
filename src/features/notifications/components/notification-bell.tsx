"use client"

import React, { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  useUnreadCount,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
} from "@/features/notifications/services/notification-service"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/shared/components/context/auth-context"
import { EventInfoModal } from "@/features/calendar/components/event-info-modal"
import { fetchReservations } from "@/features/calendar/services/reservation-service"
import { apiClient } from "@/core/api/api-client"
import type { EventDetails } from "@/interface/user-props"
import type { AppNotification } from "../types/notification.types"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [eventModalLoading, setEventModalLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>()

  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userRoleNumber = user?.role ?? undefined
  const { unreadCount } = useUnreadCount()
  const { notifications, loading } = useNotifications(isOpen)
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read_at) markRead(notification.id)

    const reservationId = notification.data.reservation_id
    if (!reservationId) return

    setIsOpen(false)
    setEventModalLoading(true)
    setEventModalOpen(true)

    try {
      const reservations = await queryClient.ensureQueryData({
        queryKey: ["reservations", user?.id],
        queryFn: fetchReservations,
        staleTime: 2 * 60 * 1000,
      })

      const reservation = reservations.find((r) => r.id === reservationId)
      if (!reservation) {
        setEventModalOpen(false)
        setEventModalLoading(false)
        return
      }

      const assetResponse = await apiClient.get<
        { id: number; asset_name: string; capacity: number; aminities?: string[]; asset_type?: string }[]
      >(`/reservations/${reservation.asset_id}`)
      const asset = assetResponse.data?.[0]

      setSelectedEvent({
        id: reservation.id,
        title_name: reservation.title_name,
        date: reservation.date,
        time_start: reservation.time_start,
        time_end: reservation.time_end,
        asset: {
          id: reservation.asset_id,
          asset_name: asset?.asset_name || "Not specified",
          capacity: asset?.capacity || 0,
          aminities: asset?.aminities,
          asset_type: asset?.asset_type,
        },
        category: reservation.category,
        other_category: reservation.other_category,
        info_type: reservation.info_type,
        description: reservation.description,
        people_tag: reservation.people_tag ? reservation.people_tag.split(", ").filter(Boolean) : [],
        range: reservation.range,
        registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED",
        registration_deadline: reservation.date,
        reserved_by_user: reservation.reserved_by_user,
        reserve_by_user: reservation.reserved_by_user
          ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
          : "Unknown User",
        approved_by_user_details: reservation.approved_by_user,
        declined_by_user_details: reservation.declined_by_user,
        is_moved: reservation.is_moved,
        original_date: reservation.original_date,
        involves_students: reservation.involves_students,
        requires_vpaa: reservation.requires_vpaa,
        requires_vpsas: reservation.requires_vpsas,
        requires_vpaf: reservation.requires_vpaf,
        requires_vprde: reservation.requires_vprde,
        current_stage: reservation.current_stage,
        declined_at_stage: reservation.declined_at_stage,
        campus_director_action: reservation.campus_director_action,
        approvals: reservation.approvals,
        equipment: reservation.equipment,
        outsource: reservation.outsource,
        guests: reservation.guests,
      })
    } catch {
      setEventModalOpen(false)
    } finally {
      setEventModalLoading(false)
    }
  }

  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
          aria-label="Notifications"
        >
          <Bell className="size-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white font-semibold flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 bg-white border border-border rounded-lg shadow-lg p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors cursor-pointer ${
                  notification.read_at
                    ? "hover:bg-gray-50"
                    : "bg-blue-50 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.read_at && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  <div className={notification.read_at ? "pl-4" : ""}>
                    <p className="text-sm text-gray-800 leading-snug">
                      {notification.data.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <EventInfoModal
      isOpen={eventModalOpen}
      onClose={() => { setEventModalOpen(false); setSelectedEvent(undefined) }}
      event={selectedEvent}
      loading={eventModalLoading}
      userRoleNumber={userRoleNumber}
      onApprove={() => {
        queryClient.invalidateQueries({ queryKey: ["reservations"], refetchType: "all" })
        queryClient.invalidateQueries({ queryKey: ["reservation-queue"], refetchType: "all" })
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", user?.id], refetchType: "all" })
      }}
      onDecline={() => {
        queryClient.invalidateQueries({ queryKey: ["reservations"], refetchType: "all" })
        queryClient.invalidateQueries({ queryKey: ["reservation-queue"], refetchType: "all" })
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", user?.id], refetchType: "all" })
      }}
    />
    </>
  )
}
