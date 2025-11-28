import { Link } from "@tanstack/react-router";
import { ChartColumnIncreasing, GithubIcon, HeartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/theme-toggle";

export function Header() {
	const [isScrolled, setIsScrolled] = useState(false);

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
					<span className="text-lg font-medium">who to bother on</span>
					<svg
						fill="none"
						viewBox="0 0 1200 1227"
						width="20"
						height="18"
						className="inline-block"
						aria-label="X"
					>
						<path
							fill="currentColor"
							d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
						/>
					</svg>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-1">
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
					<div className="ml-1 border-l border-zinc-200 pl-2 dark:border-zinc-700">
						<ModeToggle />
					</div>
				</nav>
			</div>
		</header>
	);
}
