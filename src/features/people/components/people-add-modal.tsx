"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, UserPlus, User, Check, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useCreatePerson, useUpdatePerson } from "@/features/people/services/people-service"
import type { Person } from "@/features/people/types/people.types"

const personSchema = z.object({
  personName: z.string().min(1, "Name is required").max(255, "Name is too long"),
})

type PersonFormData = z.infer<typeof personSchema>

interface PeopleAddModalProps {
  isOpen: boolean
  onClose: () => void
  editPerson?: Person | null
}

export function PeopleAddModal({ isOpen, onClose, editPerson }: PeopleAddModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: createPerson, isPending: isCreating } = useCreatePerson()
  const { mutateAsync: updatePerson, isPending: isUpdating } = useUpdatePerson()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: { personName: "" },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ personName: editPerson?.personName ?? "" })
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen, editPerson, reset])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const onSubmit = async (data: PersonFormData) => {
    try {
      if (editPerson) {
        await updatePerson({ id: editPerson.id, data })
      } else {
        await createPerson(data)
      }
      reset()
      onClose()
    } catch {
      // error handled by mutation hooks
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
                {editPerson ? (
                  <User strokeWidth={2.5} className="w-7 h-7 text-gray-800" />
                ) : (
                  <UserPlus strokeWidth={2.5} className="w-7 h-7 text-gray-800" />
                )}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editPerson ? "Edit Person" : "Add Person"}
                </h2>
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("personName")}
                  placeholder="e.g. Juan Dela Cruz"
                  className="h-11"
                  autoFocus
                />
                {errors.personName && (
                  <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1 pl-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{errors.personName.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white z-10 p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : editPerson ? (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Person
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
