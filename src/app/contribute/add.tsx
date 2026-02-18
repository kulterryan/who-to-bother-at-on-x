import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Code,
  Copy,
  Eye,
  FormInput,
  GithubIcon,
  Globe,
  MessageCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { CompanyForm } from "@/components/contribute/company-form";
import {
  PRStatus,
  type PRStatusState,
} from "@/components/contribute/pr-status";
import { SVGUploader } from "@/components/contribute/svg-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";
import type { Company } from "@/types/company";

// Regex pattern for company ID validation (top-level for performance)
const COMPANY_ID_PATTERN = /^[a-z0-9-]+$/;

// Custom hook for form validation
function useCompanyFormValidation(
  companyData: Company,
  svgLogo: string
): { canSubmit: boolean } {
  const hasBasicFields = (): boolean =>
    !!(
      companyData.id &&
      companyData.name &&
      companyData.description &&
      companyData.logoType
    );

  const hasValidIdFormat = (): boolean =>
    COMPANY_ID_PATTERN.test(companyData.id);

  const hasValidCategory = (): boolean =>
    companyData.categories.some((cat) => cat.name.trim() !== "");

  const hasValidContact = (): boolean =>
    companyData.categories.some((cat) =>
      cat.contacts.some(
        (contact) =>
          contact.product.trim() !== "" &&
          contact.handles.some((h) => h.startsWith("@") && h.length > 1)
      )
    );

  const isFormValid = (): boolean => {
    if (!hasBasicFields()) {
      return false;
    }
    if (!hasValidIdFormat()) {
      return false;
    }
    if (!svgLogo) {
      return false;
    }
    if (!hasValidCategory()) {
      return false;
    }
    if (!hasValidContact()) {
      return false;
    }
    return true;
  };

  return { canSubmit: isFormValid() };
}

// Custom hook for PR creation
function usePRCreation(svgLogo: string) {
  const [prStatus, setPRStatus] = useState<PRStatusState>({ type: "idle" });
  const [svgError, setSvgError] = useState<string | undefined>();

  const handleForkProcess = useCallback(
    async (setStatus: (status: PRStatusState) => void): Promise<void> => {
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
        setStatus({ type: "creating-branch" });
      } else if (forkResult.fork?.alreadyExisted) {
        setStatus({ type: "forking", alreadyExists: true });
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStatus({ type: "creating-branch" });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus({ type: "creating-branch" });
      }
    },
    []
  );

  const createPullRequest = useCallback(
    async (
      company: Company,
      logoSvg: string,
      isEdit: boolean
    ): Promise<{
      branch?: string;
      pullRequest?: { url: string; number: number };
    }> => {
      const prResponse = await fetch("/api/github/create-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          svgLogo: logoSvg,
          isEdit,
        }),
      });

      if (!prResponse.ok) {
        const error = await prResponse.json();
        throw new Error(error.error || "Failed to create pull request");
      }

      return prResponse.json();
    },
    []
  );

  const handlePRResult = useCallback(
    async (
      result: {
        branch?: string;
        pullRequest?: { url: string; number: number };
      },
      statusSetter: (status: PRStatusState) => void
    ): Promise<void> => {
      if (result.branch) {
        statusSetter({
          type: "success-owner",
          branch: result.branch,
        });
      } else if (result.pullRequest) {
        statusSetter({ type: "creating-pr" });
        await new Promise((resolve) => setTimeout(resolve, 500));
        statusSetter({
          type: "success",
          prUrl: result.pullRequest.url,
          prNumber: result.pullRequest.number,
        });
      }
    },
    []
  );

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
        await handleForkProcess(setPRStatus);
        setPRStatus({ type: "committing" });
        const result = await createPullRequest(company, svgLogo, false);
        await handlePRResult(result, setPRStatus);
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
    [svgLogo, handleForkProcess, createPullRequest, handlePRResult]
  );

  const handleRetry = useCallback(() => {
    setPRStatus({ type: "idle" });
  }, []);

  const handleReset = useCallback(() => {
    setPRStatus({ type: "idle" });
  }, []);

  return {
    prStatus,
    svgError,
    handleSubmit,
    handleRetry,
    handleReset,
    isSubmitting: prStatus.type !== "idle" && prStatus.type !== "error",
  };
}

// Custom hook for tab management
function useTabManagement(
  companyData: Company,
  setCompanyData: (data: Company) => void
) {
  const [activeTab, setActiveTab] = useState("form");
  const [jsonCode, setJsonCode] = useState("");
  const [jsonError, setJsonError] = useState<string | undefined>();

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "code") {
        setJsonCode(JSON.stringify(companyData, null, 2));
      }
      setActiveTab(value);
    },
    [companyData]
  );

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonCode(value);
      try {
        const parsed = JSON.parse(value) as Company;
        setCompanyData(parsed);
        setJsonError(undefined);
      } catch {
        setJsonError("Invalid JSON format");
      }
    },
    [setCompanyData]
  );

  return {
    activeTab,
    jsonCode,
    jsonError,
    handleTabChange,
    handleJsonChange,
  };
}

// Preview components to reduce complexity
function CompanyCardPreview({
  companyData,
  svgLogo,
}: {
  companyData: Company;
  svgLogo: string;
}) {
  return (
    <div className="max-w-md">
      <div className="group flex flex-col rounded-2xl bg-secondary/60 p-6 transition-all duration-200 hover:bg-secondary">
        {svgLogo ? (
          <div
            className="mb-4 h-8 w-auto [&>svg]:h-8 [&>svg]:w-auto"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
            dangerouslySetInnerHTML={{ __html: svgLogo }}
          />
        ) : null}
        <h2 className="mb-2 font-semibold text-2xl text-foreground transition-colors duration-200 group-hover:text-accent">
          {companyData.name || "Company Name"}
        </h2>
        <p className="line-clamp-3 flex-1 text-muted-foreground text-sm">
          {companyData.description || "Company description..."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 font-medium text-accent text-sm">
          View contacts
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Arrow right</title>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CompanyPagePreview({
  companyData,
  svgLogo,
}: {
  companyData: Company;
  svgLogo: string;
}) {
  return (
    <div className="p-6">
      <div className="text-foreground">
        {/* Back link simulation */}
        <div className="mb-8 inline-flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </div>

        {/* Company header */}
        <h1 className="mb-6 flex items-center gap-2 text-balance font-medium text-2xl text-foreground md:text-3xl">
          who to bother at{" "}
          {svgLogo ? (
            <span
              className="inline-flex items-center [&>svg]:h-6 [&>svg]:w-auto md:[&>svg]:h-8"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
              dangerouslySetInnerHTML={{ __html: svgLogo }}
            />
          ) : (
            <span className="text-accent">
              {companyData.name || "Company"}
            </span>
          )}{" "}
          on{" "}
          <svg
            aria-hidden="true"
            fill="none"
            height="30"
            viewBox="0 0 1200 1227"
            width="33"
          >
            <title>X (Twitter) logo</title>
            <path
              d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
              fill="currentColor"
            />
          </svg>
        </h1>

        {/* Links row */}
        {companyData.website ||
        companyData.docs ||
        companyData.github ||
        companyData.discord ? (
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {companyData.website ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </span>
            ) : null}
            {companyData.docs ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </span>
            ) : null}
            {companyData.github ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <GithubIcon className="h-4 w-4" />
                <span>GitHub</span>
              </span>
            ) : null}
            {companyData.discord ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>Discord</span>
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Disclaimer */}
        <p className="mb-8 text-muted-foreground text-sm">
          This is a community-maintained list and not officially affiliated with{" "}
          {companyData.name || "this company"}. For official support, visit the
          official {companyData.name || "company"} website.
        </p>

        {/* Copy hint */}
        <div className="mb-6 flex items-center gap-2 text-muted-foreground/60 text-sm">
          <Copy className="h-4 w-4" />
          <span>Click any topic to copy all contacts</span>
        </div>

        {/* Search bar simulation */}
        <div className="mb-8">
          <input
            className="w-full rounded-lg bg-secondary px-4 py-3 text-foreground text-sm placeholder-muted-foreground"
            disabled
            placeholder="search products or topics"
            type="text"
          />
        </div>

        {/* Contacts list */}
        <div className="space-y-12">
          {companyData.categories
            .filter((cat) => cat.name)
            .map((category) => (
              <div key={category.name}>
                <h2 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {category.name}
                </h2>
                <div className="space-y-px">
                  {category.contacts
                    .filter((c) => c.product)
                    .map((contact) => (
                      <div
                        className="flex items-start justify-between border-border/40 border-t py-4 first:border-t-0"
                        key={contact.product}
                      >
                        <div className="flex-1">
                            <span className="font-medium text-foreground text-sm md:text-base">
                            {contact.product}
                          </span>
                        </div>
                        <div className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                          {contact.handles
                            .filter((h) => h.startsWith("@"))
                            .map((handle) => (
                              <span
                                className="inline-flex items-center gap-1.5 text-muted-foreground text-sm md:text-base"
                                key={handle}
                              >
                                <Avatar className="h-5 w-5 shrink-0">
                                  <AvatarImage
                                    alt={handle}
                                    src={`https://unavatar.io/x/${handle.replace("@", "")}?fallback=https://avatar.vercel.sh/${handle.replace("@", "")}?size=400`}
                                  />
                                  <AvatarFallback className="bg-secondary text-[10px] text-muted-foreground">
                                    {handle.slice(1, 3).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="leading-none">{handle}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

          {/* Empty state */}
          {companyData.categories.some(
            (cat) =>
              Boolean(cat.name) && cat.contacts.some((c) => Boolean(c.product))
          ) ? null : (
            <div className="py-12 text-center text-muted-foreground">
              <p>
                Add categories and contacts in the Form tab to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  // State for live preview and code editor
  const [companyData, setCompanyData] = useState<Company>({
    id: "",
    name: "",
    description: "",
    logoType: "",
    categories: [
      {
        name: "",
        contacts: [{ product: "", handles: [""] }],
      },
    ],
  });

  const { canSubmit } = useCompanyFormValidation(companyData, svgLogo);
  const {
    prStatus,
    svgError,
    handleSubmit,
    handleRetry,
    handleReset,
    isSubmitting,
  } = usePRCreation(svgLogo);
  const { activeTab, jsonCode, jsonError, handleTabChange, handleJsonChange } =
    useTabManagement(companyData, setCompanyData);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Loading</title>
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
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
            to="/contribute"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contribute
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8 animate-slide-up">
          <h2 className="font-bold text-3xl text-foreground">Add New Company</h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Fill out the form below to add a new company. We'll create a pull
            request with your changes.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          className="w-full"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger className="gap-2" value="form">
              <FormInput className="h-4 w-4" />
              Form
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="preview">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="code">
              <Code className="h-4 w-4" />
              Code Editor
            </TabsTrigger>
          </TabsList>

          {/* Form Tab */}
          <TabsContent value="form">
            <div className="rounded-2xl bg-card p-6 md:p-8">
              {/* SVG Uploader */}
              <div className="mb-8 border-border/40 border-b pb-8">
                <SVGUploader
                  error={svgError}
                  onChange={setSvgLogo}
                  value={svgLogo}
                />
              </div>

              {/* Company Form */}
              <CompanyForm
                hideSubmitButton
                isSubmitting={
                  prStatus.type !== "idle" && prStatus.type !== "error"
                }
                onFormChange={setCompanyData}
                onSubmit={handleSubmit}
              />
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <div className="space-y-8">
              {/* Card Preview Section */}
              <div className="rounded-2xl bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground text-lg">
                  Homepage Card Preview
                </h3>
                <p className="mb-6 text-muted-foreground text-sm">
                  This is how your company will appear on the homepage.
                </p>

                {/* Company Card Preview */}
                <CompanyCardPreview
                  companyData={companyData}
                  svgLogo={svgLogo}
                />
              </div>

              {/* Full Company Page Preview */}
              <div className="overflow-hidden rounded-2xl bg-card">
                <div className="bg-secondary/60 px-6 py-4">
                  <h3 className="font-semibold text-foreground text-lg">
                    Company Page Preview
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    This is how your company's contact page will look.
                  </p>
                </div>

                {/* Simulated Company Page */}
                <CompanyPagePreview
                  companyData={companyData}
                  svgLogo={svgLogo}
                />
              </div>
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          <TabsContent value="code">
            <div className="space-y-6">
              {/* SVG Code Editor */}
              <div className="rounded-2xl bg-card p-6">
                <h3 className="mb-2 font-semibold text-foreground text-lg">SVG Logo</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Paste or edit your SVG logo code directly.
                </p>
                <textarea
                  className="h-48 w-full rounded-lg bg-secondary p-4 font-mono text-foreground text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  onChange={(e) => setSvgLogo(e.target.value)}
                  placeholder="<svg>...</svg>"
                  spellCheck={false}
                  value={svgLogo}
                />
                {svgLogo ? (
                  <div className="mt-4">
                    <p className="mb-2 text-muted-foreground text-sm">
                      Preview:
                    </p>
                    <div
                      className="inline-block rounded-lg bg-secondary p-4 [&>svg]:h-8 [&>svg]:w-auto"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
                      dangerouslySetInnerHTML={{ __html: svgLogo }}
                    />
                  </div>
                ) : null}
              </div>

              {/* JSON Code Editor */}
              <div className="rounded-2xl bg-card p-6">
                <h3 className="mb-2 font-semibold text-foreground text-lg">Company JSON</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Edit the company data directly in JSON format.
                </p>
                <textarea
                  className={`h-96 w-full rounded-lg bg-secondary p-4 font-mono text-foreground text-sm placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
                    jsonError
                      ? "ring-2 ring-red-500/50"
                      : "focus:ring-accent/30"
                  }`}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder='{"id": "company-id", "name": "Company Name", ...}'
                  spellCheck={false}
                  value={jsonCode}
                />
                {jsonError ? (
                  <p className="mt-2 text-red-600 text-sm">{jsonError}</p>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button - visible on all tabs */}
          <div className="mt-8 flex flex-col gap-4 border-border/40 border-t pt-6">
          {!(canSubmit || isSubmitting) && (
            <p className="text-right text-muted-foreground text-sm">
              Please fill in all required fields: company name, ID, description,
              logo, at least one category with a contact and valid @handle.
            </p>
          )}
          <div className="flex justify-end">
            <Button
              className="min-w-[180px]"
              disabled={!canSubmit || isSubmitting}
              onClick={() => handleSubmit(companyData)}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Loading</title>
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
                  Creating PR...
                </>
              ) : (
                "Submit & Create PR"
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* PR Status Modal */}
      <PRStatus onReset={handleReset} onRetry={handleRetry} status={prStatus} />
    </div>
  );
}
