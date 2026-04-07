"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Link, Search, Check, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useLinkUser } from "@/features/people/services/people-service"
import { useUsers } from "@/features/accounts/services/account-service"
import type { Person } from "@/features/people/types/people.types"

interface PeopleLinkModalProps {
  isOpen: boolean
  onClose: () => void
  person: Person | null
  allPeople: Person[]
}

export function PeopleLinkModal({ isOpen, onClose, person, allPeople }: PeopleLinkModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const { users, loading: loadingUsers } = useUsers()
  const { mutateAsync: linkUser, isPending: isLinking } = useLinkUser()

  // Build set of user IDs already linked to OTHER people records
  const alreadyLinkedUserIds = useMemo(() => {
    return new Set(
      allPeople
        .filter((p) => p.userLinkId !== null && p.id !== person?.id)
        .map((p) => p.userLinkId as number)
    )
  }, [allPeople, person])

  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      const notAlreadyLinked = !alreadyLinkedUserIds.has(u.id)
      const matchesSearch =
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      return notAlreadyLinked && matchesSearch
    })
  }, [users, alreadyLinkedUserIds, searchQuery])

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setSelectedUserId(person?.userLinkId ?? null)
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen, person])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !person) return null

  const handleLink = async () => {
    if (!selectedUserId) return
    try {
      await linkUser({ personId: person.id, data: { user_id: selectedUserId } })
      onClose()
    } catch {
      // error handled by mutation hook
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md sm:mx-4 mx-px max-h-[92vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Link strokeWidth={2.5} className="w-7 h-7 text-gray-800" />
                <h2 className="text-2xl font-semibold text-gray-800">Link Account</h2>
              </div>
              <Button
                onClick={onClose}
                size="sm"
                className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Linking account for: <span className="font-semibold text-gray-700">{person.personName}</span>
            </p>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="border border-gray-200 rounded-md overflow-y-auto max-h-64">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                  Loading users...
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                  No available users found
                </div>
              ) : (
                availableUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                      selectedUserId === u.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
                        {(u.first_name?.[0] ?? "").toUpperCase()}{(u.last_name?.[0] ?? "").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white z-10 p-6 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLinking}
              className="cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLink}
              disabled={!selectedUserId || isLinking}
              className="cursor-pointer"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Link Account
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
