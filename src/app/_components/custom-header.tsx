"use client";
import { cn } from "@/core/lib/utils";
import Image from "next/image";
import { useScroll } from "../_hooks/use-scroll";
import { Button } from "@/shared/components/ui/button";
import { MobileNav } from "./mobile-nav";

export const navLinks = [
  {
    label: "Features",
    href: "#",
  },
  {
    label: "Pricing",
    href: "#",
  },
  {
    label: "About",
    href: "#",
  },
];

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/images/norsu.png"
        alt="NORSU logo"
        width={24}
        height={24}
        className="size-6 object-contain"
      />
      <span className="text-sm font-semibold tracking-tight">NORSU</span>
    </span>
  );
}

export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <a
          className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          href="#"
        >
          <Logo className="h-4" />
        </a>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
        <MobileNav
          links={navLinks}
          primaryAction={{ label: "Get Started", href: "#" }}
          secondaryAction={{ label: "Sign In", href: "#" }}
        />
      </nav>
    </header>
  );
}
