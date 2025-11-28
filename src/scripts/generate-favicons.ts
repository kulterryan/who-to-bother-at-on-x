#!/usr/bin/env tsx

import * as fs from "fs";
import * as path from "path";
import { renderToString } from "react-dom/server";
import { fileURLToPath } from "url";
import { companyLogos } from "../components/company-logos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../../public/company-logos");

/**
 * Generates SVG favicon files from company logo components
 */
async function generateFavicons(): Promise<void> {
	console.log("🎨 Generating favicon SVG files...\n");

	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		console.log(`📁 Created directory: ${outputDir}`);
	}

	let generatedCount = 0;

	// Generate SVG file for each company logo
	for (const [name, component] of Object.entries(companyLogos)) {
		try {
			// Render React component to string
			let svgString = renderToString(component);

			// Remove className attributes as they are not needed for favicons
			svgString = svgString.replace(/ class="[^"]*"/g, "");

			// Remove background rectangles/paths that fill the entire viewBox
			// These typically start at origin (0,0) or (-x,-y) and cover the full dimensions
			svgString = svgString.replace(
				/<path[^>]*d="M0 0h\d+v\d+H0z?"[^>]*><\/path>/g,
				"",
			);
			svgString = svgString.replace(
				/<path[^>]*d="M-?\d+ -?\d+h\d+v\d+H-?\d+z?"[^>]*><\/path>/g,
				"",
			);
			svgString = svgString.replace(
				/<rect[^>]*x="-?\d+"[^>]*y="-?\d+"[^>]*width="\d+"[^>]*height="\d+"[^>]*><\/rect>/g,
				"",
			);

			// Replace currentColor with a CSS variable that will be styled with media queries
			svgString = svgString.replace(
				/fill="currentColor"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/stroke="currentColor"/g,
				'stroke="var(--favicon-color)"',
			);

			// Replace all color fills with theme-aware color (just use one color for simplicity)
			svgString = svgString.replace(
				/fill="black"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="#000"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="#000000"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="#32302C"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="white"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="#fff"/g,
				'fill="var(--favicon-color)"',
			);
			svgString = svgString.replace(
				/fill="#ffffff"/g,
				'fill="var(--favicon-color)"',
			);

			// Clean up extra attributes from react-dom/server
			svgString = svgString.replace(/ data-reactroot=""/g, "");

			// Add CSS with media query for theme-based colors
			// Dark mode = light favicon, Light mode = dark favicon
			const styleTag = `<style>:root{--favicon-color:#000}@media(prefers-color-scheme:dark){:root{--favicon-color:#fff}}</style>`;

			// Insert style tag after the opening SVG tag
			svgString = svgString.replace(/(<svg[^>]*>)/, `$1${styleTag}`);

			// Add XML declaration for valid standalone SVG
			svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

			// Write to file
			const filePath = path.join(outputDir, `${name}.svg`);
			fs.writeFileSync(filePath, svgString, "utf-8");

			console.log(`✅ Generated ${name}.svg`);
			generatedCount++;
		} catch (error) {
			console.error(`❌ Failed to generate ${name}.svg:`, error);
			process.exit(1);
		}
	}

	console.log(`\n📊 Generated ${generatedCount} favicon files`);
	console.log(`✅ Favicon generation complete!`);
}

// Run generation
generateFavicons().catch((error) => {
	console.error("💥 Unexpected error:", error);
	process.exit(1);
});
