import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PRStatusState =
  | { type: "idle" }
  | { type: "forking"; alreadyExists?: boolean }
  | { type: "creating-branch" }
  | { type: "committing" }
  | { type: "creating-pr" }
  | { type: "success"; prUrl: string; prNumber: number }
  | { type: "success-owner"; branch: string }
  | { type: "error"; message: string };

type PRStatusProps = {
  status: PRStatusState;
  onRetry?: () => void;
  onReset?: () => void;
};

// Helper function to get loading title
function getLoadingTitle(status: PRStatusState): string {
  if (status.type === "forking") {
    return status.alreadyExists ? "Syncing Fork..." : "Forking Repository...";
  }
  if (status.type === "creating-branch") {
    return "Creating Branch...";
  }
  if (status.type === "committing") {
    return "Committing Changes...";
  }
  if (status.type === "creating-pr") {
    return "Creating Pull Request...";
  }
  return "";
}

// Helper function to get loading description
function getLoadingDescription(status: PRStatusState): string {
  if (status.type === "forking") {
    return status.alreadyExists
      ? "Syncing your existing fork with the latest changes"
      : "Setting up your fork of the repository";
  }
  if (status.type === "creating-branch") {
    return "Creating a new branch for your changes";
  }
  if (status.type === "committing") {
    return "Adding your company data and logo";
  }
  if (status.type === "creating-pr") {
    return "Opening a pull request with your contribution";
  }
  return "";
}

// Helper function to check if status is loading
function isLoadingStatus(status: PRStatusState): boolean {
  return (
    status.type === "forking" ||
    status.type === "creating-branch" ||
    status.type === "committing" ||
    status.type === "creating-pr"
  );
}

export function PRStatus({ status, onRetry, onReset }: PRStatusProps) {
  if (status.type === "idle") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border-2 border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Loading States */}
        {isLoadingStatus(status) && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              {getLoadingTitle(status)}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {getLoadingDescription(status)}
            </p>

            {/* Progress Steps */}
            <div className="mt-6 space-y-2">
              <ProgressStep
                active={status.type === "forking"}
                completed={status.type !== "forking"}
                label={
                  status.type === "forking" && status.alreadyExists
                    ? "Sync fork"
                    : "Fork repository"
                }
              />
              <ProgressStep
                active={status.type === "creating-branch"}
                completed={
                  status.type === "committing" || status.type === "creating-pr"
                }
                label="Create branch"
              />
              <ProgressStep
                active={status.type === "committing"}
                completed={status.type === "creating-pr"}
                label="Commit changes"
              />
              <ProgressStep
                active={status.type === "creating-pr"}
                completed={false}
                label="Create pull request"
              />
            </div>
          </div>
        )}

        {/* Success State - PR Created */}
        {status.type === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                href={status.prUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                View Pull Request on GitHub
              </a>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                to="/contribute"
              >
                Back to Contribute
              </Link>
            </div>
          </div>
        )}

        {/* Success State - Owner Direct Commit */}
        {status.type === "success-owner" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Changes Committed!
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your changes have been committed directly to the repository.
            </p>

            <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                <GitBranch className="h-5 w-5" />
                <span className="font-medium font-mono text-sm">
                  {status.branch}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                href={`https://github.com/kulterryan/cf-who-to-bother-at-on-x/tree/${status.branch}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                View Branch on GitHub
              </a>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                to="/contribute"
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
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Something Went Wrong
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {status.message}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {onRetry ? (
                <Button className="w-full" onClick={onRetry}>
                  Try Again
                </Button>
              ) : null}
              {onReset ? (
                <Button className="w-full" onClick={onReset} variant="outline">
                  Go Back
                </Button>
              ) : null}
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
  // Helper function to get step circle className
  const getCircleClassName = () => {
    if (completed) {
      return "bg-green-500 text-white";
    }
    if (active) {
      return "bg-orange-500 text-white";
    }
    return "bg-zinc-200 text-zinc-500 dark:bg-zinc-700";
  };

  // Helper function to get step label className
  const getLabelClassName = () => {
    if (completed) {
      return "text-green-600 dark:text-green-400";
    }
    if (active) {
      return "font-medium text-zinc-900 dark:text-zinc-100";
    }
    return "text-zinc-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${getCircleClassName()}`}
      >
        {completed ? <CheckCircle className="h-4 w-4" /> : null}
        {!completed && active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {completed || active ? null : <span className="text-xs">•</span>}
      </div>
      <span className={`text-sm ${getLabelClassName()}`}>{label}</span>
    </div>
  );
}

export type { PRStatusState };
