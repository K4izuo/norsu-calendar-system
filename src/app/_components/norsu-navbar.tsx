"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const scrollToSection = (elementId: string, offset: number) => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      return;
    }

    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/demo") {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAboutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/demo") {
      return;
    }

    event.preventDefault();
    scrollToSection("about-intro", 88);
  };

  const handleTeamClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/demo") {
      return;
    }

    event.preventDefault();
    scrollToSection("team-intro", 88);
  };

  return (
    <nav className="sticky top-0 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body z-30 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <Link href="/login">
          <Image src="/images/norsu.png" alt="NORSU logo" width={36} height={36} className="object-contain" />
        </Link>
        <Link
          href="/demo"
          onClick={handleBrandClick}
          className="text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          NORSU
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/demo"
          onClick={handleBrandClick}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="/demo"
          onClick={handleAboutClick}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          About
        </Link>
        <Link
          href="/demo"
          onClick={handleTeamClick}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Team
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
