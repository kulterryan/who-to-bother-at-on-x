import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import {
	forkRepository,
	getGitHubUser,
	getUserFork,
	syncFork,
} from "@/lib/github";

export const Route = createFileRoute("/api/github/fork")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Get the session
				const session = await auth.api.getSession({ headers: request.headers });

				if (!session) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				// Get the GitHub access token
				let accessToken: string;
				try {
					// Try getAccessToken API first
					const tokenResponse = await auth.api.getAccessToken({
						body: {
							providerId: "github",
						},
						headers: request.headers,
					});

					if (!tokenResponse?.accessToken) {
						throw new Error("No access token returned from getAccessToken");
					}

					accessToken = tokenResponse.accessToken;

				} catch (tokenError) {
					// Log the error for debugging
					console.error("getAccessToken error:", tokenError);

					// Try to get accounts via listUserAccounts
					try {
						const accounts = await auth.api.getAccessToken();

						if (!accounts?.accessToken) {
							throw new Error("No access token returned from listUserAccounts");
						}

						accessToken = accounts.accessToken;
					} catch (listError) {
						console.error("listUserAccounts error:", listError);

						// Log available cookies for debugging
						const cookieHeader = request.headers.get("cookie") || "";
						console.log(
							"Available cookies:",
							cookieHeader.split(";").map((c) => c.trim().split("=")[0]),
						);

						return new Response(
							JSON.stringify({
								error:
									"GitHub access token not found. Please re-authenticate with GitHub.",
								debug: {
									tokenError:
										tokenError instanceof Error
											? tokenError.message
											: String(tokenError),
									listError:
										listError instanceof Error
											? listError.message
											: String(listError),
								},
							}),
							{
								status: 401,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
				}

				try {
					// Get user info
					const user = await getGitHubUser(accessToken);

					console.log("user", user);

					// Check if fork already exists
					let fork = await getUserFork(accessToken, user.login);

					console.log("fork", fork);

					if (fork) {
						// Sync fork with upstream
						await syncFork(accessToken, user.login);

						return new Response(
							JSON.stringify({
								success: true,
								fork: {
									fullName: fork.full_name,
									username: user.login,
									alreadyExisted: true,
								},
							}),
							{
								status: 200,
								headers: {
									"Content-Type": "application/json",
									"User-Agent": "who-to-bother-on-x",
								},
							},
						);
					}

					// Create new fork
					fork = await forkRepository(accessToken);

					// Wait a bit for fork to be ready
					await new Promise((resolve) => setTimeout(resolve, 2000));

					return new Response(
						JSON.stringify({
							success: true,
							fork: {
								fullName: fork.full_name,
								username: user.login,
								alreadyExisted: false,
							},
						}),
						{
							status: 200,
							headers: {
								"Content-Type": "application/json",
								"User-Agent": "who-to-bother-on-x",
							},
						},
					);
				} catch (error) {
					console.error("Fork error:", error);
					return new Response(
						JSON.stringify({
							error:
								error instanceof Error
									? error.message
									: "Failed to fork repository",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
								"User-Agent": "who-to-bother-on-x",
							},
						},
					);
				}
			},
		},
	},
});
