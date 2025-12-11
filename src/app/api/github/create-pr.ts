import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import {
  branchExists,
  createBranch,
  createOrUpdateFile,
  createPullRequest,
  forkRepository,
  GITHUB_CONFIG,
  generateBranchName,
  generatePRContent,
  getBranchSha,
  getFileContent,
  getGitHubUser,
  getTestModeConfig,
  getUserFork,
  injectLogoIntoTsx,
} from "@/lib/github";
import type { Company } from "@/types/company";

type CreatePRRequest = {
  company: Company;
  svgLogo: string;
  isEdit: boolean;
};

export const Route = createFileRoute("/api/github/create-pr")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log("[create-pr] Starting PR creation request");

        // Check for test mode via environment variable
        const testMode = getTestModeConfig();

        if (testMode?.enabled) {
          console.log(
            "[create-pr] 🧪 TEST MODE ENABLED (GITHUB_TEST_MODE=true) - No actual GitHub API calls will be made"
          );
        }

        // Parse request body
        let body: CreatePRRequest;
        try {
          console.log("[create-pr] Parsing request body");
          body = await request.json();
          console.log("[create-pr] Request body parsed:", {
            companyId: body.company?.id,
            isEdit: body.isEdit,
            hasSvg: Boolean(body.svgLogo),
          });
        } catch (parseError) {
          console.error("[create-pr] Body parse error:", parseError);
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { company, svgLogo, isEdit } = body;

        // Get the session (skip in test mode)
        let accessToken = "test-token";
        if (testMode?.enabled) {
          console.log("[create-pr] 🧪 Skipping authentication in test mode");
        } else {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          console.log(
            "[create-pr] Session check:",
            session ? "authenticated" : "not authenticated"
          );

          if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Get the GitHub access token using getAccessToken API
          try {
            console.log("[create-pr] Fetching GitHub access token");
            const tokenResponse = await auth.api.getAccessToken({
              body: {
                providerId: "github",
              },
              headers: request.headers,
            });

            if (!tokenResponse?.accessToken) {
              console.error(
                "[create-pr] No access token in response:",
                tokenResponse
              );
              throw new Error("No access token returned");
            }

            accessToken = tokenResponse.accessToken;
            console.log("[create-pr] Access token retrieved successfully");
          } catch (tokenError) {
            console.error("[create-pr] Token fetch error:", tokenError);
            return new Response(
              JSON.stringify({
                error:
                  "GitHub access token not found. Please re-authenticate with GitHub.",
              }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }

        if (!(company?.id && company.name)) {
          return new Response(
            JSON.stringify({ error: "Company data is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (!svgLogo) {
          return new Response(
            JSON.stringify({ error: "SVG logo is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          // Step 1: Get user info
          console.log("[create-pr] Step 1: Fetching GitHub user info");
          const user = await getGitHubUser(accessToken, testMode);
          console.log("[create-pr] GitHub user:", user.login);

          // Step 2: Check if user is the repo owner (can't fork own repo)
          // In test mode, we always simulate as non-owner to test the full flow
          const isOwner = testMode?.enabled
            ? false
            : user.login.toLowerCase() === GITHUB_CONFIG.owner.toLowerCase();
          console.log("[create-pr] Step 2: Is owner?", isOwner);

          // If not owner, verify fork exists with retries
          if (!isOwner) {
            console.log("[create-pr] Checking for user fork");
            let fork = await getUserFork(accessToken, user.login, testMode);
            if (!fork) {
              if (testMode?.enabled) {
                // In test mode, auto-create a fork
                console.log("[create-pr] 🧪 Test mode: Auto-creating fork");
                fork = await forkRepository(accessToken, testMode, user.login);
              } else {
                console.log("[create-pr] Fork not found, retrying...");
                // Retry a few times with short delays
                for (let i = 0; i < 3 && !fork; i++) {
                  console.log(`[create-pr] Fork retry attempt ${i + 1}/3`);
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                  fork = await getUserFork(accessToken, user.login, testMode);
                }
              }
            }
            if (!fork) {
              console.error("[create-pr] Fork not found after retries");
              throw new Error(
                "Fork not found. Please try again - the fork may still be initializing."
              );
            }
            console.log("[create-pr] Fork found:", fork.full_name);
          }

          // Determine which repo to work on (fork or main repo if owner)
          const workingRepo = isOwner ? GITHUB_CONFIG.owner : user.login;
          console.log("[create-pr] Working repo:", workingRepo);

          // Step 3: Get base SHA and generate branch name
          console.log(
            "[create-pr] Step 3: Getting base SHA and generating branch name"
          );
          const branchName = generateBranchName(company.id, isEdit, user.login);
          console.log("[create-pr] Branch name:", branchName);
          const baseSha = await getBranchSha(
            accessToken,
            workingRepo,
            GITHUB_CONFIG.defaultBranch,
            testMode
          );
          console.log("[create-pr] Base SHA:", baseSha);

          // Step 4: Create a new branch
          console.log("[create-pr] Step 4: Checking/creating branch");
          const exists = await branchExists(
            accessToken,
            workingRepo,
            branchName,
            testMode
          );
          console.log("[create-pr] Branch exists?", exists);
          if (!exists) {
            console.log("[create-pr] Creating new branch");
            await createBranch(
              accessToken,
              workingRepo,
              branchName,
              baseSha,
              testMode
            );
            console.log("[create-pr] Branch created successfully");
          }

          // Step 5: Fetch both files in parallel
          console.log("[create-pr] Step 5: Fetching existing files");
          const companyPath = `src/data/companies/${company.id}.json`;
          const logosPath = "src/components/company-logos.tsx";
          console.log("[create-pr] Company path:", companyPath);
          console.log("[create-pr] Logos path:", logosPath);

          const [existingCompanyFile, existingLogosFile] = await Promise.all([
            isEdit
              ? getFileContent(
                  accessToken,
                  workingRepo,
                  companyPath,
                  branchName,
                  testMode
                )
              : Promise.resolve(null),
            getFileContent(
              accessToken,
              workingRepo,
              logosPath,
              branchName,
              testMode
            ),
          ]);
          console.log(
            "[create-pr] Existing company file:",
            existingCompanyFile ? "found" : "not found"
          );
          console.log(
            "[create-pr] Existing logos file:",
            existingLogosFile ? "found" : "not found"
          );

          // Step 6: Create/update both files in parallel
          console.log("[create-pr] Step 6: Preparing file contents");
          const companyJson = JSON.stringify(
            {
              $schema: "./schema.json",
              ...company,
            },
            null,
            2
          );

          // Get logos file content (from branch or default)
          let logosFileContent: string;
          let logosFileSha: string | undefined;

          if (existingLogosFile) {
            logosFileContent = existingLogosFile.content;
            logosFileSha = existingLogosFile.sha;
            console.log("[create-pr] Using logos file from branch");
          } else {
            // Try to get from default branch
            console.log("[create-pr] Fetching logos file from default branch");
            const defaultLogosFile = await getFileContent(
              accessToken,
              workingRepo,
              logosPath,
              GITHUB_CONFIG.defaultBranch,
              testMode
            );

            if (defaultLogosFile) {
              logosFileContent = defaultLogosFile.content;
              logosFileSha = undefined;
              console.log("[create-pr] Using logos file from default branch");
            } else {
              // In test mode, provide a mock logos file content
              if (testMode?.enabled) {
                console.log(
                  "[create-pr] 🧪 Test mode: Using mock logos file content"
                );
                logosFileContent = `export const companyLogos: Record<string, JSX.Element> = {
	example: (
		<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="15" cy="15" r="14" fill="currentColor"/>
		</svg>
	),
};
`;
                logosFileSha = undefined;
              } else {
                console.error(
                  "[create-pr] Could not find company-logos.tsx file"
                );
                throw new Error("Could not find company-logos.tsx file");
              }
            }
          }

          // Inject the logo
          console.log("[create-pr] Injecting logo into TSX");
          const updatedLogosContent = injectLogoIntoTsx(
            logosFileContent,
            company.logoType || company.id,
            svgLogo
          );
          console.log("[create-pr] Logo injected successfully");

          // Commit both files - must be sequential due to Git's atomic commits
          console.log("[create-pr] Committing company JSON file");
          await createOrUpdateFile(
            accessToken,
            workingRepo,
            companyPath,
            companyJson,
            isEdit
              ? `chore: update ${company.name} company data`
              : `feat: add ${company.name} company data`,
            branchName,
            existingCompanyFile?.sha,
            testMode
          );
          console.log("[create-pr] Company JSON committed successfully");

          console.log("[create-pr] Committing logos file");
          await createOrUpdateFile(
            accessToken,
            workingRepo,
            logosPath,
            updatedLogosContent,
            isEdit
              ? `chore: update ${company.name} logo`
              : `feat: add ${company.name} logo`,
            branchName,
            logosFileSha,
            testMode
          );
          console.log("[create-pr] Logos file committed successfully");

          // Step 7: Create the pull request (only if not owner)
          // If owner, we just created a branch with commits - no PR needed
          console.log("[create-pr] Step 7: Creating pull request");
          if (isOwner) {
            console.log("[create-pr] User is owner, skipping PR creation");
            return new Response(
              JSON.stringify({
                success: true,
                message: "Changes committed directly to branch",
                branch: branchName,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const { title, body: prBody } = generatePRContent(
            company.id,
            company.name,
            isEdit
          );
          console.log("[create-pr] PR title:", title);

          console.log("[create-pr] Creating pull request to upstream");
          const pullRequest = await createPullRequest(
            accessToken,
            user.login,
            branchName,
            title,
            prBody,
            testMode
          );
          console.log(
            "[create-pr] Pull request created successfully:",
            pullRequest.html_url
          );

          return new Response(
            JSON.stringify({
              success: true,
              testMode: testMode?.enabled ?? false,
              pullRequest: {
                number: pullRequest.number,
                url: pullRequest.html_url,
                title: pullRequest.title,
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("[create-pr] Error occurred:", error);
          console.error(
            "[create-pr] Error stack:",
            error instanceof Error ? error.stack : "No stack trace"
          );
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to create pull request",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
