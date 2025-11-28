import { createFileRoute, Link } from "@tanstack/react-router";
import { GithubIcon, HeartIcon, TwitterIcon, XIcon } from "lucide-react";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { seo } from "@/lib/seo";

type Sponsor = {
	name: string;
	twitterHandle: string;
	githubHandle: string;
	tier: "gold" | "silver" | "bronze";
};

// Auto-generate avatar URL from Twitter handle
const getAvatarUrl = (twitterHandle: string) =>
	`https://unavatar.io/twitter/${twitterHandle}`;

const sponsors: Sponsor[] = [
	{
		name: "Brandon McConnell",
		twitterHandle: "branmcconnell",
		githubHandle: "brandonmcconnell",
		tier: "gold",
	},
];

export const Route = createFileRoute("/sponsors")({
	head: () => ({
		meta: [
			...seo({
				title: "Sponsors | who to bother on X",
				description: "Support the project and see our amazing sponsors.",
				keywords: "sponsors, support, github sponsors, open source",
				url: "https://who-to-bother-at.com/sponsors",
				image: "https://who-to-bother-at.com/opengraph", // TODO: Add specific OG image for sponsors if needed
			}),
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
		],
	}),
	component: SponsorsPage,
});

function SponsorsPage() {
	return (
		<div className="text-zinc-900 dark:text-zinc-100">
			<main className="mx-auto max-w-3xl flex flex-col gap-8 px-6 pt-8 pb-16 md:pt-12 md:pb-24">
				{/* Header */}
				<div className="flex flex-col gap-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600 transition-colors w-fit"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="m12 19-7-7 7-7" />
							<path d="M19 12H5" />
						</svg>
						Back to home
					</Link>

					<div className="flex items-center gap-3">
						<h1 className="m-0 text-4xl font-medium text-zinc-900 dark:text-zinc-100 md:text-5xl">
							Sponsors
						</h1>
						<HeartIcon className="size-8 text-red-500 fill-red-500 animate-pulse" />
					</div>

					<p className="m-0 text-lg text-zinc-600 dark:text-zinc-400">
						Support the development and maintenance of this project.
					</p>
				</div>

				{/* Sponsors Grid */}
				<div className="grid gap-6 sm:grid-cols-2">
					{sponsors.map((sponsor) => (
						<div
							key={sponsor.name}
							className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
						>
							<Avatar className="size-16 border-2 border-zinc-200 dark:border-zinc-700">
								<AvatarImage
									src={getAvatarUrl(sponsor.twitterHandle)}
									alt={sponsor.name}
								/>
								<AvatarFallback className="text-xl">
									{sponsor.name.charAt(0)}
								</AvatarFallback>
							</Avatar>

							<div className="flex flex-col gap-2 min-w-0 flex-1">
								<span className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
									{sponsor.name}
								</span>
								<div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
									{sponsor.twitterHandle && (
										<a
											href={`https://x.com/${sponsor.twitterHandle}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 hover:text-orange-600 hover:underline w-fit"
										>
											<svg
												fill="none"
												viewBox="0 0 1200 1227"
												className="inline-block size-[14px]"
											>
												<title>Twitter</title>
												<path
													fill="currentColor"
													d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
												/>
											</svg>
											@{sponsor.twitterHandle}
										</a>
									)}
									{sponsor.githubHandle && (
										<a
											href={`https://github.com/${sponsor.githubHandle}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 hover:text-orange-600 hover:underline w-fit"
										>
											<GithubIcon className="size-4" />
											{sponsor.githubHandle}
										</a>
									)}
								</div>
							</div>
						</div>
					))}

					{/* Become a Sponsor Card */}
					<a
						href="https://github.com/sponsors/kulterryan"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 transition-all hover:border-pink-400 hover:bg-pink-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-pink-600 dark:hover:bg-pink-950/20"
					>
						<div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600">
							<HeartIcon className="size-7 text-pink-500" />
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
								Become a sponsor
							</span>
							<span className="text-sm text-zinc-500 dark:text-zinc-400">
								Support this project
							</span>
						</div>
					</a>
				</div>

				<Footer />
			</main>
		</div>
	);
}
