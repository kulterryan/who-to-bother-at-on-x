#!/usr/bin/env tsx

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://who-to-bother-at.com";
const companiesDir = path.join(__dirname, "../data/companies");
const outputPath = path.join(__dirname, "../../public/sitemap.xml");

// Static pages in the site
const staticPages = [
	{ path: "/", priority: "1.0", changefreq: "daily" },
	{ path: "/search", priority: "0.8", changefreq: "weekly" },
	{ path: "/sponsors", priority: "0.5", changefreq: "monthly" },
	{ path: "/stats", priority: "0.6", changefreq: "weekly" },
];

/**
 * Get all company IDs from JSON files in the companies directory
 */
function getCompanyIds(): string[] {
	const files = fs.readdirSync(companiesDir);

	return files
		.filter(
			(file) =>
				file.endsWith(".json") &&
				!file.includes("template") &&
				!file.includes("schema"),
		)
		.map((file) => {
			const filePath = path.join(companiesDir, file);
			const content = fs.readFileSync(filePath, "utf-8");
			const company = JSON.parse(content);
			return company.id;
		})
		.filter(Boolean);
}

/**
 * Generate sitemap XML content
 */
function generateSitemapXml(companyIds: string[]): string {
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

/**
 * Main function to generate sitemap
 */
async function generateSitemap(): Promise<void> {
	console.log("🗺️  Generating sitemap.xml...\n");

	try {
		// Get all company IDs
		const companyIds = getCompanyIds();
		console.log(`📦 Found ${companyIds.length} companies`);

		// Generate XML content
		const xml = generateSitemapXml(companyIds);

		// Write to public directory
		fs.writeFileSync(outputPath, xml, "utf-8");

		const totalUrls = staticPages.length + companyIds.length;
		console.log(`\n📊 Generated sitemap with ${totalUrls} URLs`);
		console.log(`   - ${staticPages.length} static pages`);
		console.log(`   - ${companyIds.length} company pages`);
		console.log("\n✅ Sitemap generated at: public/sitemap.xml");
	} catch (error) {
		console.error("❌ Failed to generate sitemap:", error);
		process.exit(1);
	}
}

// Run generation
generateSitemap().catch((error) => {
	console.error("💥 Unexpected error:", error);
	process.exit(1);
});
