interface FooterProps {
	contributionTitle?: string;
	contributionMessage?: string;
}

export function Footer({
	contributionTitle = "Want to add your company?",
	contributionMessage = "This is a community-maintained directory. Have more contacts or companies to add?",
}: FooterProps) {
	return (
		<footer className="mt-16">
			<div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900/50">
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

			<p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
		</footer>
	);
}
