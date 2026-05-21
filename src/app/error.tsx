"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>

      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          An unexpected error occurred. You can try again or return to the previous page.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/70 mt-2 font-mono text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <Button onClick={reset} className="gap-2">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
