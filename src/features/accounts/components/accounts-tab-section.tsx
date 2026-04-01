"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  SlidersHorizontal,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  Clock,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/api-client";
import { useUsers } from "../services/account-service";
import { ROLE_DISPLAY_NAMES } from "@/features/auth/types/auth.types";
import type { UserAccount } from "../types/account.types";
import { RoleChooseModal } from "./role-choose-modal";
import { DeanRegisterModal } from "./dean-register-modal";

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="flex items-center justify-center rounded-full bg-gray-100 p-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function TableHeader({ columns }: { columns: string[] }) {
  return (
    <div className="grid border-b px-6 py-2.5 shrink-0" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
      {columns.map((col) => (
        <span key={col} className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {col}
        </span>
      ))}
    </div>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid border-b px-6 py-3.5 animate-pulse"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 w-3/4 rounded bg-gray-100" />
          ))}
        </div>
      ))}
    </>
  );
}

function BadgeCount({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 leading-none">
      {count}
    </span>
  );
}

function getFullName(user: UserAccount): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.username;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRoleBadgeClass(role: number): string {
  if (role === 1) return "bg-blue-100 text-blue-700";
  if (role === 2) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
}

const ROWS_OPTIONS = [5, 10, 20, 25, 50];

const navBtnClass =
  "inline-flex items-center justify-center h-7 w-7 rounded border border-gray-200 bg-white text-gray-600 " +
  "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

function PaginationBar({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  return (
    <div className="flex items-center justify-between px-2 py-2 shrink-0">
      {/* Left: row selection info */}
      <span className="text-xs text-gray-500">0 of {total} row(s) selected.</span>

      {/* Center: rows per page + page indicator */}
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
                  onSelect={() => {
                    onRowsPerPageChange(n);
                    onPageChange(1);
                  }}
                >
                  {n}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Right: navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          className={navBtnClass}
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          className={navBtnClass}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          className={navBtnClass}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          className={navBtnClass}
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

const triggerClass =
  "rounded-md cursor-pointer px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-800 bg-transparent border-none shadow-none " +
  "data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm";

export function AccountsTabSection() {
  const { users, loading } = useUsers();
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const queryClient = useQueryClient();

  const navigateToAccount = (userId: number) => {
    queryClient.prefetchQuery({
      queryKey: ["accountUser", userId],
      queryFn: async () => {
        const response = await apiClient.get(`users/${userId}`);
        if (response.error) throw new Error(response.error as string);
        return response.data;
      },
      staleTime: 2 * 60 * 1000,
    });
    router.push(`/${role}/accounts/${userId}`);
  };

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeanModal, setShowDeanModal] = useState(false);

  const deans = users.filter((u) => u.role === 1);
  const staff = users.filter((u) => u.role === 2);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = [...users]
    .filter((u) => u.created_at && new Date(u.created_at) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

  // Active tab (controlled so we know which pagination to render below)
  const [activeTab, setActiveTab] = useState("all");

  // Pagination state per tab
  const [allPage, setAllPage] = useState(1);
  const [allRows, setAllRows] = useState(10);

  const [deansPage, setDeansPage] = useState(1);
  const [deansRows, setDeansRows] = useState(10);

  const [staffPage, setStaffPage] = useState(1);
  const [staffRows, setStaffRows] = useState(10);

  const [recentPage, setRecentPage] = useState(1);
  const [recentRows, setRecentRows] = useState(10);

  // Sliced data for current page
  const pagedUsers = users.slice((allPage - 1) * allRows, allPage * allRows);
  const pagedDeans = deans.slice((deansPage - 1) * deansRows, deansPage * deansRows);
  const pagedStaff = staff.slice((staffPage - 1) * staffRows, staffPage * staffRows);
  const pagedRecent = recentUsers.slice((recentPage - 1) * recentRows, recentPage * recentRows);

  // Which pagination props to pass based on the active tab
  const paginationByTab = {
    all: { total: users.length, page: allPage, rowsPerPage: allRows, onPageChange: setAllPage, onRowsPerPageChange: setAllRows },
    deans: { total: deans.length, page: deansPage, rowsPerPage: deansRows, onPageChange: setDeansPage, onRowsPerPageChange: setDeansRows },
    staff: { total: staff.length, page: staffPage, rowsPerPage: staffRows, onPageChange: setStaffPage, onRowsPerPageChange: setStaffRows },
    recent: { total: recentUsers.length, page: recentPage, rowsPerPage: recentRows, onPageChange: setRecentPage, onRowsPerPageChange: setRecentRows },
  };
  const activePagination = paginationByTab[activeTab as keyof typeof paginationByTab];
  const showPagination = !loading && activePagination.total > 0;

  return (
    // Outer wrapper: table card + pagination bar stacked vertically
    <div className="h-full w-full flex flex-col gap-2">

      {/* ── Table card ── */}
      <div className="flex-1 min-h-0 text-card-foreground rounded-xl border bg-white shadow-xs overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0 flex flex-col flex-1 min-h-0">

          {/* Header row: tab list + action buttons */}
          <div className="flex items-center justify-between border-b px-4 py-4 shrink-0">
            <TabsList className="h-9 gap-0.5 rounded-lg bg-gray-100 p-1">
              <TabsTrigger value="all" className={triggerClass}>
                All Accounts
              </TabsTrigger>
              <TabsTrigger value="deans" className={triggerClass}>
                Deans
                <BadgeCount count={deans.length} />
              </TabsTrigger>
              <TabsTrigger value="staff" className={triggerClass}>
                Staff
                <BadgeCount count={staff.length} />
              </TabsTrigger>
              <TabsTrigger value="recent" className={triggerClass}>
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-gray-600 cursor-pointer">
                <SlidersHorizontal />
                Customize Columns
              </Button>
              <Button size="sm" className="cursor-pointer" onClick={() => setShowRoleModal(true)}>
                <UserPlus />
                Add Account
              </Button>
            </div>
          </div>

          {/* All Accounts */}
          <TabsContent value="all" className="mt-0 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <TableHeader columns={["Name", "Role", "Username", "Date Added", "Actions"]} />
            {loading ? (
              <SkeletonRows columns={5} />
            ) : users.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No accounts found"
                description="All registered users will appear here. Use 'Add Account' to create the first one."
              />
            ) : (
              pagedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigateToAccount(user.id)}
                  className="grid cursor-pointer border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
                >
                  <span className="text-sm font-medium text-gray-800">{getFullName(user)}</span>
                  <span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {ROLE_DISPLAY_NAMES[user.role as keyof typeof ROLE_DISPLAY_NAMES] ?? "Unknown"}
                    </span>
                  </span>
                  <span className="text-sm text-gray-500">@{user.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => navigateToAccount(user.id)}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => navigateToAccount(user.id)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                </div>
              ))
            )}
          </TabsContent>

          {/* Deans */}
          <TabsContent value="deans" className="mt-0 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <TableHeader columns={["Full Name", "College / Department", "Username", "Date Added"]} />
            {loading ? (
              <SkeletonRows columns={4} />
            ) : deans.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No dean accounts yet"
                description="Dean-role accounts are displayed here. Assign the Dean role when adding a new account."
              />
            ) : (
              pagedDeans.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigateToAccount(user.id)}
                  className="grid cursor-pointer border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  <span className="text-sm font-medium text-gray-800">{getFullName(user)}</span>
                  <span className="text-sm text-gray-400">—</span>
                  <span className="text-sm text-gray-500">@{user.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                </div>
              ))
            )}
          </TabsContent>

          {/* Staff */}
          <TabsContent value="staff" className="mt-0 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <TableHeader columns={["Full Name", "Position / Designation", "Username", "Date Added"]} />
            {loading ? (
              <SkeletonRows columns={4} />
            ) : staff.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No staff accounts yet"
                description="Administrative staff accounts will appear here once they are registered in the system."
              />
            ) : (
              pagedStaff.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigateToAccount(user.id)}
                  className="grid cursor-pointer border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  <span className="text-sm font-medium text-gray-800">{getFullName(user)}</span>
                  <span className="text-sm text-gray-400">—</span>
                  <span className="text-sm text-gray-500">@{user.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                </div>
              ))
            )}
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="recent" className="mt-0 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <TableHeader columns={["User", "Action", "Role Assigned", "Date Registered"]} />
            {loading ? (
              <SkeletonRows columns={4} />
            ) : recentUsers.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No recent activity"
                description="Accounts created or modified this month will show up here for quick review."
              />
            ) : (
              pagedRecent.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigateToAccount(user.id)}
                  className="grid cursor-pointer border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  <span className="text-sm font-medium text-gray-800">{getFullName(user)}</span>
                  <span className="text-sm text-gray-500">Registered</span>
                  <span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {ROLE_DISPLAY_NAMES[user.role as keyof typeof ROLE_DISPLAY_NAMES] ?? "Unknown"}
                    </span>
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                </div>
              ))
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* ── Pagination bar — below the table card ── */}
      {showPagination && (
        <PaginationBar
          total={activePagination.total}
          page={activePagination.page}
          rowsPerPage={activePagination.rowsPerPage}
          onPageChange={activePagination.onPageChange}
          onRowsPerPageChange={activePagination.onRowsPerPageChange}
        />
      )}

      <RoleChooseModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectDean={() => {
          setShowRoleModal(false);
          setShowDeanModal(true);
        }}
      />
      <DeanRegisterModal
        isOpen={showDeanModal}
        onClose={() => setShowDeanModal(false)}
      />
    </div>
  );
}
