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

// Helper function to get access token
async function getAccessToken(
  request: Request,
  testMode: ReturnType<typeof getTestModeConfig>
): Promise<string> {
  if (testMode?.enabled) {
    console.log("[create-pr] 🧪 Skipping authentication in test mode");
    return "test-token";
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const tokenResponse = await auth.api.getAccessToken({
    body: {
      providerId: "github",
    },
    headers: request.headers,
  });

  if (!tokenResponse?.accessToken) {
    throw new Error("No access token returned");
  }

  return tokenResponse.accessToken;
}

// Helper function to verify fork exists
async function verifyFork(
  accessToken: string,
  userLogin: string,
  testMode: ReturnType<typeof getTestModeConfig>
): Promise<void> {
  let fork = await getUserFork(accessToken, userLogin, testMode);
  if (!fork) {
    if (testMode?.enabled) {
      fork = await forkRepository(accessToken, testMode, userLogin);
    } else {
      for (let i = 0; i < 3 && !fork; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        fork = await getUserFork(accessToken, userLogin, testMode);
      }
    }
  }
  if (!fork) {
    throw new Error(
      "Fork not found. Please try again - the fork may still be initializing."
    );
  }
}

// Helper function to get logos file content
async function getLogosFileContent(params: {
  accessToken: string;
  workingRepo: string;
  logosPath: string;
  branchName: string;
  defaultBranch: string;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<{ content: string; sha: string | undefined }> {
  const existingLogosFile = await getFileContent({
    accessToken: params.accessToken,
    username: params.workingRepo,
    path: params.logosPath,
    branch: params.branchName,
    testMode: params.testMode,
  });

  if (existingLogosFile) {
    return {
      content: existingLogosFile.content,
      sha: existingLogosFile.sha,
    };
  }

  const defaultLogosFile = await getFileContent({
    accessToken: params.accessToken,
    username: params.workingRepo,
    path: params.logosPath,
    branch: params.defaultBranch,
    testMode: params.testMode,
  });

  if (defaultLogosFile) {
    return {
      content: defaultLogosFile.content,
      sha: undefined,
    };
  }

  if (params.testMode?.enabled) {
    return {
      content: `export const companyLogos: Record<string, JSX.Element> = {
	example: (
		<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="15" cy="15" r="14" fill="currentColor"/>
		</svg>
	),
};
`,
      sha: undefined,
    };
  }

  throw new Error("Could not find company-logos.tsx file");
}

// Helper function to parse and validate request body
async function parseRequest(request: Request): Promise<CreatePRRequest> {
  const body = await request.json();
  if (!(body.company?.id && body.company?.name)) {
    throw new Error("Company data is required");
  }
  if (!body.svgLogo) {
    throw new Error("SVG logo is required");
  }
  return body;
}

// Helper function to commit files
async function commitFiles(params: {
  accessToken: string;
  workingRepo: string;
  companyPath: string;
  logosPath: string;
  companyJson: string;
  updatedLogosContent: string;
  logosFileSha: string | undefined;
  existingCompanyFileSha: string | undefined;
  companyName: string;
  isEdit: boolean;
  branchName: string;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<void> {
  const {
    accessToken,
    workingRepo,
    companyPath,
    logosPath,
    companyJson,
    updatedLogosContent,
    logosFileSha,
    existingCompanyFileSha,
    companyName,
    isEdit,
    branchName,
    testMode,
  } = params;
  await createOrUpdateFile({
    accessToken,
    username: workingRepo,
    path: companyPath,
    content: companyJson,
    message: isEdit
      ? `chore: update ${companyName} company data`
      : `feat: add ${companyName} company data`,
    branch: branchName,
    existingSha: existingCompanyFileSha,
    testMode,
  });

  await createOrUpdateFile({
    accessToken,
    username: workingRepo,
    path: logosPath,
    content: updatedLogosContent,
    message: isEdit
      ? `chore: update ${companyName} logo`
      : `feat: add ${companyName} logo`,
    branch: branchName,
    existingSha: logosFileSha,
    testMode,
  });
}

// Helper function to create owner response
function createOwnerResponse(branchName: string): Response {
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

// Helper function to create PR response
function createPRResponse(
  pullRequest: Awaited<ReturnType<typeof createPullRequest>>,
  testMode: ReturnType<typeof getTestModeConfig>
): Response {
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
}

// Helper function to setup user and verify fork
async function setupUserAndFork(params: {
  accessToken: string;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<{
  user: Awaited<ReturnType<typeof getGitHubUser>>;
  isOwner: boolean;
  workingRepo: string;
}> {
  console.log("[create-pr] Step 1: Fetching GitHub user info");
  const user = await getGitHubUser(params.accessToken, params.testMode);
  console.log("[create-pr] GitHub user:", user.login);

  // Check if user is the repo owner (can't fork own repo)
  // In test mode, we always simulate as non-owner to test the full flow
  const isOwner = params.testMode?.enabled
    ? false
    : user.login.toLowerCase() === GITHUB_CONFIG.owner.toLowerCase();
  console.log("[create-pr] Step 2: Is owner?", isOwner);

  // If not owner, verify fork exists
  if (!isOwner) {
    await verifyFork(params.accessToken, user.login, params.testMode);
  }

  // Determine which repo to work on (fork or main repo if owner)
  const workingRepo = isOwner ? GITHUB_CONFIG.owner : user.login;
  console.log("[create-pr] Working repo:", workingRepo);

  return { user, isOwner, workingRepo };
}

// Helper function to setup branch
async function setupBranch(params: {
  accessToken: string;
  workingRepo: string;
  companyId: string;
  isEdit: boolean;
  userLogin: string;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<{ branchName: string; baseSha: string }> {
  console.log(
    "[create-pr] Step 3: Getting base SHA and generating branch name"
  );
  const branchName = generateBranchName(
    params.companyId,
    params.isEdit,
    params.userLogin
  );
  console.log("[create-pr] Branch name:", branchName);
  const baseSha = await getBranchSha(
    params.accessToken,
    params.workingRepo,
    GITHUB_CONFIG.defaultBranch,
    params.testMode
  );
  console.log("[create-pr] Base SHA:", baseSha);

  // Create a new branch
  console.log("[create-pr] Step 4: Checking/creating branch");
  const exists = await branchExists(
    params.accessToken,
    params.workingRepo,
    branchName,
    params.testMode
  );
  console.log("[create-pr] Branch exists?", exists);
  if (!exists) {
    console.log("[create-pr] Creating new branch");
    await createBranch({
      accessToken: params.accessToken,
      username: params.workingRepo,
      branchName,
      sha: baseSha,
      testMode: params.testMode,
    });
    console.log("[create-pr] Branch created successfully");
  }

  return { branchName, baseSha };
}

// Helper function to prepare files for commit
async function prepareFiles(params: {
  accessToken: string;
  workingRepo: string;
  company: Company;
  svgLogo: string;
  branchName: string;
  isEdit: boolean;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<{
  companyJson: string;
  updatedLogosContent: string;
  logosFileSha: string | undefined;
  existingCompanyFileSha: string | undefined;
}> {
  // Fetch both files in parallel
  console.log("[create-pr] Step 5: Fetching existing files");
  const companyPath = `src/data/companies/${params.company.id}.json`;
  const logosPath = "src/components/company-logos.tsx";
  console.log("[create-pr] Company path:", companyPath);
  console.log("[create-pr] Logos path:", logosPath);

  const [existingCompanyFile] = await Promise.all([
    params.isEdit
      ? getFileContent({
          accessToken: params.accessToken,
          username: params.workingRepo,
          path: companyPath,
          branch: params.branchName,
          testMode: params.testMode,
        })
      : Promise.resolve(null),
  ]);
  console.log(
    "[create-pr] Existing company file:",
    existingCompanyFile ? "found" : "not found"
  );

  // Prepare file contents
  console.log("[create-pr] Step 6: Preparing file contents");
  const companyJson = JSON.stringify(
    {
      $schema: "./schema.json",
      ...params.company,
    },
    null,
    2
  );

  // Get logos file content
  const logosFile = await getLogosFileContent({
    accessToken: params.accessToken,
    workingRepo: params.workingRepo,
    logosPath,
    branchName: params.branchName,
    defaultBranch: GITHUB_CONFIG.defaultBranch,
    testMode: params.testMode,
  });
  const logosFileContent = logosFile.content;
  const logosFileSha = logosFile.sha;

  // Inject the logo
  console.log("[create-pr] Injecting logo into TSX");
  const updatedLogosContent = injectLogoIntoTsx(
    logosFileContent,
    params.company.logoType || params.company.id,
    params.svgLogo
  );
  console.log("[create-pr] Logo injected successfully");

  return {
    companyJson,
    updatedLogosContent,
    logosFileSha,
    existingCompanyFileSha: existingCompanyFile?.sha,
  };
}

// Helper function to create pull request flow
async function createPullRequestFlow(params: {
  accessToken: string;
  userLogin: string;
  branchName: string;
  companyId: string;
  companyName: string;
  isEdit: boolean;
  isOwner: boolean;
  testMode: ReturnType<typeof getTestModeConfig>;
}): Promise<Response> {
  // If owner, we just created a branch with commits - no PR needed
  console.log("[create-pr] Step 7: Creating pull request");
  if (params.isOwner) {
    console.log("[create-pr] User is owner, skipping PR creation");
    return createOwnerResponse(params.branchName);
  }

  const { title, body: prBody } = generatePRContent(
    params.companyId,
    params.companyName,
    params.isEdit
  );
  console.log("[create-pr] PR title:", title);

  console.log("[create-pr] Creating pull request to upstream");
  const pullRequest = await createPullRequest({
    accessToken: params.accessToken,
    username: params.userLogin,
    branchName: params.branchName,
    title,
    body: prBody,
    testMode: params.testMode,
  });
  console.log(
    "[create-pr] Pull request created successfully:",
    pullRequest.html_url
  );

  return createPRResponse(pullRequest, params.testMode);
}

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

        // Parse and validate request body
        let body: CreatePRRequest;
        try {
          console.log("[create-pr] Parsing request body");
          body = await parseRequest(request);
          console.log("[create-pr] Request body parsed:", {
            companyId: body.company?.id,
            isEdit: body.isEdit,
            hasSvg: Boolean(body.svgLogo),
          });
        } catch (parseError) {
          console.error("[create-pr] Body parse error:", parseError);
          const errorMessage =
            parseError instanceof Error
              ? parseError.message
              : "Invalid request body";
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { company, svgLogo, isEdit } = body;

        // Get access token
        let accessToken: string;
        try {
          accessToken = await getAccessToken(request, testMode);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unauthorized";
          return new Response(
            JSON.stringify({
              error:
                errorMessage === "Unauthorized"
                  ? "Unauthorized"
                  : "GitHub access token not found. Please re-authenticate with GitHub.",
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          const { user, isOwner, workingRepo } = await setupUserAndFork({
            accessToken,
            testMode,
          });

          const { branchName } = await setupBranch({
            accessToken,
            workingRepo,
            companyId: company.id,
            isEdit,
            userLogin: user.login,
            testMode,
          });

          const {
            companyJson,
            updatedLogosContent,
            logosFileSha,
            existingCompanyFileSha,
          } = await prepareFiles({
            accessToken,
            workingRepo,
            company,
            svgLogo,
            branchName,
            isEdit,
            testMode,
          });

          await commitFiles({
            accessToken,
            workingRepo,
            companyPath: `src/data/companies/${company.id}.json`,
            logosPath: "src/components/company-logos.tsx",
            companyJson,
            updatedLogosContent,
            logosFileSha,
            existingCompanyFileSha,
            companyName: company.name,
            isEdit,
            branchName,
            testMode,
          });

          return await createPullRequestFlow({
            accessToken,
            userLogin: user.login,
            branchName,
            companyId: company.id,
            companyName: company.name,
            isEdit,
            isOwner,
            testMode,
          });
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
