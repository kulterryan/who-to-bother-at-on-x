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
  const [activeTab, setActiveTab] = useState("form");

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
  const [jsonCode, setJsonCode] = useState("");
  const [jsonError, setJsonError] = useState<string | undefined>();

  // Sync JSON code when switching to code tab
  const handleTabChange = (value: string) => {
    if (value === "code") {
      setJsonCode(JSON.stringify(companyData, null, 2));
    }
    setActiveTab(value);
  };

  // Parse JSON from code editor
  const handleJsonChange = (value: string) => {
    setJsonCode(value);
    try {
      const parsed = JSON.parse(value) as Company;
      setCompanyData(parsed);
      setJsonError(undefined);
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  // Validate if form can be submitted
  const isFormValid = (): boolean => {
    // Check required basic fields
    if (
      !(
        companyData.id &&
        companyData.name &&
        companyData.description &&
        companyData.logoType
      )
    ) {
      return false;
    }

    // Check ID format (lowercase, letters, numbers, hyphens only)
    if (!/^[a-z0-9-]+$/.test(companyData.id)) {
      return false;
    }

    // Check SVG logo
    if (!svgLogo) {
      return false;
    }

    // Check at least one category with name
    const hasValidCategory = companyData.categories.some(
      (cat) => cat.name.trim() !== ""
    );
    if (!hasValidCategory) {
      return false;
    }

    // Check at least one contact with product and valid handle
    const hasValidContact = companyData.categories.some((cat) =>
      cat.contacts.some(
        (contact) =>
          contact.product.trim() !== "" &&
          contact.handles.some((h) => h.startsWith("@") && h.length > 1)
      )
    );
    if (!hasValidContact) {
      return false;
    }

    return true;
  };

  const canSubmit = isFormValid();
  const isSubmitting = prStatus.type !== "idle" && prStatus.type !== "error";

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
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            to="/contribute"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contribute
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="font-bold text-3xl">Add New Company</h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
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
            <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 md:p-8 dark:border-zinc-700 dark:bg-zinc-900">
              {/* SVG Uploader */}
              <div className="mb-8 border-zinc-200 border-b pb-8 dark:border-zinc-700">
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
              <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-4 font-semibold text-lg">
                  Homepage Card Preview
                </h3>
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  This is how your company will appear on the homepage.
                </p>

                {/* Company Card Preview */}
                <div className="max-w-md">
                  <div className="group flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600">
                    {svgLogo && (
                      <div
                        className="mb-4 h-8 w-auto [&>svg]:h-8 [&>svg]:w-auto"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
                        dangerouslySetInnerHTML={{ __html: svgLogo }}
                      />
                    )}
                    <h2 className="mb-2 font-semibold text-2xl text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
                      {companyData.name || "Company Name"}
                    </h2>
                    <p className="line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {companyData.description || "Company description..."}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 font-medium text-orange-600 text-sm">
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
              </div>

              {/* Full Company Page Preview */}
              <div className="overflow-hidden rounded-xl border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                <div className="border-zinc-200 border-b bg-zinc-50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
                  <h3 className="font-semibold text-lg">
                    Company Page Preview
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    This is how your company's contact page will look.
                  </p>
                </div>

                {/* Simulated Company Page */}
                <div className="p-6">
                  <div className="text-zinc-900 dark:text-zinc-100">
                    {/* Back link simulation */}
                    <div className="mb-8 inline-flex items-center gap-2 font-medium text-sm text-zinc-600 dark:text-zinc-400">
                      <ArrowLeft className="h-4 w-4" />
                      Back to home
                    </div>

                    {/* Company header */}
                    <h1 className="mb-6 flex items-center gap-2 text-balance font-medium text-2xl text-zinc-900 md:text-3xl dark:text-zinc-100">
                      who to bother at{" "}
                      {svgLogo ? (
                        <span
                          className="inline-flex items-center [&>svg]:h-6 [&>svg]:w-auto md:[&>svg]:h-8"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
                          dangerouslySetInnerHTML={{ __html: svgLogo }}
                        />
                      ) : (
                        <span className="text-orange-600">
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
                    {(companyData.website ||
                      companyData.docs ||
                      companyData.github ||
                      companyData.discord) && (
                      <div className="mb-8 flex flex-wrap items-center gap-4">
                        {companyData.website && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                            <Globe className="h-4 w-4" />
                            <span>Website</span>
                          </span>
                        )}
                        {companyData.docs && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                            <BookOpen className="h-4 w-4" />
                            <span>Docs</span>
                          </span>
                        )}
                        {companyData.github && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                            <GithubIcon className="h-4 w-4" />
                            <span>GitHub</span>
                          </span>
                        )}
                        {companyData.discord && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                            <MessageCircle className="h-4 w-4" />
                            <span>Discord</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-500">
                      This is a community-maintained list and not officially
                      affiliated with {companyData.name || "this company"}. For
                      official support, visit the official{" "}
                      {companyData.name || "company"} website.
                    </p>

                    {/* Copy hint */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Copy className="h-4 w-4" />
                      <span>Click any topic to copy all contacts</span>
                    </div>

                    {/* Search bar simulation */}
                    <div className="mb-8">
                      <input
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
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
                            <h2 className="mb-4 font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                              {category.name}
                            </h2>
                            <div className="space-y-px">
                              {category.contacts
                                .filter((c) => c.product)
                                .map((contact) => (
                                  <div
                                    className="flex items-start justify-between border-zinc-200 border-t py-4 first:border-t-0 dark:border-zinc-800"
                                    key={contact.product}
                                  >
                                    <div className="flex-1">
                                      <span className="font-medium text-sm text-zinc-900 md:text-base dark:text-zinc-100">
                                        {contact.product}
                                      </span>
                                    </div>
                                    <div className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                                      {contact.handles
                                        .filter((h) => h.startsWith("@"))
                                        .map((handle) => (
                                          <span
                                            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 md:text-base dark:text-zinc-400"
                                            key={handle}
                                          >
                                            <Avatar className="h-5 w-5 shrink-0">
                                              <AvatarImage
                                                alt={handle}
                                                src={`https://unavatar.io/x/${handle.replace("@", "")}?fallback=https://avatar.vercel.sh/${handle.replace("@", "")}?size=400`}
                                              />
                                              <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                {handle
                                                  .slice(1, 3)
                                                  .toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="leading-none">
                                              {handle}
                                            </span>
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}

                      {/* Empty state */}
                      {!companyData.categories.some(
                        (cat) => cat.name && cat.contacts.some((c) => c.product)
                      ) && (
                        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                          <p>
                            Add categories and contacts in the Form tab to see
                            them here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          <TabsContent value="code">
            <div className="space-y-6">
              {/* SVG Code Editor */}
              <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold text-lg">SVG Logo</h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Paste or edit your SVG logo code directly.
                </p>
                <textarea
                  className="h-48 w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  onChange={(e) => setSvgLogo(e.target.value)}
                  placeholder="<svg>...</svg>"
                  spellCheck={false}
                  value={svgLogo}
                />
                {svgLogo && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Preview:
                    </p>
                    <div
                      className="inline-block rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800 [&>svg]:h-8 [&>svg]:w-auto"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated on upload
                      dangerouslySetInnerHTML={{ __html: svgLogo }}
                    />
                  </div>
                )}
              </div>

              {/* JSON Code Editor */}
              <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold text-lg">Company JSON</h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Edit the company data directly in JSON format.
                </p>
                <textarea
                  className={`h-96 w-full rounded-lg border-2 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 ${
                    jsonError
                      ? "border-red-500 focus:border-red-500"
                      : "border-zinc-200 focus:border-orange-600 dark:border-zinc-700"
                  }`}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder='{"id": "company-id", "name": "Company Name", ...}'
                  spellCheck={false}
                  value={jsonCode}
                />
                {jsonError && (
                  <p className="mt-2 text-red-600 text-sm">{jsonError}</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button - visible on all tabs */}
        <div className="mt-8 flex flex-col gap-4 border-zinc-200 border-t pt-6 dark:border-zinc-700">
          {!(canSubmit || isSubmitting) && (
            <p className="text-right text-sm text-zinc-500 dark:text-zinc-400">
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
