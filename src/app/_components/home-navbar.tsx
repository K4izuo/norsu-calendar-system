"use client";

import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

interface HomeNavbarProps {
  onScrollToAbout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function HomeNavbar({ onScrollToAbout }: HomeNavbarProps) {
  return (
    <div className="relative bg-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-36 py-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center justify-between w-full gap-y-2">
      <div className="flex flex-row items-center justify-center sm:justify-start w-full sm:w-auto gap-2 sm:gap-0">
        <Link href="/login">
          <Image
            src="/images/norsu.png"
            alt="Negros Oriental State University"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain cursor-pointer"
            width={48}
            height={48}
          />
        </Link>
        <div className="flex flex-col items-center min-w-0 sm:hidden ml-2">
          <h1 className="font-semibold text-xl text-gray-800 text-center truncate">
            NORSU Calendar System
          </h1>
          <p className="text-sm text-gray-500 text-center truncate">
            Negros Oriental State University
          </p>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-0">
        <h1 className="font-semibold text-2xl md:text-3xl text-gray-800 text-center truncate">
          NORSU Calendar System
        </h1>
        <p className="text-base md:text-lg text-gray-500 text-center truncate">
          Negros Oriental State University
        </p>
      </div>
      <div className="flex items-center space-x-1 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
        <Button asChild variant="ghost">
          <a href="#about-section" onClick={onScrollToAbout} className="px-2 text-base sm:text-lg md:text-xl">
            ABOUT
          </a>
        </Button>
        {/* <span className="text-gray-200 text-xl select-none xs:inline">|</span>
        <Button asChild variant="ghost">
          <Link
            href="/auth/login"
            className="px-2 text-base sm:text-lg md:text-xl"
          >
            LOGIN
          </Link>
        </Button>
        <span className="text-gray-200 text-xl select-none xs:inline">|</span>
        <Button asChild variant="ghost">
          <Link
            href="/auth/register"
            className="px-2 text-base sm:text-lg md:text-xl"
          >
            REGISTER
          </Link>
        </Button> */}
      </div>
    </div>
  );
}
