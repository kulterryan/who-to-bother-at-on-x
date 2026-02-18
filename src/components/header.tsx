import { Link, useMatches } from "@tanstack/react-router";
import {
  ChartColumnIncreasing,
  GithubIcon,
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

  const matches = useMatches();
  const companyRoute = matches.find((match) => match.routeId === "/$company");
  const company = companyRoute?.loaderData as Company | undefined;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-border/60 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        {/* Left: Nav or Logo */}
        <div className="relative">
          {/* Nav links -- visible when not scrolled */}
          <nav
            className={`flex items-center gap-5 transition-all duration-300 ${
              isScrolled
                ? "pointer-events-none -translate-x-3 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              to="/contribute"
            >
              <PlusIcon className="size-3.5" />
              <span>Contribute</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              to="/sponsors"
            >
              <HeartIcon className="size-3.5" />
              <span>Sponsors</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              to="/stats"
            >
              <ChartColumnIncreasing className="size-3.5" />
              <span>Stats</span>
            </Link>
            {session ? (
              <button
                className="flex cursor-pointer items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                onClick={() => signOut()}
                type="button"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            ) : null}
          </nav>

          {/* Logo -- visible on scroll */}
          <Link
            className={`absolute top-1/2 left-0 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap text-foreground transition-all duration-300 hover:text-accent ${
              isScrolled
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-3 opacity-0"
            }`}
            to="/"
          >
            {company ? (
              <>
                <span className="font-medium text-sm">who to bother at</span>
                <div className="flex items-center [&>svg]:h-[16px] [&>svg]:w-auto">
                  {companyLogos[company.logoType]}
                </div>
              </>
            ) : (
              <>
                <span className="font-medium text-sm">who to bother on</span>
                <svg
                  aria-hidden="true"
                  className="inline-block"
                  fill="none"
                  height="14"
                  viewBox="0 0 1200 1227"
                  width="16"
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            aria-label="View the repository on GitHub"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-secondary-foreground text-sm transition-colors hover:bg-secondary/80"
            href="https://github.com/kulterryan/who-to-bother-at-on-x"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Sub nav on scroll */}
      <div
        className={`overflow-hidden border-border/60 border-t transition-all duration-300 ${
          isScrolled ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-10 max-w-4xl items-center px-6">
          <nav className="flex items-center gap-5">
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
              to="/contribute"
            >
              <PlusIcon className="size-3" />
              <span>Contribute</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
              to="/sponsors"
            >
              <HeartIcon className="size-3" />
              <span>Sponsors</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
              to="/stats"
            >
              <ChartColumnIncreasing className="size-3" />
              <span>Stats</span>
            </Link>
            {session ? (
              <button
                className="flex cursor-pointer items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
                onClick={() => signOut()}
                type="button"
              >
                <LogOut className="size-3" />
                <span>Sign Out</span>
              </button>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
