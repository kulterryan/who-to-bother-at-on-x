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

// Import all company data at build time
const companyModules = import.meta.glob<{ default: Company }>(
  "../../data/companies/*.json",
  {
    eager: true,
  }
);

// Build company map
const companies: Map<string, Company> = new Map();
for (const [path, module] of Object.entries(companyModules)) {
  if (path.includes("template") || path.includes("schema")) {
    continue;
  }
  const company = module.default;
  if (company?.id) {
    companies.set(company.id, company);
  }
}

export const Route = createFileRoute("/contribute/edit/$company")({
  loader: async ({ params }) => {
    const company = companies.get(params.company);

    if (!company) {
      throw new Error("Company not found");
    }

    return { company };
  },
  head: ({ loaderData }) => ({
    meta: [
      ...seo({
        title: `Edit ${loaderData?.company?.name || "Company"} | who to bother on X`,
        description: `Update information for ${loaderData?.company?.name || "this company"}.`,
        keywords: "edit company, update, contribute",
        url: `https://who-to-bother-at.com/contribute/edit/${loaderData?.company?.id}`,
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
  component: EditCompanyPage,
  errorComponent: EditCompanyError,
});

function EditCompanyError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            to="/contribute/edit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Company List
          </Link>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
          <h2 className="font-semibold text-red-700 text-xl dark:text-red-400">
            Company Not Found
          </h2>
          <p className="mt-2 text-red-600 dark:text-red-500">
            {error.message || "The company you're looking for doesn't exist."}
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            to="/contribute/edit"
          >
            Browse Companies
          </Link>
        </div>
      </main>
    </div>
  );
}

function EditCompanyPage() {
  const { company: initialCompany } = Route.useLoaderData();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [svgLogo, setSvgLogo] = useState("");
  const [svgError, setSvgError] = useState<string | undefined>();
  const [prStatus, setPRStatus] = useState<PRStatusState>({ type: "idle" });

  const handleSubmit = useCallback(
    async (company: Company) => {
      // Validate SVG
      if (!svgLogo) {
        setSvgError(
          "Please upload an SVG logo (even if unchanged, re-upload the existing logo)"
        );
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
            isEdit: true,
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
    [svgLogo]
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
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
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
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            to="/contribute/edit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Company List
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="font-bold text-3xl">Edit {initialCompany.name}</h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Update the company information below. We'll create a pull request
            with your changes.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <p className="text-blue-700 text-sm dark:text-blue-400">
            <strong>Note:</strong> You'll need to upload the company logo again,
            even if you're not changing it. This ensures the logo is properly
            included in your pull request.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 md:p-8 dark:border-zinc-700 dark:bg-zinc-900">
          {/* SVG Uploader */}
          <div className="mb-8 border-zinc-200 border-b pb-8 dark:border-zinc-700">
            <SVGUploader
              companyName={initialCompany.name}
              error={svgError}
              onChange={setSvgLogo}
              value={svgLogo}
            />
          </div>

          {/* Company Form */}
          <CompanyForm
            initialData={initialCompany}
            isEdit
            isSubmitting={prStatus.type !== "idle" && prStatus.type !== "error"}
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      {/* PR Status Modal */}
      <PRStatus onReset={handleReset} onRetry={handleRetry} status={prStatus} />
    </div>
  );
}
