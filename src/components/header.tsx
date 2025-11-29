import { Link, useMatches } from "@tanstack/react-router";
import {
	ChartColumnIncreasing,
	Github,
	GithubIcon,
	HeartIcon,
	PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { companyLogos } from "@/components/company-logos";
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
			{/* Main Header */}
			<div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
				{/* Left side - Logo or Sub Navigation */}
				<div className="relative">
					{/* Sub Navigation - Visible when NOT scrolled */}
					<nav
						className={`flex items-center gap-4 transition-all duration-300 ${
							isScrolled
								? "opacity-0 -translate-x-4 pointer-events-none"
								: "opacity-100 translate-x-0"
						}`}
					>
						<Link
							to="/sponsors"
							className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
						>
							<HeartIcon className="size-3.5" />
							<span>Sponsors</span>
						</Link>
						<Link
							to="/stats"
							className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
						>
							<ChartColumnIncreasing className="size-3.5" />
							<span>Stats</span>
						</Link>
					</nav>

					{/* Logo / Title - Visible when scrolled */}
					<Link
						to="/"
						className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap text-zinc-900 transition-all duration-300 hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-600 ${
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
				</div>

				{/* Navigation */}
				<nav className="flex items-center gap-2">
					{/* CTA Button */}
					<a
						href="https://github.com/kulterryan/who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-lg bg-orange-600 p-2 sm:px-3 sm:py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 font-mono"
						aria-label="Add who to bother"
					>
						<GithubIcon className="size-4 sm:size-3.5" />
						<span className="hidden sm:inline">Add who to bother</span>
					</a>
				</nav>
			</div>

			{/* Sub Navigation Bar - Appears on scroll */}
			<div
				className={`border-t border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 overflow-hidden ${
					isScrolled ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="mx-auto flex h-12 max-w-3xl items-center justify-start px-6">
					<nav className="flex items-center gap-4">
						<Link
							to="/sponsors"
							className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
						>
							<HeartIcon className="size-3.5" />
							<span>Sponsors</span>
						</Link>
						<Link
							to="/stats"
							className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
						>
							<ChartColumnIncreasing className="size-3.5" />
							<span>Stats</span>
						</Link>
					</nav>
				</div>
			</div>
		</header>
	);
}
