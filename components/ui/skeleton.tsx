import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Dashboard skeleton
function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-start self-stretch">
      <div className="flex items-center mb-5 gap-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex flex-col items-start gap-9 flex-1 self-stretch">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-27.5 w-full" />
          ))}
        </div>
        <div className="flex gap-6 w-full">
          <Skeleton className="h-75 flex-1" />
          <Skeleton className="h-75 flex-1" />
        </div>
      </div>
    </div>
  );
}

// Calendar skeleton
function CalendarSkeleton() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between mb-5">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 gap-2">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

// Table skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" /> {/* Header */}
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, DashboardSkeleton, CalendarSkeleton, TableSkeleton }
