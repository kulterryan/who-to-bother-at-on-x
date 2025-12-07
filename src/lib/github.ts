/**
 * GitHub API utilities for creating PRs with company contributions
 */

// Repository configuration
export const GITHUB_CONFIG = {
	owner: "kulterryan",
	repo: "cf-who-to-bother-at-on-x",
	defaultBranch: "main",
} as const;

const GITHUB_API_BASE = "https://api.github.com";

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

/**
 * Get the authenticated user's GitHub info
 */
export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
	const response = await fetch(`${GITHUB_API_BASE}/user`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github.v3+json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to get GitHub user: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Check if user has a fork of the repository
 */
export async function getUserFork(
	accessToken: string,
	username: string,
): Promise<GitHubRepo | null> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Failed to check fork: ${response.statusText}`);
	}

	const repo: GitHubRepo = await response.json();

	// Verify it's actually a fork of our repo
	if (
		repo.fork &&
		repo.parent?.full_name === `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`
	) {
		return repo;
	}

	return null;
}

/**
 * Fork the repository to user's account
 */
export async function forkRepository(
	accessToken: string,
): Promise<GitHubRepo> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/forks`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to fork repository: ${error}`);
	}

	return response.json();
}

/**
 * Sync fork with upstream (in case it's behind)
 */
export async function syncFork(
	accessToken: string,
	username: string,
): Promise<void> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/merge-upstream`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
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

/**
 * Get the latest commit SHA from a branch
 */
export async function getBranchSha(
	accessToken: string,
	username: string,
	branch: string = GITHUB_CONFIG.defaultBranch,
): Promise<string> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/ref/heads/${branch}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to get branch SHA: ${response.statusText}`);
	}

	const data = await response.json();
	return data.object.sha;
}

/**
 * Create a new branch from a SHA
 */
export async function createBranch(
	accessToken: string,
	username: string,
	branchName: string,
	sha: string,
): Promise<void> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/refs`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
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

/**
 * Check if a branch exists
 */
export async function branchExists(
	accessToken: string,
	username: string,
	branchName: string,
): Promise<boolean> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/git/ref/heads/${branchName}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		},
	);

	return response.ok;
}

/**
 * Get file content from repository
 */
export async function getFileContent(
	accessToken: string,
	username: string,
	path: string,
	branch: string = GITHUB_CONFIG.defaultBranch,
): Promise<{ content: string; sha: string } | null> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/contents/${path}?ref=${branch}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
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

/**
 * Create or update a file in the repository
 */
export async function createOrUpdateFile(
	accessToken: string,
	username: string,
	path: string,
	content: string,
	message: string,
	branch: string,
	existingSha?: string,
): Promise<GitHubCommitResponse> {
	const body: Record<string, string> = {
		message,
		content: Buffer.from(content).toString("base64"),
		branch,
	};

	if (existingSha) {
		body.sha = existingSha;
	}

	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${username}/${GITHUB_CONFIG.repo}/contents/${path}`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
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

/**
 * Create a pull request from fork to upstream
 */
export async function createPullRequest(
	accessToken: string,
	username: string,
	branchName: string,
	title: string,
	body: string,
): Promise<GitHubPullRequest> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/pulls`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
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

/**
 * Inject a new logo entry into company-logos.tsx content
 */
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
	cleanedSvg = cleanedSvg.replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"');

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

/**
 * Generate a unique branch name for the PR
 */
export function generateBranchName(
	companyId: string,
	isEdit: boolean,
): string {
	const prefix = isEdit ? "edit" : "add";
	const timestamp = Date.now();
	return `${prefix}-${companyId}-${timestamp}`;
}

/**
 * Generate PR title and body
 */
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
