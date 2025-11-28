import { Link } from "@tanstack/react-router";
import { ChartColumnIncreasing, GithubIcon, HeartIcon } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

interface FooterProps {
	contributionTitle?: string;
	contributionMessage?: string;
}

export function Footer({
	contributionTitle = "Want to add your company?",
	contributionMessage = "This is a community-maintained directory. Have more contacts or companies to add?",
}: FooterProps) {
	return (
		<>
			<div className="mt-16 rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900/50">
				<h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
					{contributionTitle}
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					{contributionMessage}{" "}
					<a
						href="https://github.com/kulterryan/who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
					>
						Submit a pull request
					</a>{" "}
					on GitHub and contribute to the community! Reach out to{" "}
					<a
						href="https://x.com/thehungrybird_"
						target="_blank"
						rel="noopener noreferrer"
						className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
					>
						@thehungrybird_
					</a>{" "}
					if you have questions.
				</p>
			</div>

			<p className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
				Created by:{" "}
				<a
					href="https://x.com/thehungrybird_"
					target="_blank"
					rel="noopener noreferrer"
					className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
				>
					@thehungrybird_
				</a>
				{" · "}
				Concept by:{" "}
				<a
					href="https://x.com/strehldev"
					target="_blank"
					rel="noopener noreferrer"
					className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
				>
					@strehldev
				</a>
			</p>

			<div className="flex flex-col items-center gap-4">
				<div className="flex items-center gap-4">
					<Link
						to="/sponsors"
						className="text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
						aria-label="Sponsors"
					>
						<HeartIcon className="size-4" />
					</Link>
					<Link
						to="/stats"
						className="text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
					>
						<ChartColumnIncreasing className="size-4" />
					</Link>
					<a
						href="https://github.com/kulterryan/who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
						aria-label="View on GitHub"
					>
						<GithubIcon className="size-4" />
					</a>
				</div>
				<ModeToggle />
			</div>
		</>
	);
}
