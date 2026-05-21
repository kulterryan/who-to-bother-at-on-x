import {
  detectAIBot,
  injectMarkdownAlternateLink,
  listingToMarkdown,
  markdownResponse,
  negotiateFormat,
  renderLlmsTxt,
  toMarkdownPath,
  toMarkdownUrl,
} from "@dualmark/core";
import { search } from "@/lib/search";
import type { Company } from "@/types/company";

const BASE_URL = "https://who-to-bother-at.com";
const MARKDOWN_CACHE_CONTROL = "public, max-age=300, s-maxage=3600";

const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  { eager: true }
);

const companies = Object.entries(companyModules)
  .filter(([path]) => !(path.includes("template") || path.includes("schema")))
  .map(([, module]) => module.default)
  .sort((a, b) => a.name.localeCompare(b.name));

const companyById = new Map(companies.map((company) => [company.id, company]));

const staticPages = [
  {
    path: "/",
    title: "who to bother on X",
    description:
      "Find the right people to reach out to at your favorite tech companies on X (Twitter).",
  },
  {
    path: "/search",
    title: "Search companies and products",
    description:
      "Search for companies and products to find the right people to reach out to on X.",
  },
  {
    path: "/stats",
    title: "Statistics",
    description: "A quick overview of the company and contact database.",
  },
  {
    path: "/sponsors",
    title: "Sponsors",
    description: "Support the development and maintenance of this project.",
  },
] as const;

const staticPagePaths: Set<string> = new Set(
  staticPages.map((page) => page.path)
);

const communityRoleLabels = {
  "oss-maintainer": "OSS maintainer",
  "content-creator": "Content creator",
  "community-expert": "Community expert",
  "tool-builder": "Tool builder",
  contributor: "Contributor",
} as const;

export function getDualmarkResponse(request: Request): Response | null {
  if (!isSafeRequestMethod(request.method)) {
    return null;
  }

  const url = new URL(request.url);

  if (url.pathname === "/llms.txt") {
    return new Response(renderLlmsTxtBody(), {
      headers: {
        "Cache-Control": MARKDOWN_CACHE_CONTROL,
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const markdownBody = getMarkdownBody(url);

  if (!markdownBody) {
    return null;
  }

  const accept = request.headers.get("accept") ?? "";
  const format = negotiateFormat(accept);
  const bot = detectAIBot(request.headers.get("user-agent") ?? "");
  const shouldServeMarkdown =
    isMarkdownPath(url.pathname) || bot.isBot || format === "markdown";

  if (shouldServeMarkdown) {
    return createMarkdownResponse(markdownBody, request.method);
  }

  if (format === null && accept) {
    return new Response(null, {
      status: 406,
      headers: { Vary: "Accept" },
    });
  }

  return null;
}

export function withDualmarkAlternateLink(
  request: Request,
  response: Response
): Response {
  if (!isSafeRequestMethod(request.method) || response.status !== 200) {
    return response;
  }

  const url = new URL(request.url);

  if (isMarkdownPath(url.pathname) || !hasMarkdownTwin(url)) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  return injectMarkdownAlternateLink(response, request.url, toMarkdownUrl(url));
}

function isSafeRequestMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

function isMarkdownPath(pathname: string): boolean {
  return pathname === "/index.md" || pathname.endsWith(".md");
}

function normalizePagePath(pathname: string): string {
  const withoutMarkdownExtension = isMarkdownPath(pathname)
    ? pathname.slice(0, -".md".length)
    : pathname;

  if (
    withoutMarkdownExtension === "" ||
    withoutMarkdownExtension === "/index"
  ) {
    return "/";
  }

  if (
    withoutMarkdownExtension.length > 1 &&
    withoutMarkdownExtension.endsWith("/")
  ) {
    return withoutMarkdownExtension.slice(0, -1);
  }

  return withoutMarkdownExtension;
}

function hasMarkdownTwin(url: URL): boolean {
  const pagePath = normalizePagePath(url.pathname);

  return staticPagePaths.has(pagePath) || companyById.has(pagePath.slice(1));
}

function getMarkdownBody(url: URL): string | null {
  const pagePath = normalizePagePath(url.pathname);

  if (pagePath === "/") {
    return renderHomeMarkdown();
  }

  if (pagePath === "/search") {
    return renderSearchMarkdown(url);
  }

  if (pagePath === "/stats") {
    return renderStatsMarkdown();
  }

  if (pagePath === "/sponsors") {
    return renderSponsorsMarkdown();
  }

  const company = companyById.get(pagePath.slice(1));

  if (company) {
    return renderCompanyMarkdown(company);
  }

  return null;
}

function createMarkdownResponse(body: string, method: string): Response {
  const response = markdownResponse(body, {
    cacheControl: MARKDOWN_CACHE_CONTROL,
  });

  if (method !== "HEAD") {
    return response;
  }

  return new Response(null, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function renderHomeMarkdown(): string {
  return listingToMarkdown({
    title: "who to bother on X",
    description:
      "Find the right people to reach out to at your favorite tech companies on X (Twitter).",
    url: `${BASE_URL}/`,
    items: companies.map((company) => ({
      title: company.name,
      href: `${BASE_URL}/${company.id}`,
      description: company.description,
    })),
    footer:
      "Use the markdown twin of any company page to get product, team, and community contact handles in a compact format.",
  });
}

function renderSearchMarkdown(url: URL): string {
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return [
      "# Search companies and products",
      "",
      "Search for companies and products to find the right people to reach out to on X.",
      "",
      `HTML page: ${BASE_URL}/search`,
      "",
      "Add a `q` query parameter to return markdown search results.",
      "",
      `Example: ${BASE_URL}/search.md?q=cloudflare`,
    ].join("\n");
  }

  const results = search(query);
  const lines = [
    `# Search results for "${query}"`,
    "",
    `HTML page: ${BASE_URL}/search?q=${encodeURIComponent(query)}`,
    "",
    `Found ${results.length} result${results.length === 1 ? "" : "s"}.`,
  ];

  for (const result of results) {
    const handles = result.handles?.length
      ? ` Handles: ${result.handles.map(formatXHandle).join(", ")}.`
      : "";

    lines.push(
      "",
      `## ${result.name}`,
      "",
      `${result.description}${handles}`,
      "",
      `Company: [${result.companyName}](${BASE_URL}/${result.companyId})`
    );
  }

  return lines.join("\n");
}

function renderStatsMarkdown(): string {
  const stats = getStats();

  return [
    "# Statistics",
    "",
    "A quick overview of the who to bother on X database.",
    "",
    `- Companies: ${stats.companyCount}`,
    `- Unique X handles: ${stats.peopleCount}`,
    `- Contact entries: ${stats.contactEntryCount}`,
    "",
    "Each contact entry represents a specific product, team, or role within a company. Some people appear multiple times if they handle different products or areas.",
  ].join("\n");
}

function renderSponsorsMarkdown(): string {
  return [
    "# Sponsors",
    "",
    "Support the development and maintenance of who to bother on X.",
    "",
    "## Current sponsors",
    "",
    "- Brandon McConnell: [@branmcconnell](https://x.com/branmcconnell), [GitHub](https://github.com/brandonmcconnell)",
    "",
    "## Become a sponsor",
    "",
    "[Sponsor the project on GitHub](https://github.com/sponsors/kulterryan).",
  ].join("\n");
}

function renderCompanyMarkdown(company: Company): string {
  const lines = [
    `# who to bother at ${company.name} on X`,
    "",
    company.description,
    "",
    `HTML page: ${BASE_URL}/${company.id}`,
    "",
    ...renderCompanyLinks(company),
  ];

  for (const category of company.categories) {
    lines.push("", `## ${category.name}`, "");

    for (const contact of category.contacts) {
      const details = [
        contact.handles.map(formatXHandle).join(", "),
        contact.email ? `Email: ${contact.email}` : null,
        contact.discord ? `Discord: ${contact.discord}` : null,
      ].filter((value): value is string => Boolean(value));

      lines.push(`- **${contact.product}**: ${details.join("; ")}`);
    }
  }

  if (company.communityDevelopers?.length) {
    lines.push(
      "",
      "## Community Developers",
      "",
      "Independent developers and OSS maintainers building on the ecosystem. Not affiliated with the company.",
      ""
    );

    for (const developer of company.communityDevelopers) {
      const details = [
        formatXHandle(developer.handle),
        communityRoleLabels[developer.role],
        developer.specialty,
        developer.focusAreas?.length
          ? `Focus areas: ${developer.focusAreas.join(", ")}`
          : null,
        developer.projects?.length
          ? `Projects: ${developer.projects.map(formatProject).join(", ")}`
          : null,
        developer.github ? `GitHub: ${developer.github}` : null,
        developer.website ? `Website: ${developer.website}` : null,
      ].filter((value): value is string => Boolean(value));

      lines.push(`- **${developer.name}**: ${details.join("; ")}`);
    }
  }

  return lines.join("\n");
}

function renderCompanyLinks(company: Company): string[] {
  const links = [
    company.website ? `- Website: ${company.website}` : null,
    company.docs ? `- Docs: ${company.docs}` : null,
    company.github ? `- GitHub: ${company.github}` : null,
    company.discord ? `- Discord: ${company.discord}` : null,
  ].filter((value): value is string => Boolean(value));

  if (links.length === 0) {
    return [];
  }

  return ["## Links", "", ...links];
}

function formatXHandle(handle: string): string {
  const username = handle.startsWith("@") ? handle.slice(1) : handle;

  return `[${handle}](https://x.com/${username})`;
}

function formatProject(project: { name: string; url?: string }): string {
  if (!project.url) {
    return project.name;
  }

  return `[${project.name}](${project.url})`;
}

function getStats(): {
  companyCount: number;
  peopleCount: number;
  contactEntryCount: number;
} {
  const uniqueHandles = new Set<string>();
  let contactEntryCount = 0;

  for (const company of companies) {
    for (const category of company.categories) {
      contactEntryCount += category.contacts.length;

      for (const contact of category.contacts) {
        for (const handle of contact.handles) {
          uniqueHandles.add(handle.toLowerCase());
        }
      }
    }
  }

  return {
    companyCount: companies.length,
    peopleCount: uniqueHandles.size,
    contactEntryCount,
  };
}

function renderLlmsTxtBody(): string {
  return renderLlmsTxt({
    brandName: "who to bother on X",
    description:
      "A directory for finding the right people to reach out to at tech companies on X.",
    sections: [
      {
        title: "Site pages",
        links: staticPages.map((page) => ({
          title: page.title,
          href: `${BASE_URL}${toMarkdownPath(page.path)}`,
          description: page.description,
        })),
      },
      {
        title: "Company contact pages",
        links: companies.map((company) => ({
          title: company.name,
          href: `${BASE_URL}${toMarkdownPath(`/${company.id}`)}`,
          description: company.description,
        })),
      },
    ],
  });
}
