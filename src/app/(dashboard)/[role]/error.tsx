"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>

      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          We hit a snag loading this page
        </h2>
        <p className="text-muted-foreground text-sm">
          Try refreshing the section. If the problem keeps happening, head back to your dashboard.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/70 mt-2 font-mono text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <Home className="size-4" />
          Go back
        </Button>
      </div>
    </div>
  );
}
