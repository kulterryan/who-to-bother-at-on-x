import { Link, useMatches } from "@tanstack/react-router";
import {
	ChartColumnIncreasing,
	GithubIcon,
	HeartIcon,
	MenuIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { companyLogos } from "@/components/company-logos";
import { MobileThemeToggle, ModeToggle } from "@/components/theme-toggle";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Company } from "@/types/company";

export function Header() {
	const [isScrolled, setIsScrolled] = useState(false);

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
		<header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
			<div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
				{/* Logo / Title */}
				<Link
					to="/"
					className={`flex items-center gap-2 text-zinc-900 transition-all duration-300 hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-600 ${
						isScrolled
							? "opacity-100 translate-x-0"
							: "opacity-0 -translate-x-4 pointer-events-none"
					}`}
				>
					{company ? (
						// Show "bother at [logo]" for company pages
						<>
							<span className="text-lg font-medium">who to bother at</span>
							<div className="flex items-center [&>svg]:h-[18px] [&>svg]:w-auto">
								{companyLogos[company.logoType]}
							</div>
						</>
					) : (
						// Show default "who to bother on X" for other pages
						<>
							<span className="text-lg font-medium">who to bother on</span>
							<svg
								fill="none"
								viewBox="0 0 1200 1227"
								width="20"
								height="18"
								className="inline-block"
								aria-hidden="true"
							>
								<path
									fill="currentColor"
									d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
								/>
							</svg>
						</>
					)}
				</Link>

				{/* Navigation - Regular (>= 390px) */}
				<nav className="hidden min-[390px]:flex items-center gap-1">
					<Link
						to="/sponsors"
						className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-600"
						aria-label="Sponsors"
					>
						<HeartIcon className="size-4" />
					</Link>
					<Link
						to="/stats"
						className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-600"
						aria-label="Stats"
					>
						<ChartColumnIncreasing className="size-4" />
					</Link>
					<a
						href="https://github.com/kulterryan/who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
						aria-label="View on GitHub"
					>
						<GithubIcon className="size-4" />
					</a>
					{/* Separator */}
					<div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
					{/* Desktop theme toggle */}
					<div className="hidden sm:block">
						<ModeToggle />
					</div>
					{/* Mobile theme toggle */}
					<div className="sm:hidden">
						<MobileThemeToggle />
					</div>
				</nav>

				{/* Navigation - Compact (< 390px) */}
				<nav className="flex min-[390px]:hidden items-center gap-1">
					<MobileThemeToggle />
					<div className="mx-0.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
					<CompactMenu />
				</nav>
			</div>
		</header>
	);
}

function CompactMenu() {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
				aria-label="Menu"
			>
				<MenuIcon className="size-4" />
			</PopoverTrigger>
			<PopoverContent
				className="w-auto border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
				align="end"
				sideOffset={8}
			>
				<div className="flex flex-col gap-0.5">
					<Link
						to="/sponsors"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-orange-600"
					>
						<HeartIcon className="size-4" />
						<span>Sponsors</span>
					</Link>
					<Link
						to="/stats"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-orange-600"
					>
						<ChartColumnIncreasing className="size-4" />
						<span>Stats</span>
					</Link>
					<a
						href="https://github.com/kulterryan/who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
					>
						<GithubIcon className="size-4" />
						<span>GitHub</span>
					</a>
				</div>
			</PopoverContent>
		</Popover>
	);
}
