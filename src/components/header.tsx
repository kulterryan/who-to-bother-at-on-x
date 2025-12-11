import { Link, useMatches } from "@tanstack/react-router";
import {
  ChartColumnIncreasing,
  HeartIcon,
  LogOut,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { companyLogos } from "@/components/company-logos";
import { signOut, useSession } from "@/lib/auth-client";
import type { Company } from "@/types/company";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

  // Get company data if we're on a company page
  const matches = useMatches();
  const companyRoute = matches.find((match) => match.routeId === "/$company");
  const company = companyRoute?.loaderData as Company | undefined;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-zinc-200/80 border-b bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      {/* Main Header */}
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        {/* Left side - Logo or Sub Navigation */}
        <div className="relative">
          {/* Sub Navigation - Visible when NOT scrolled */}
          <nav
            className={`flex items-center gap-4 transition-all duration-300 ${
              isScrolled
                ? "-translate-x-4 pointer-events-none opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/contribute"
            >
              <PlusIcon className="size-3.5" />
              <span>Contribute</span>
            </Link>
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/sponsors"
            >
              <HeartIcon className="size-3.5" />
              <span>Sponsors</span>
            </Link>
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/stats"
            >
              <ChartColumnIncreasing className="size-3.5" />
              <span>Stats</span>
            </Link>
            {session ? (
              <button
                className="flex cursor-pointer items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                onClick={() => signOut()}
                type="button"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            ) : null}
          </nav>

          {/* Logo / Title - Visible when scrolled */}
          <Link
            className={`-translate-y-1/2 absolute top-1/2 left-0 flex items-center gap-2 whitespace-nowrap text-zinc-900 transition-all duration-300 hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-600 ${
              isScrolled
                ? "translate-x-0 opacity-100"
                : "-translate-x-4 pointer-events-none opacity-0"
            }`}
            to="/"
          >
            {company ? (
              // Show "bother at [logo]" for company pages
              <>
                <span className="font-medium text-lg">who to bother at</span>
                <div className="flex items-center [&>svg]:h-[18px] [&>svg]:w-auto">
                  {companyLogos[company.logoType]}
                </div>
              </>
            ) : (
              // Show default "who to bother on X" for other pages
              <>
                <span className="font-medium text-lg">who to bother on</span>
                <svg
                  aria-hidden="true"
                  className="inline-block"
                  fill="none"
                  height="18"
                  viewBox="0 0 1200 1227"
                  width="20"
                >
                  <title>X (Twitter) logo</title>
                  <path
                    d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                    fill="currentColor"
                  />
                </svg>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {/* Contribute Button */}
          <Link
            aria-label="Contribute to the directory"
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 p-2 font-medium text-sm text-white transition-colors hover:bg-orange-700 sm:px-3 sm:py-1.5"
            to="/contribute"
          >
            <PlusIcon className="size-4 sm:size-3.5" />
            <span className="hidden sm:inline">Contribute</span>
          </Link>
        </nav>
      </div>

      {/* Sub Navigation Bar - Appears on scroll */}
      <div
        className={`overflow-hidden border-zinc-200/80 border-t transition-all duration-300 dark:border-zinc-800/80 ${
          isScrolled ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-start px-6">
          <nav className="flex items-center gap-4">
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/contribute"
            >
              <PlusIcon className="size-3.5" />
              <span>Contribute</span>
            </Link>
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/sponsors"
            >
              <HeartIcon className="size-3.5" />
              <span>Sponsors</span>
            </Link>
            <Link
              className="flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
              to="/stats"
            >
              <ChartColumnIncreasing className="size-3.5" />
              <span>Stats</span>
            </Link>
            {session ? (
              <button
                className="flex cursor-pointer items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                onClick={() => signOut()}
                type="button"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
