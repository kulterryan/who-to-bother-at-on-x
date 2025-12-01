import { createFileRoute } from "@tanstack/react-router";
import type { Company } from "@/types/company";

const BASE_URL = "https://who-to-bother-at.com";

// Auto-discover all company JSON files (excluding templates and schema)
const companyModules = import.meta.glob<{ default: Company }>(
	"../data/companies/*.json",
	{ eager: true },
);

// Extract company IDs from the loaded modules
const companyIds = Object.entries(companyModules)
	.filter(([path]) => !path.includes("template") && !path.includes("schema"))
	.map(([_, module]) => module.default.id);

// Static pages in the site
const staticPages = [
	{ path: "/", priority: "1.0", changefreq: "daily" },
	{ path: "/search", priority: "0.8", changefreq: "weekly" },
	{ path: "/sponsors", priority: "0.5", changefreq: "monthly" },
	{ path: "/stats", priority: "0.6", changefreq: "weekly" },
];

function generateSitemapXml(): string {
	const today = new Date().toISOString().split("T")[0];

	const staticUrls = staticPages
		.map(
			(page) => `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
		)
		.join("\n");

	const companyUrls = companyIds
		.map(
			(id) => `  <url>
    <loc>${BASE_URL}/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${companyUrls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap/xml")({
	server: {
		handlers: {
			GET: async () => {
				const xml = generateSitemapXml();

				return new Response(xml, {
					status: 200,
					headers: {
						"Content-Type": "application/xml",
						"Cache-Control": "public, max-age=3600, s-maxage=3600",
					},
				})
			},
		},
	},
});
