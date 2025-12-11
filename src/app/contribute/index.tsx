import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GitPullRequest, LogIn, Plus } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contribute/")({
	head: () => ({
		meta: [
			...seo({
				title: "Contribute | who to bother on X",
				description:
					"Add your company or update existing company information. Submit a PR directly from the website.",
				keywords: "contribute, add company, edit company, pull request",
				url: "https://who-to-bother-at.com/contribute",
				image: "https://who-to-bother-at.com/opengraph",
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
	component: ContributePage,
});

function ContributePage() {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center text-zinc-900 dark:text-zinc-100">
				<div className="flex items-center gap-2">
					<svg
						className="h-5 w-5 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen text-zinc-900 dark:text-zinc-100">
			<main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
				{/* Header */}
				<div className="mb-8">
					<Link to="/" className="inline-block">
						<h1 className="font-medium text-2xl">
							who to bother on{" "}
							<svg
								fill="none"
								viewBox="0 0 1200 1227"
								width="24"
								height="22"
								className="inline-block"
							>
								<path
									fill="currentColor"
									d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
								/>
							</svg>
						</h1>
					</Link>
				</div>

				{/* Page Title */}
				<div className="mb-8">
					<h2 className="font-bold text-3xl">Contribute</h2>
					<p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
						Add your company to the directory. Your changes will
						be submitted as a pull request.
					</p>
				</div>

				{/* Not Logged In */}
				{!session && (
					<div className="rounded-xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
						<div className="text-center">
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<LogIn className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
							</div>
							<h3 className="font-semibold text-xl">Sign in to Contribute</h3>
							<p className="mt-2 text-zinc-600 dark:text-zinc-400">
								You need to sign in with GitHub to submit contributions. This
								allows us to create pull requests on your behalf.
							</p>
							<Link
								to="/login"
								className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
							>
								<svg
									viewBox="0 0 24 24"
									width="20"
									height="20"
									fill="currentColor"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								Sign in with GitHub
							</Link>
						</div>
					</div>
				)}

				{/* Logged In */}
				{session && (
					<>
						{/* User Info */}
						<div className="mb-8 flex items-center gap-4 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
							{session.user?.image ? (
								<img
									src={session.user.image}
									alt={session.user.name || "User"}
									className="h-12 w-12 rounded-full border-2 border-green-300 dark:border-green-700"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 font-bold text-lg text-white">
									{session.user?.name?.charAt(0) || "U"}
								</div>
							)}
							<div>
								<p className="mb-0 font-medium text-green-700 dark:text-green-400">
									Signed in as {session.user?.name || session.user?.email}
								</p>
								<p className="mb-0 text-green-600 text-sm dark:text-green-500">
									Ready to contribute via GitHub
								</p>
							</div>
						</div>

						{/* Action Cards */}
						<div className="grid gap-6 md:grid-cols-2">
							{/* Add New Company */}
							<Link
								to="/contribute/add"
								className="group rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-orange-600 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/30">
									<Plus className="h-6 w-6" />
								</div>
								<h3 className="font-semibold text-xl">Add New Company</h3>
								<p className="mt-2 text-zinc-600 dark:text-zinc-400">
									Add a new company with contact information and logo. Perfect
									for companies not yet in our directory.
								</p>
								<div className="mt-4 flex items-center gap-2 font-medium text-orange-600 text-sm dark:text-orange-500">
									<span>Get started</span>
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
									>
										<path d="M5 12h14" />
										<path d="m12 5 7 7-7 7" />
									</svg>
								</div>
							</Link>

							{/* Edit Existing Company */}
							{/* <Link
								to="/contribute/edit"
								className="group rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-orange-600 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30">
									<Edit className="h-6 w-6" />
								</div>
								<h3 className="text-xl font-semibold">Edit Existing Company</h3>
								<p className="mt-2 text-zinc-600 dark:text-zinc-400">
									Update information for a company already in our directory. Fix
									errors or add new contacts.
								</p>
								<div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-500">
									<span>Browse companies</span>
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
									>
										<path d="M5 12h14" />
										<path d="m12 5 7 7-7 7" />
									</svg>
								</div>
							</Link> */}
						</div>

						{/* How it Works */}
						<div className="mt-12">
							<h3 className="mb-6 font-semibold text-xl">How it Works</h3>
							<div className="grid gap-4 md:grid-cols-3">
								<div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 font-bold text-sm text-white">
										1
									</div>
									<h4 className="font-medium">Fill out the form</h4>
									<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
										Enter company details, contacts, and upload your logo.
									</p>
								</div>
								<div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 font-bold text-sm text-white">
										2
									</div>
									<h4 className="font-medium">Submit your changes</h4>
									<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
										We'll automatically create a pull request on your behalf.
									</p>
								</div>
								<div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
									<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 font-bold text-sm text-white">
										3
									</div>
									<h4 className="font-medium">Get it reviewed</h4>
									<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
										A maintainer will review and merge your contribution.
									</p>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Links */}
				<div className="mt-12 flex flex-wrap justify-center gap-4 border-zinc-200 border-t pt-8 dark:border-zinc-700">
					<a
						href="https://github.com/kulterryan/cf-who-to-bother-at-on-x"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
					>
						<GitPullRequest className="h-4 w-4" />
						View Repository
					</a>
					<a
						href="https://github.com/kulterryan/cf-who-to-bother-at-on-x/blob/main/CONTRIBUTING.md"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
					>
						<BookOpen className="h-4 w-4" />
						Contributing Guide
					</a>
				</div>
			</main>
		</div>
	);
}
