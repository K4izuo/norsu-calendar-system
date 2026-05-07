"use client";

import { cn } from "@/core/lib/utils";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScroll } from "../_hooks/use-scroll";
import { MobileNav, type MobileNavLink } from "./mobile-nav";

const Navbar = () => {
  const pathname = usePathname();
  const scrolled = useScroll(10);
  const landingHref = pathname === "/demo" ? "/demo" : "/";
  const isLandingPage = pathname === "/" || pathname === "/demo";

  const scrollToSection = (elementId: string, offset: number) => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      return;
    }

    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLandingPage) {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAboutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLandingPage) {
      return;
    }

    event.preventDefault();
    scrollToSection("about-intro", 88);
  };

  const handleTeamClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLandingPage) {
      return;
    }

    event.preventDefault();
    scrollToSection("team-intro", 88);
  };

  const navLinks: MobileNavLink[] = [
    { label: "Home", href: landingHref, onClick: handleBrandClick },
    { label: "About", href: landingHref, onClick: handleAboutClick },
    { label: "Team", href: landingHref, onClick: handleTeamClick },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-6xl md:shadow":
            scrolled,
        },
      )}
    >
      <nav
        className={cn(
          "flex w-full items-center justify-between px-6 md:transition-all md:ease-out",
        )}
      >
        <div className="flex items-center">
          <Link
            href="/login"
            className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          >
            <Image
              src="/images/norsu.png"
              alt="NORSU logo"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
          </Link>
          <Link
            href={landingHref}
            onClick={handleBrandClick}
            className="rounded-md text-xl font-semibold tracking-tight hover:bg-muted dark:hover:bg-muted/50"
          >
            NORSU
          </Link>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <Link href={link.href} onClick={link.onClick}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <MobileNav links={navLinks} />
      </nav>
    </header>
  );
};

export default Navbar;
