import { CheckCircle, XCircle, Loader2, ExternalLink, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type PRStatusState =
	| { type: "idle" }
	| { type: "forking" }
	| { type: "creating-branch" }
	| { type: "committing" }
	| { type: "creating-pr" }
	| { type: "success"; prUrl: string; prNumber: number }
	| { type: "error"; message: string };

interface PRStatusProps {
	status: PRStatusState;
	onRetry?: () => void;
	onReset?: () => void;
}

export function PRStatus({ status, onRetry, onReset }: PRStatusProps) {
	if (status.type === "idle") {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-md rounded-xl border-2 border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
				{/* Loading States */}
				{(status.type === "forking" ||
					status.type === "creating-branch" ||
					status.type === "committing" ||
					status.type === "creating-pr") && (
					<div className="text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
							<Loader2 className="h-8 w-8 animate-spin text-orange-600" />
						</div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							{status.type === "forking" && "Forking Repository..."}
							{status.type === "creating-branch" && "Creating Branch..."}
							{status.type === "committing" && "Committing Changes..."}
							{status.type === "creating-pr" && "Creating Pull Request..."}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{status.type === "forking" &&
								"Setting up your fork of the repository"}
							{status.type === "creating-branch" &&
								"Creating a new branch for your changes"}
							{status.type === "committing" &&
								"Adding your company data and logo"}
							{status.type === "creating-pr" &&
								"Opening a pull request with your contribution"}
						</p>

						{/* Progress Steps */}
						<div className="mt-6 space-y-2">
							<ProgressStep
								label="Fork repository"
								completed={
									status.type !== "forking"
								}
								active={status.type === "forking"}
							/>
							<ProgressStep
								label="Create branch"
								completed={
									status.type === "committing" || status.type === "creating-pr"
								}
								active={status.type === "creating-branch"}
							/>
							<ProgressStep
								label="Commit changes"
								completed={status.type === "creating-pr"}
								active={status.type === "committing"}
							/>
							<ProgressStep
								label="Create pull request"
								completed={false}
								active={status.type === "creating-pr"}
							/>
						</div>
					</div>
				)}

				{/* Success State */}
				{status.type === "success" && (
					<div className="text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							Pull Request Created!
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Your contribution has been submitted successfully. A maintainer
							will review your PR shortly.
						</p>

						<div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
							<div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
								<GitPullRequest className="h-5 w-5" />
								<span className="font-medium">PR #{status.prNumber}</span>
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-3">
							<a
								href={status.prUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
							>
								<ExternalLink className="h-4 w-4" />
								View Pull Request on GitHub
							</a>
							<Link
								to="/contribute"
								className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
							>
								Back to Contribute
							</Link>
						</div>
					</div>
				)}

				{/* Error State */}
				{status.type === "error" && (
					<div className="text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
							<XCircle className="h-8 w-8 text-red-600" />
						</div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							Something Went Wrong
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{status.message}
						</p>

						<div className="mt-6 flex flex-col gap-3">
							{onRetry && (
								<Button onClick={onRetry} className="w-full">
									Try Again
								</Button>
							)}
							{onReset && (
								<Button variant="outline" onClick={onReset} className="w-full">
									Go Back
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function ProgressStep({
	label,
	completed,
	active,
}: {
	label: string;
	completed: boolean;
	active: boolean;
}) {
	return (
		<div className="flex items-center gap-3">
			<div
				className={`flex h-6 w-6 items-center justify-center rounded-full ${
					completed
						? "bg-green-500 text-white"
						: active
							? "bg-orange-500 text-white"
							: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"
				}`}
			>
				{completed ? (
					<CheckCircle className="h-4 w-4" />
				) : active ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<span className="text-xs">•</span>
				)}
			</div>
			<span
				className={`text-sm ${
					completed
						? "text-green-600 dark:text-green-400"
						: active
							? "font-medium text-zinc-900 dark:text-zinc-100"
							: "text-zinc-500"
				}`}
			>
				{label}
			</span>
		</div>
	);
}

export type { PRStatusState };
