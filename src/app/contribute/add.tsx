import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { CompanyForm } from "@/components/contribute/company-form";
import {
	PRStatus,
	type PRStatusState,
} from "@/components/contribute/pr-status";
import { SVGUploader } from "@/components/contribute/svg-uploader";
import { useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";
import type { Company } from "@/types/company";

export const Route = createFileRoute("/contribute/add")({
	head: () => ({
		meta: [
			...seo({
				title: "Add Company | who to bother on X",
				description:
					"Add a new company to the directory. Fill out the form and we'll create a PR for you.",
				keywords: "add company, contribute, pull request",
				url: "https://who-to-bother-at.com/contribute/add",
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
	component: AddCompanyPage,
});

function AddCompanyPage() {
	const { data: session, isPending } = useSession();
	const navigate = useNavigate();
	const [svgLogo, setSvgLogo] = useState("");
	const [svgError, setSvgError] = useState<string | undefined>();
	const [prStatus, setPRStatus] = useState<PRStatusState>({ type: "idle" });

	const handleSubmit = useCallback(
		async (company: Company) => {
			// Validate SVG
			if (!svgLogo) {
				setSvgError("Please upload an SVG logo");
				return;
			}

			setSvgError(undefined);
			setPRStatus({ type: "forking" });

			try {
				// First, fork the repository
				const forkResponse = await fetch("/api/github/fork", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!forkResponse.ok) {
					const error = await forkResponse.json();
					throw new Error(error.error || "Failed to fork repository");
				}

				const forkResult = await forkResponse.json();

				// Update status based on fork result
				if (forkResult.isOwner) {
					// Owner doesn't need fork
					setPRStatus({ type: "creating-branch" });
				} else if (forkResult.fork?.alreadyExisted) {
					setPRStatus({ type: "forking", alreadyExists: true });
					await new Promise((resolve) => setTimeout(resolve, 500));
					setPRStatus({ type: "creating-branch" });
				} else {
					// Wait a moment for new fork to be ready
					await new Promise((resolve) => setTimeout(resolve, 1000));
					setPRStatus({ type: "creating-branch" });
				}

				setPRStatus({ type: "committing" });

				// Then create the PR
				const prResponse = await fetch("/api/github/create-pr", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						company,
						svgLogo,
						isEdit: false,
					}),
				});

				if (!prResponse.ok) {
					const error = await prResponse.json();
					throw new Error(error.error || "Failed to create pull request");
				}

				const result = await prResponse.json();

				// Handle owner vs regular user success
				if (result.branch) {
					// Owner - direct commit
					setPRStatus({
						type: "success-owner",
						branch: result.branch,
					});
				} else {
					// Regular user - PR created
					setPRStatus({ type: "creating-pr" });
					await new Promise((resolve) => setTimeout(resolve, 500));
					setPRStatus({
						type: "success",
						prUrl: result.pullRequest.url,
						prNumber: result.pullRequest.number,
					});
				}
			} catch (error) {
				console.error("Submit error:", error);
				setPRStatus({
					type: "error",
					message:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				});
			}
		},
		[svgLogo],
	);

	const handleRetry = useCallback(() => {
		setPRStatus({ type: "idle" });
	}, []);

	const handleReset = useCallback(() => {
		setPRStatus({ type: "idle" });
	}, []);

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

	if (!session) {
		navigate({ to: "/login" });
		return null;
	}

	return (
		<div className="min-h-screen text-zinc-900 dark:text-zinc-100">
			<main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/contribute"
						className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Contribute
					</Link>
				</div>

				{/* Page Title */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold">Add New Company</h2>
					<p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
						Fill out the form below to add a new company. We'll create a pull
						request with your changes.
					</p>
				</div>

				{/* Form Container */}
				<div className="rounded-xl border-2 border-zinc-200 bg-white p-6 md:p-8 dark:border-zinc-700 dark:bg-zinc-900">
					{/* SVG Uploader */}
					<div className="mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
						<SVGUploader
							value={svgLogo}
							onChange={setSvgLogo}
							error={svgError}
						/>
					</div>

					{/* Company Form */}
					<CompanyForm
						onSubmit={handleSubmit}
						isSubmitting={prStatus.type !== "idle" && prStatus.type !== "error"}
					/>
				</div>
			</main>

			{/* PR Status Modal */}
			<PRStatus status={prStatus} onRetry={handleRetry} onReset={handleReset} />
		</div>
	);
}
