// GitHub API utilities for creating PRs with company contributions

// Repository configuration
export const GITHUB_CONFIG = {
	owner: "kulterryan",
	repo: "who-to-bother-at-on-x",
	defaultBranch: "main",
} as const;

// Test mode configuration - when enabled, simulates GitHub API calls without making actual requests. Set GITHUB_TEST_MODE=true in your environment to enable test mode.
export interface TestModeConfig {
	enabled: boolean;
	simulatedDelay?: number; // milliseconds to simulate API latency
}

// Check if GitHub test mode is enabled via environment variable
export function isGitHubTestModeEnabled(): boolean {
	return process.env.GITHUB_TEST_MODE === "true";
}

// Get test mode config from environment variable
export function getTestModeConfig(): TestModeConfig | undefined {
	if (isGitHubTestModeEnabled()) {
		return { enabled: true, simulatedDelay: 200 };
	}
	return ;
}

// In-memory storage for test mode to simulate state
const testModeState = {
	forks: new Map<string, GitHubRepo>(),
	branches: new Map<string, { sha: string }>(),
	files: new Map<string, { content: string; sha: string }>(),
	pullRequests: new Map<number, GitHubPullRequest>(),
	prCounter: 1,
};

// Reset test mode state (useful between tests)
export function resetTestModeState(): void {
	testModeState.forks.clear();
	testModeState.branches.clear();
	testModeState.files.clear();
	testModeState.pullRequests.clear();
	testModeState.prCounter = 1;
}

// Helper to simulate API delay in test mode
async function simulateDelay(config: TestModeConfig): Promise<void> {
	const delay = config.simulatedDelay ?? 100;
	if (delay > 0) {
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
}

const GITHUB_API_BASE = "https://api.github.com";
const FETCH_TIMEOUT_MS = 8000; // 8 second timeout for GitHub API calls

// Fetch with timeout using AbortController
async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}

interface GitHubUser {
	login: string;
	id: number;
}

interface GitHubRepo {
	full_name: string;
	default_branch: string;
	fork: boolean;
	parent?: {
		full_name: string;
	};
}

interface GitHubBranch {
	name: string;
	commit: {
		sha: string;
	};
}

interface GitHubFileContent {
	content: string;
	sha: string;
	encoding: string;
}

interface GitHubCommitResponse {
	content: {
		sha: string;
	};
	commit: {
		sha: string;
	};
}

interface GitHubPullRequest {
	number: number;
	html_url: string;
	title: string;
	state: string;
}

// Get the authenticated user's GitHub info
export async function getGitHubUser(
	accessToken: string,
	testMode?: TestModeConfig,
): Promise<GitHubUser> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		console.log("[TEST MODE] getGitHubUser: Returning mock user");
		return {
			login: "test-user",
			id: 12_345_678,
		};
	}

	const response = await fetchWithTimeout(`${GITHUB_API_BASE}/user`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "who-to-bother-on-x",
		},
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error("GitHub API error:", {
			status: response.status,
			statusText: response.statusText,
			body: errorBody,
			headers: Object.fromEntries(response.headers.entries()),
		});

		if (response.status === 401 || response.status === 403) {
			throw new Error(
				`GitHub authentication failed: ${response.statusText}. You may need to re-authenticate to grant the required permissions. Please log out and log back in.`,
			);
		}

		throw new Error(`Failed to get GitHub user: ${response.statusText}`);
	}

	return response.json();
}

// Check if user has a fork of the repository
export async function getUserFork(
	accessToken: string,
	username: string,
	testMode?: TestModeConfig,
): Promise<GitHubRepo | null> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const forkKey = `${username}/${GITHUB_CONFIG.repo}`;
		const existingFork = testModeState.forks.get(forkKey);
		console.log(`[TEST MODE] getUserFork: ${existingFork ? "Found" : "Not found"} fork for ${username}`);
		return existingFork ?? null;
	}

	const url = `${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}`;
	console.log("[getUserFork] Checking fork at URL:", url);
	console.log("[getUserFork] Username:", username);
	console.log("[getUserFork] Expected repo name:", GITHUB_CONFIG.repo);

	const response = await fetchWithTimeout(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "who-to-bother-on-x",
		},
	});

	console.log("[getUserFork] Response status:", response.status, response.statusText);

	if (response.status === 404) {
		console.log("[getUserFork] Fork not found at expected location");
		console.log("[getUserFork] This could mean:");
		console.log("[getUserFork]   1. User hasn't forked the repo yet");
		console.log("[getUserFork]   2. Fork has a different name");
		console.log("[getUserFork]   3. Fork is still being created by GitHub");

		// Try to find any fork of the upstream repo in user's repos
		console.log("[getUserFork] Searching for forks in user's repositories...");
		try {
			const userReposResponse = await fetchWithTimeout(
				`${GITHUB_API_BASE}/users/${username}/repos?type=fork&per_page=100`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github.v3+json",
						"User-Agent": "who-to-bother-on-x",
					},
				},
			);

			if (userReposResponse.ok) {
				const userRepos: GitHubRepo[] = await userReposResponse.json();
				const expectedParent = `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`.toLowerCase();

				console.log(`[getUserFork] Found ${userRepos.length} forked repos for user`);

				for (const repo of userRepos) {
					const parentName = repo.parent?.full_name?.toLowerCase();
					console.log(`[getUserFork] Checking repo: ${repo.full_name}, parent: ${parentName || "unknown"}`);

					if (parentName === expectedParent) {
						console.log(`[getUserFork] Found fork with different name: ${repo.full_name}`);
						return repo;
					}
				}
				console.log("[getUserFork] No matching fork found in user's repositories");
			}
		} catch (searchError) {
			console.error("[getUserFork] Error searching user repos:", searchError);
		}

		return null;
	}

	if (!response.ok) {
		const errorText = await response.text();
		console.error("[getUserFork] Error response body:", errorText);
		throw new Error(`Failed to check fork: ${response.statusText}`);
	}

	const repo: GitHubRepo = await response.json();

	console.log("Fork response:", repo);

	// Verify it's actually a fork of our repo
	const expectedParent = `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`.toLowerCase();
	const actualParent = repo.parent?.full_name?.toLowerCase();

	if (repo.fork && actualParent === expectedParent) {
		console.log("Fork validation passed");
		return repo;
	}

	// Log for debugging if the check fails
	console.log("Fork validation failed:", {
		isFork: repo.fork,
		expectedParent,
		actualParent,
		repoFullName: repo.full_name,
	});

	// If the repo exists with the same name and is a fork, accept it
	// This handles edge cases where parent info might be incomplete
	if (repo.fork) {
		console.log("Accepting fork despite parent mismatch");
		return repo;
	}

	return null;
}

// Fork the repository to user's account
export async function forkRepository(
	accessToken: string,
	testMode?: TestModeConfig,
	testUsername?: string,
): Promise<GitHubRepo> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const username = testUsername ?? "test-user";
		const forkKey = `${username}/${GITHUB_CONFIG.repo}`;
		const mockFork: GitHubRepo = {
			full_name: forkKey,
			default_branch: GITHUB_CONFIG.defaultBranch,
			fork: true,
			parent: {
				full_name: `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
			},
		};
		testModeState.forks.set(forkKey, mockFork);
		console.log(`[TEST MODE] forkRepository: Created mock fork ${forkKey}`);
		return mockFork;
	}

	const forkUrl = `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/forks`;
	console.log("[forkRepository] Creating fork at:", forkUrl);

	const response = await fetchWithTimeout(forkUrl, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "who-to-bother-on-x",
		},
	});

	console.log("[forkRepository] Response status:", response.status, response.statusText);

	if (!response.ok) {
		const error = await response.text();
		console.error("[forkRepository] GitHub API error:", {
			status: response.status,
			statusText: response.statusText,
			body: error,
			headers: Object.fromEntries(response.headers.entries()),
		});
		throw new Error(`Failed to fork repository: ${error}`);
	}

	const fork: GitHubRepo = await response.json();
	console.log("[forkRepository] Fork created successfully:", {
		fullName: fork.full_name,
		defaultBranch: fork.default_branch,
		isFork: fork.fork,
	});

	return fork;
}

// Sync fork with upstream (in case it's behind)
export async function syncFork(
	accessToken: string,
	username: string,
	testMode?: TestModeConfig,
): Promise<void> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		console.log(`[TEST MODE] syncFork: Simulated sync for ${username}`);
		return;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/merge-upstream`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
				"User-Agent": "who-to-bother-on-x",
			},
			body: JSON.stringify({
				branch: GITHUB_CONFIG.defaultBranch,
			}),
		},
	);

	// It's okay if sync fails (e.g., already up to date)
	if (!response.ok && response.status !== 409) {
		console.warn("Failed to sync fork, continuing anyway");
	}
}

// Get the latest commit SHA from a branch
export async function getBranchSha(
	accessToken: string,
	username: string,
	branch: string = GITHUB_CONFIG.defaultBranch,
	testMode?: TestModeConfig,
): Promise<string> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const branchKey = `${username}/${GITHUB_CONFIG.repo}/${branch}`;
		const existingBranch = testModeState.branches.get(branchKey);
		const sha = existingBranch?.sha ?? `mock-sha-${Date.now()}`;
		if (!existingBranch) {
			testModeState.branches.set(branchKey, { sha });
		}
		console.log(`[TEST MODE] getBranchSha: Returning SHA ${sha} for ${branchKey}`);
		return sha;
	}

	const url = `${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/ref/heads/${branch}`;
	const response = await fetchWithTimeout(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "who-to-bother-on-x",
		},
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error("Failed to get branch SHA:", {
			url,
			status: response.status,
			statusText: response.statusText,
			body: errorBody,
		});

		if (response.status === 404) {
			throw new Error(
				`Branch '${branch}' not found in repository '${username}/${GITHUB_CONFIG.repo}'. The fork may not exist yet or the branch hasn't been created.`,
			);
		}

		throw new Error(`Failed to get branch SHA: ${response.statusText}`);
	}

	const data = await response.json();
	return data.object.sha;
}

// Create a new branch from a SHA
export async function createBranch(
	accessToken: string,
	username: string,
	branchName: string,
	sha: string,
	testMode?: TestModeConfig,
): Promise<void> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const branchKey = `${username}/${GITHUB_CONFIG.repo}/${branchName}`;
		testModeState.branches.set(branchKey, { sha });
		console.log(`[TEST MODE] createBranch: Created branch ${branchKey} with SHA ${sha}`);
		return;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/refs`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
				"User-Agent": "who-to-bother-on-x",
			},
			body: JSON.stringify({
				ref: `refs/heads/${branchName}`,
				sha,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create branch: ${error}`);
	}
}

// Check if a branch exists
export async function branchExists(
	accessToken: string,
	username: string,
	branchName: string,
	testMode?: TestModeConfig,
): Promise<boolean> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const branchKey = `${username}/${GITHUB_CONFIG.repo}/${branchName}`;
		const exists = testModeState.branches.has(branchKey);
		console.log(`[TEST MODE] branchExists: Branch ${branchKey} ${exists ? "exists" : "does not exist"}`);
		return exists;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/ref/heads/${branchName}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "who-to-bother-on-x",
			},
		},
	);

	return response.ok;
}

// Get file content from repository
export async function getFileContent(
	accessToken: string,
	username: string,
	path: string,
	branch: string = GITHUB_CONFIG.defaultBranch,
	testMode?: TestModeConfig,
): Promise<{ content: string; sha: string } | null> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const fileKey = `${username}/${GITHUB_CONFIG.repo}/${branch}/${path}`;
		const existingFile = testModeState.files.get(fileKey);
		console.log(`[TEST MODE] getFileContent: ${existingFile ? "Found" : "Not found"} file ${fileKey}`);
		return existingFile ?? null;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/contents/${path}?ref=${branch}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "who-to-bother-on-x",
			},
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Failed to get file content: ${response.statusText}`);
	}

	const data: GitHubFileContent = await response.json();
	const content = Buffer.from(data.content, "base64").toString("utf-8");

	return { content, sha: data.sha };
}

// Create or update a file in the repository
export async function createOrUpdateFile(
	accessToken: string,
	username: string,
	path: string,
	content: string,
	message: string,
	branch: string,
	existingSha?: string,
	testMode?: TestModeConfig,
): Promise<GitHubCommitResponse> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const fileKey = `${username}/${GITHUB_CONFIG.repo}/${branch}/${path}`;
		const newSha = `mock-file-sha-${Date.now()}`;
		const commitSha = `mock-commit-sha-${Date.now()}`;
		testModeState.files.set(fileKey, { content, sha: newSha });
		console.log(`[TEST MODE] createOrUpdateFile: ${existingSha ? "Updated" : "Created"} file ${fileKey}`);
		console.log(`[TEST MODE] Commit message: ${message}`);
		return {
			content: { sha: newSha },
			commit: { sha: commitSha },
		};
	}

	const body: Record<string, string> = {
		message,
		content: Buffer.from(content).toString("base64"),
		branch,
	};

	if (existingSha) {
		body.sha = existingSha;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/contents/${path}`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
				"User-Agent": "who-to-bother-on-x",
			},
			body: JSON.stringify(body),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create/update file: ${error}`);
	}

	return response.json();
}

// Create a pull request from fork to upstream
export async function createPullRequest(
	accessToken: string,
	username: string,
	branchName: string,
	title: string,
	body: string,
	testMode?: TestModeConfig,
): Promise<GitHubPullRequest> {
	if (testMode?.enabled) {
		await simulateDelay(testMode);
		const prNumber = testModeState.prCounter++;
		const mockPR: GitHubPullRequest = {
			number: prNumber,
			html_url: `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/pull/${prNumber}`,
			title,
			state: "open",
		};
		testModeState.pullRequests.set(prNumber, mockPR);
		console.log(`[TEST MODE] createPullRequest: Created mock PR #${prNumber}`);
		console.log(`[TEST MODE] PR Title: ${title}`);
		console.log(`[TEST MODE] PR from ${username}:${branchName} to ${GITHUB_CONFIG.owner}:${GITHUB_CONFIG.defaultBranch}`);
		return mockPR;
	}

	const response = await fetchWithTimeout(
		`${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/pulls`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
				"User-Agent": "who-to-bother-on-x",
			},
			body: JSON.stringify({
				title,
				body,
				head: `${username}:${branchName}`,
				base: GITHUB_CONFIG.defaultBranch,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create pull request: ${error}`);
	}

	return response.json();
}

// Inject a new logo entry into company-logos.tsx content
export function injectLogoIntoTsx(
	existingContent: string,
	companyId: string,
	svgContent: string,
): string {
	// Clean up the SVG content - remove XML declarations and doctype
	let cleanedSvg = svgContent
		.replace(/<\?xml[^>]*\?>/gi, "")
		.replace(/<!DOCTYPE[^>]*>/gi, "")
		.trim();

	// Ensure the SVG has proper sizing and classes
	if (!cleanedSvg.includes('width="30"')) {
		cleanedSvg = cleanedSvg.replace(/<svg/, '<svg width="30" height="30"');
	}

	// Add className for dark mode support if not present
	if (!cleanedSvg.includes("className")) {
		cleanedSvg = cleanedSvg.replace(
			/<svg/,
			'<svg className="text-zinc-900 dark:text-zinc-100"',
		);
	}

	// Replace fill colors with currentColor for theming
	cleanedSvg = cleanedSvg.replace(
		/fill="(?!none)[^"]*"/gi,
		'fill="currentColor"',
	);

	// Create the logo entry
	const logoEntry = `\t${companyId}: (\n\t\t${cleanedSvg.split("\n").join("\n\t\t")}\n\t),`;

	// Find the position to insert (before the closing brace of companyLogos object)
	const closingBracePattern = /^};?\s*$/m;
	const match = existingContent.match(closingBracePattern);

	if (!match || match.index === undefined) {
		throw new Error("Could not find closing brace of companyLogos object");
	}

	// Check if the company already exists
	const existingPattern = new RegExp(`\\s${companyId}:\\s*\\(`);
	if (existingPattern.test(existingContent)) {
		// Replace existing entry
		const replacePattern = new RegExp(
			`(\\s${companyId}:\\s*\\()[^)]*\\)\\s*\\),?`,
			"s",
		);
		return existingContent.replace(replacePattern, `\n${logoEntry}`);
	}

	// Insert new entry before the closing brace
	const insertPosition = match.index;
	return (
		existingContent.slice(0, insertPosition) +
		logoEntry +
		"\n" +
		existingContent.slice(insertPosition)
	);
}

// Generate a unique branch name for the PR
export function generateBranchName(
	companyId: string,
	isEdit: boolean,
	username: string,
): string {
	const prefix = isEdit ? "api-edit" : "api-add";
	const timestamp = Date.now();
	return `${prefix}-${companyId}-${username}-${timestamp}`;
}

// Generate PR title and body
export function generatePRContent(
	companyId: string,
	companyName: string,
	isEdit: boolean,
): { title: string; body: string } {
	const action = isEdit ? "Update" : "Add";

	const title = `${action}: ${companyName}`;

	const body = `## ${action} Company: ${companyName}

This PR was automatically generated from the [Who to Bother](https://who-to-bother-at.com) website.

### Changes
- ${isEdit ? "Updated" : "Added"} company data file: \`src/data/companies/${companyId}.json\`
- ${isEdit ? "Updated" : "Added"} company logo in: \`src/components/company-logos.tsx\`

### Checklist
- [ ] Company information is accurate
- [ ] Logo displays correctly
- [ ] All contacts have valid X handles

---
*Submitted via the website contribution form*`;

	return { title, body };
}
