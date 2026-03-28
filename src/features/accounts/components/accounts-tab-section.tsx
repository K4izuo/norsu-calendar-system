"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import {
  SlidersHorizontal,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  Clock,
} from "lucide-react";
import { useUsers } from "../services/account-service";
import { ROLE_DISPLAY_NAMES } from "@/features/auth/types/auth.types";
import type { UserAccount } from "../types/account.types";

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
    <div className="grid border-b px-6 py-2.5" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
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
  if (role === 2) return "bg-blue-100 text-blue-700";
  if (role === 3) return "bg-green-100 text-green-700";
  if (role === 1) return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-600";
}

const triggerClass =
  "rounded-md cursor-pointer px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-800 bg-transparent border-none shadow-none " +
  "data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm";

export function AccountsTabSection() {
  const { users, loading } = useUsers();

  const deans = users.filter((u) => u.role === 2);
  const staff = users.filter((u) => u.role === 3);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = [...users]
    .filter((u) => u.created_at && new Date(u.created_at) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

  return (
    <div className="h-full w-full text-card-foreground rounded-xl border bg-white shadow-xs overflow-hidden flex flex-col">
      <Tabs defaultValue="all" className="w-full gap-0 flex flex-col flex-1 min-h-0">
        {/* Header row: tab list + action buttons */}
        <div className="flex items-center justify-between border-b px-4 py-4">
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
            <Button size="sm" className="cursor-pointer">
              <UserPlus />
              Add Account
            </Button>
          </div>
        </div>

        {/* All Accounts */}
        <TabsContent value="all" className="mt-0 flex flex-col flex-1 min-h-0 overflow-y-auto">
          <TableHeader columns={["Full Name", "Role", "Username", "Date Added", "Actions"]} />
          {loading ? (
            <SkeletonRows columns={5} />
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No accounts found"
              description="All registered users will appear here. Use 'Add Account' to create the first one."
            />
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="grid border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
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
                <span>
                  <button className="text-xs text-gray-400 hover:text-gray-600">•••</button>
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
            deans.map((user) => (
              <div
                key={user.id}
                className="grid border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
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
            staff.map((user) => (
              <div
                key={user.id}
                className="grid border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
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
            recentUsers.map((user) => (
              <div
                key={user.id}
                className="grid border-b px-6 py-3.5 hover:bg-gray-50 transition-colors"
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
  );
}
