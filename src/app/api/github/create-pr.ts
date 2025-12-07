import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import {
	getGitHubUser,
	getUserFork,
	forkRepository,
	syncFork,
	getBranchSha,
	createBranch,
	branchExists,
	getFileContent,
	createOrUpdateFile,
	createPullRequest,
	injectLogoIntoTsx,
	generateBranchName,
	generatePRContent,
	GITHUB_CONFIG,
} from "@/lib/github";
import type { Company } from "@/types/company";

interface CreatePRRequest {
	company: Company;
	svgLogo: string;
	isEdit: boolean;
	originalCompanyId?: string;
}

export const Route = createFileRoute("/api/github/create-pr")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Get the session
				const session = await auth.api.getSession({ headers: request.headers });

				if (!session) {
					return new Response(
						JSON.stringify({ error: "Unauthorized" }),
						{
							status: 401,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Get the GitHub access token using getAccessToken API
				let accessToken: string;
				try {
					const tokenResponse = await auth.api.getAccessToken({
						body: {
							providerId: "github",
						},
						headers: request.headers,
					});

					if (!tokenResponse?.accessToken) {
						throw new Error("No access token returned");
					}

					accessToken = tokenResponse.accessToken;
				} catch {
					return new Response(
						JSON.stringify({ error: "GitHub access token not found. Please re-authenticate with GitHub." }),
						{
							status: 401,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Parse request body
				let body: CreatePRRequest;
				try {
					body = await request.json();
				} catch {
					return new Response(
						JSON.stringify({ error: "Invalid request body" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const { company, svgLogo, isEdit, originalCompanyId } = body;

				if (!company || !company.id || !company.name) {
					return new Response(
						JSON.stringify({ error: "Company data is required" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				if (!svgLogo) {
					return new Response(
						JSON.stringify({ error: "SVG logo is required" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					// Step 1: Get user info
					const user = await getGitHubUser(accessToken);

					// Step 2: Ensure fork exists
					let fork = await getUserFork(accessToken, user.login);

					if (!fork) {
						fork = await forkRepository(accessToken);
						// Wait for fork to be ready
						await new Promise((resolve) => setTimeout(resolve, 3000));
					} else {
						// Sync fork with upstream
						await syncFork(accessToken, user.login);
					}

					// Step 3: Get the latest SHA from default branch
					const baseSha = await getBranchSha(accessToken, user.login);

					// Step 4: Create a new branch
					const branchName = generateBranchName(company.id, isEdit);

					// Check if branch exists and create if not
					const exists = await branchExists(accessToken, user.login, branchName);
					if (!exists) {
						await createBranch(accessToken, user.login, branchName, baseSha);
					}

					// Step 5: Create/update the company JSON file
					const companyPath = `src/data/companies/${company.id}.json`;
					const companyJson = JSON.stringify(
						{
							$schema: "./schema.json",
							...company,
						},
						null,
						2,
					);

					// Check if file exists (for edit mode)
					const existingCompanyFile = isEdit
						? await getFileContent(accessToken, user.login, companyPath, branchName)
						: null;

					await createOrUpdateFile(
						accessToken,
						user.login,
						companyPath,
						companyJson,
						isEdit
							? `chore: update ${company.name} company data`
							: `feat: add ${company.name} company data`,
						branchName,
						existingCompanyFile?.sha,
					);

					// Step 6: Update company-logos.tsx with the new logo
					const logosPath = "src/components/company-logos.tsx";
					const existingLogosFile = await getFileContent(
						accessToken,
						user.login,
						logosPath,
						branchName,
					);

					if (!existingLogosFile) {
						// Try to get from default branch
						const defaultLogosFile = await getFileContent(
							accessToken,
							user.login,
							logosPath,
							GITHUB_CONFIG.defaultBranch,
						);

						if (!defaultLogosFile) {
							throw new Error("Could not find company-logos.tsx file");
						}

						// Inject the logo
						const updatedLogosContent = injectLogoIntoTsx(
							defaultLogosFile.content,
							company.logoType || company.id,
							svgLogo,
						);

						await createOrUpdateFile(
							accessToken,
							user.login,
							logosPath,
							updatedLogosContent,
							isEdit
								? `chore: update ${company.name} logo`
								: `feat: add ${company.name} logo`,
							branchName,
						);
					} else {
						// Inject the logo into existing content
						const updatedLogosContent = injectLogoIntoTsx(
							existingLogosFile.content,
							company.logoType || company.id,
							svgLogo,
						);

						await createOrUpdateFile(
							accessToken,
							user.login,
							logosPath,
							updatedLogosContent,
							isEdit
								? `chore: update ${company.name} logo`
								: `feat: add ${company.name} logo`,
							branchName,
							existingLogosFile.sha,
						);
					}

					// Step 7: Create the pull request
					const { title, body: prBody } = generatePRContent(
						company.id,
						company.name,
						isEdit,
					);

					const pullRequest = await createPullRequest(
						accessToken,
						user.login,
						branchName,
						title,
						prBody,
					);

					return new Response(
						JSON.stringify({
							success: true,
							pullRequest: {
								number: pullRequest.number,
								url: pullRequest.html_url,
								title: pullRequest.title,
							},
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error) {
					console.error("Create PR error:", error);
					return new Response(
						JSON.stringify({
							error: error instanceof Error ? error.message : "Failed to create pull request",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
