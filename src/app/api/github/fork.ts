import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import {
  forkRepository,
  GITHUB_CONFIG,
  getGitHubUser,
  getTestModeConfig,
  getUserFork,
  syncFork,
} from "@/lib/github";

// Helper function to get GitHub access token
async function getAccessToken(
  request: Request,
  testMode: ReturnType<typeof getTestModeConfig>
): Promise<string> {
  if (testMode?.enabled) {
    console.log("[fork] 🧪 Skipping authentication in test mode");
    return "test-token";
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Try getAccessToken API first
  try {
    const tokenResponse = await auth.api.getAccessToken({
      body: {
        providerId: "github",
      },
      headers: request.headers,
    });

    if (!tokenResponse?.accessToken) {
      throw new Error("No access token returned from getAccessToken");
    }

    return tokenResponse.accessToken;
  } catch (tokenError) {
    console.error("getAccessToken error:", tokenError);

    // Try alternative method
    try {
      const accounts = await auth.api.getAccessToken();

      if (!accounts?.accessToken) {
        throw new Error("No access token returned from listUserAccounts");
      }

      return accounts.accessToken;
    } catch (listError) {
      console.error("listUserAccounts error:", listError);

      // Log available cookies for debugging
      const cookieHeader = request.headers.get("cookie") || "";
      console.log(
        "Available cookies:",
        cookieHeader.split(";").map((c) => c.trim().split("=")[0])
      );

      const tokenErrorMessage =
        tokenError instanceof Error ? tokenError.message : String(tokenError);
      const listErrorMessage =
        listError instanceof Error ? listError.message : String(listError);

      throw new Error(
        `GitHub access token not found. Please re-authenticate with GitHub. Token error: ${tokenErrorMessage}, List error: ${listErrorMessage}`
      );
    }
  }
}

// Helper function to check if user is repo owner
function isRepoOwner(
  userLogin: string,
  testMode: ReturnType<typeof getTestModeConfig>
): boolean {
  if (testMode?.enabled) {
    return false; // Simulate as non-owner in test mode
  }
  return userLogin.toLowerCase() === GITHUB_CONFIG.owner.toLowerCase();
}

// Helper function to handle existing fork
async function handleExistingFork(
  fork: Awaited<ReturnType<typeof getUserFork>>,
  userLogin: string,
  accessToken: string,
  testMode: ReturnType<typeof getTestModeConfig>
) {
  await syncFork(accessToken, userLogin, testMode);

  return new Response(
    JSON.stringify({
      success: true,
      testMode: testMode?.enabled ?? false,
      fork: {
        fullName: fork?.full_name ?? "",
        username: userLogin,
        alreadyExisted: true,
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "who-to-bother-on-x",
      },
    }
  );
}

// Helper function to wait for fork to be ready
async function waitForFork(
  accessToken: string,
  userLogin: string,
  testMode: ReturnType<typeof getTestModeConfig>
): Promise<Awaited<ReturnType<typeof getUserFork>>> {
  if (testMode?.enabled) {
    // In test mode, skip polling since mock is instant
    return null;
  }

  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const verifiedFork = await getUserFork(accessToken, userLogin, testMode);
    if (verifiedFork) {
      return verifiedFork;
    }
  }

  return null;
}

// Helper function to create success response
function createSuccessResponse(
  fork: Awaited<ReturnType<typeof getUserFork>>,
  userLogin: string,
  testMode: ReturnType<typeof getTestModeConfig>,
  alreadyExisted: boolean
) {
  return new Response(
    JSON.stringify({
      success: true,
      testMode: testMode?.enabled ?? false,
      fork: {
        fullName: fork?.full_name ?? "",
        username: userLogin,
        alreadyExisted,
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "who-to-bother-on-x",
      },
    }
  );
}

// Helper function to create error response
function createErrorResponse(
  message: string,
  status: number,
  debug?: Record<string, unknown>
) {
  return new Response(
    JSON.stringify({
      error: message,
      ...(debug && { debug }),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "who-to-bother-on-x",
      },
    }
  );
}

export const Route = createFileRoute("/api/github/fork")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const testMode = getTestModeConfig();

        if (testMode?.enabled) {
          console.log(
            "[fork] 🧪 TEST MODE ENABLED (GITHUB_TEST_MODE=true) - No actual GitHub API calls will be made"
          );
        }

        // Get access token
        let accessToken: string;
        try {
          accessToken = await getAccessToken(request, testMode);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage === "Unauthorized") {
            return createErrorResponse("Unauthorized", 401);
          }
          return createErrorResponse(errorMessage, 401, {
            tokenError: errorMessage,
          });
        }

        try {
          // Get user info
          const user = await getGitHubUser(accessToken, testMode);

          // Check if user is the repo owner
          if (isRepoOwner(user.login, testMode)) {
            return new Response(
              JSON.stringify({
                success: true,
                isOwner: true,
                message: "Owner can commit directly to the repository",
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "who-to-bother-on-x",
                },
              }
            );
          }

          // Check if fork already exists
          const existingFork = await getUserFork(
            accessToken,
            user.login,
            testMode
          );

          if (existingFork) {
            return handleExistingFork(
              existingFork,
              user.login,
              accessToken,
              testMode
            );
          }

          // Create new fork
          let fork = await forkRepository(accessToken, testMode, user.login);

          // Wait for fork to be ready (GitHub fork creation is async)
          const verifiedFork = await waitForFork(
            accessToken,
            user.login,
            testMode
          );
          if (verifiedFork) {
            fork = verifiedFork;
          }

          return createSuccessResponse(fork, user.login, testMode, false);
        } catch (error) {
          console.error("Fork error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fork repository";
          return createErrorResponse(errorMessage, 500);
        }
      },
    },
  },
});
