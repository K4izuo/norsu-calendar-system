"use client";

import React, { memo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown, Link, Pencil, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import type { Person } from "@/features/people/types/people.types"
import { TableSkeleton } from "@/shared/components/ui/skeleton"

interface PeopleTableProps {
  people: Person[]
  isLoading?: boolean
  onLinkClick?: (person: Person) => void
  onEditClick?: (person: Person) => void
  onDeleteClick?: (person: Person) => void
}

const ROWS_OPTIONS = [5, 10, 20, 25, 50]

const navBtnClass =
  "inline-flex items-center justify-center h-7 w-7 rounded border border-gray-200 bg-white text-gray-600 " +
  "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"

function PaginationBar({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))

  return (
    <div className="flex items-center justify-between px-2 py-2 shrink-0">
      <span className="text-xs text-gray-500">0 of {total} row(s) selected.</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rows per page</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer">
                {rowsPerPage}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-15">
              {ROWS_OPTIONS.map((n) => (
                <DropdownMenuItem
                  key={n}
                  className={`cursor-pointer justify-center text-xs ${n === rowsPerPage ? "font-semibold" : ""}`}
                  onSelect={() => { onRowsPerPageChange(n); onPageChange(1) }}
                >
                  {n}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
      </div>
      <div className="flex items-center gap-1">
        <button className={navBtnClass} onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export const PeopleTable = memo(function PeopleTable({
  people,
  isLoading,
  onLinkClick,
  onEditClick,
  onDeleteClick,
}: PeopleTableProps) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const pagedPeople = people.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }

  if (isLoading && people.length === 0) {
    return <TableSkeleton rows={5} />
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="rounded-md text-card-foreground border shadow-xs overflow-x-auto">
        {people.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No people found</p>
              <p className="text-gray-400 text-sm mt-2">Add names from the boss&apos;s list to get started</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-[#f1f2f4] hover:bg-gray-100">
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Name</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Linked Account</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Status</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Date Added</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {pagedPeople.map((person) => (
                <TableRow key={person.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
                        {getInitials(person.personName)}
                      </div>
                      {person.personName}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {person.linkedUser
                      ? `${person.linkedUser.first_name} ${person.linkedUser.last_name}`
                      : <span className="text-gray-400 italic">Not linked</span>
                    }
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    {person.userLinkId ? (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">Linked</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">Unlinked</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{formatDate(person.created_at)}</TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onLinkClick?.(person)}
                            className="p-1.5 rounded text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                            aria-label={person.userLinkId ? 'Change Link' : 'Link Account'}
                          >
                            <Link className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{person.userLinkId ? 'Change Link' : 'Link Account'}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onEditClick?.(person)}
                            className="p-1.5 rounded text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer"
                            aria-label="Edit Name"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Name</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onDeleteClick?.(person)}
                            className="p-1.5 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {people.length > 0 && (
        <PaginationBar
          total={people.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      )}
    </div>
  )
})
