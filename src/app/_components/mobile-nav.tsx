"use client";

import { cn } from "@/core/lib/utils";
import Link from "next/link";
import React from "react";
import { Portal, PortalBackdrop } from "@/shared/components/ui/portal";
import { Button } from "@/shared/components/ui/button";
import { XIcon, MenuIcon } from "lucide-react";

export type MobileNavLink = {
  label: string;
  href: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

type MobileNavProps = {
  links: MobileNavLink[];
  primaryAction?: MobileNavLink;
  secondaryAction?: MobileNavLink;
};

export function MobileNav({ links, primaryAction, secondaryAction }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const handleLinkClick =
    (onClick?: MobileNavLink["onClick"]) =>
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      setOpen(false);
    };

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full p-4"
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="grid gap-y-2">
              {links.map((link) => (
                <Button
                  asChild
                  className="justify-start"
                  key={link.label}
                  variant="ghost"
                >
                  <Link href={link.href} onClick={handleLinkClick(link.onClick)}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
            {(secondaryAction || primaryAction) && (
              <div className="mt-12 flex flex-col gap-2">
                {secondaryAction && (
                  <Button asChild className="w-full" variant="outline">
                    <Link
                      href={secondaryAction.href}
                      onClick={handleLinkClick(secondaryAction.onClick)}
                    >
                      {secondaryAction.label}
                    </Link>
                  </Button>
                )}
                {primaryAction && (
                  <Button asChild className="w-full">
                    <Link
                      href={primaryAction.href}
                      onClick={handleLinkClick(primaryAction.onClick)}
                    >
                      {primaryAction.label}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
