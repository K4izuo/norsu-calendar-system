"use client";

import { useParams } from "next/navigation";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useActivityLogs } from "@/features/activity-logs/services/activity-log-service";
import { useAuth } from "@/shared/components/context/auth-context";
import type { ActivityLog, ActivityLogGroup, ActivityLogType } from "@/features/activity-logs/types/activity-log.types";

const TYPE_CIRCLE: Record<ActivityLogType, string> = {
  reservation_created: "bg-blue-500",
  reservation_approved: "bg-green-500",
  reservation_declined: "bg-red-500",
  reservation_endorsed: "bg-amber-500",
  reservation_moved: "bg-purple-500",
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function groupByDate(logs: ActivityLog[]): ActivityLogGroup[] {
  const groups = new Map<string, ActivityLog[]>([["Today", []]]);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const log of logs) {
    const date = new Date(log.created_at);
    let label: string;

    if (isSameDay(date, now)) {
      label = "Today";
    } else if (isSameDay(date, yesterday)) {
      label = "Yesterday";
    } else {
      label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(log);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function TimelineItem({ item, isLast }: { item: ActivityLog; isLast: boolean }) {
  const circleClass = TYPE_CIRCLE[item.type];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${circleClass} mt-1 shrink-0`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="flex-1 pb-5">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/60">{formatTimestamp(item.created_at)}</p>
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const params = useParams();
  const role = params.role as string;

  const { isLoading: isAuthLoading } = useAuth();
  const { logs, loading, isFetching, error } = useActivityLogs();
  usePageReady(isAuthLoading || loading, isFetching);

  const groups = groupByDate(logs);

  return (
    <div className="flex flex-col self-stretch h-full min-h-0">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Activity Logs" },
        ]}
      />

      <Card className="w-full bg-white text-card-foreground border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold tracking-tight">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Failed to load activity logs. Please try again.
            </p>
          ) : loading ? null : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No activity recorded yet.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-6 last:mb-0">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0">
                  {group.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 pb-2">No activity today.</p>
                  ) : (
                    group.items.map((item, index) => (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        isLast={index === group.items.length - 1}
                      />
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
