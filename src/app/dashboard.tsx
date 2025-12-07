import { createFileRoute, Link } from "@tanstack/react-router";
import { signOut, useSession } from "@/lib/auth-client";
import { authMiddleware } from "@/lib/auth-middleware";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
	head: () => ({
		meta: [
			...seo({
				title: "Dashboard | who to bother on X",
				description: "Your personal dashboard.",
				keywords: "dashboard, account, profile",
				url: "https://who-to-bother-at.com/dashboard",
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
	component: DashboardPage,
	server: {
		middleware: [authMiddleware],
	},
});

function DashboardPage() {
	const { data: session } = useSession();

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
			},
		});
	};

	return (
		<div className="min-h-screen text-zinc-900 dark:text-zinc-100">
			<main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<Link to="/" className="inline-block">
						<h1 className="text-2xl font-medium">
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
					<button
						type="button"
						onClick={handleSignOut}
						className="rounded-lg border-2 border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:border-red-500 hover:text-red-500 dark:border-zinc-700 dark:hover:border-red-500"
					>
						Sign Out
					</button>
				</div>

				{/* Welcome Card */}
				<div className="rounded-xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
					<div className="flex items-center gap-4 mb-6">
						{session?.user?.image ? (
							<img
								src={session.user.image}
								alt={session.user.name || "User"}
								className="h-16 w-16 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
							/>
						) : (
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-2xl font-bold text-white">
								{session?.user?.name?.charAt(0) || "U"}
							</div>
						)}
						<div>
							<h2 className="text-2xl font-semibold">
								Welcome, {session?.user?.name || "User"}!
							</h2>
							<p className="text-zinc-600 dark:text-zinc-400">
								{session?.user?.email}
							</p>
						</div>
					</div>

					<div className="rounded-lg bg-green-50 border-2 border-green-200 p-4 dark:bg-green-950/20 dark:border-green-800">
						<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
								<polyline points="22 4 12 14.01 9 11.01" />
							</svg>
							<span className="font-medium">
								🎉 Authentication is working!
							</span>
						</div>
						<p className="mt-2 text-sm text-green-600 dark:text-green-500">
							You've successfully authenticated with GitHub. This page is
							protected by the auth middleware.
						</p>
					</div>
				</div>

				{/* Session Info */}
				<div className="mt-6 rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
					<h3 className="mb-4 text-lg font-semibold">Session Details</h3>
					<div className="overflow-x-auto">
						<pre className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
							{JSON.stringify(session, null, 2)}
						</pre>
					</div>
				</div>

				{/* Quick Links */}
				<div className="mt-6 flex gap-4">
					<Link
						to="/"
						className="flex-1 rounded-lg border-2 border-zinc-200 bg-white p-4 text-center font-medium transition-all hover:border-orange-600 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
					>
						← Back to Home
					</Link>
					<Link
						to="/search"
						className="flex-1 rounded-lg border-2 border-orange-600 bg-orange-600 p-4 text-center font-medium text-white transition-all hover:bg-orange-700"
					>
						Search Companies →
					</Link>
				</div>
			</main>
		</div>
	);
}

