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
  // UserCircle2,
} from "lucide-react";

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

function BadgeCount({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 leading-none">
      {count}
    </span>
  );
}

const triggerClass =
  "rounded-md px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-800 bg-transparent border-none shadow-none " +
  "data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm";

export function AccountsTabSection() {
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
              <BadgeCount count={0} />
            </TabsTrigger>
            <TabsTrigger value="staff" className={triggerClass}>
              Staff
              <BadgeCount count={0} />
            </TabsTrigger>
            <TabsTrigger value="recent" className={triggerClass}>
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-gray-600">
              <SlidersHorizontal />
              Customize Columns
            </Button>
            <Button size="sm">
              <UserPlus />
              Add Account
            </Button>
          </div>
        </div>

        {/* All Accounts */}
        <TabsContent value="all" className="mt-0 flex flex-col flex-1 min-h-0">
          <TableHeader columns={["Full Name", "Role", "Username", "Date Added", "Actions"]} />
          <EmptyState
            icon={Users}
            title="No accounts found"
            description="All registered users will appear here. Use 'Add Account' to create the first one."
          />
        </TabsContent>

        {/* Deans */}
        <TabsContent value="deans" className="mt-0 flex flex-col flex-1 min-h-0">
          <TableHeader columns={["Full Name", "College / Department", "Username", "Date Added"]} />
          <EmptyState
            icon={GraduationCap}
            title="No dean accounts yet"
            description="Dean-role accounts are displayed here. Assign the Dean role when adding a new account."
          />
        </TabsContent>

        {/* Staff */}
        <TabsContent value="staff" className="mt-0 flex flex-col flex-1 min-h-0">
          <TableHeader columns={["Full Name", "Position / Designation", "Username", "Date Added"]} />
          <EmptyState
            icon={Briefcase}
            title="No staff accounts yet"
            description="Administrative staff accounts will appear here once they are registered in the system."
          />
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="recent" className="mt-0 flex flex-col flex-1 min-h-0">
          <TableHeader columns={["User", "Action", "Role Assigned", "Date Registered"]} />
          <EmptyState
            icon={Clock}
            title="No recent activity"
            description="Accounts created or modified this month will show up here for quick review."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
