"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/core/lib/utils";

function Portal({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      data-slot="portal"
      className={cn("fixed inset-x-0 bottom-0 z-50", className)}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

function PortalBackdrop({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="portal-backdrop"
      className={cn("fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm", className)}
      {...props}
    />
  );
}

export { Portal, PortalBackdrop };
