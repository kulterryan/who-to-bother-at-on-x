import { container, text } from "@takumi-rs/helpers";
import { createFileRoute } from "@tanstack/react-router";
import type { Company } from "@/types/company";

// Regex patterns for font URL extraction (top-level for performance)
const FONT_URL_PATTERN = /url\(([^)]+\.woff2[^)]*)\)/;
const SIMPLE_FONT_URL_PATTERN =
  /(https:\/\/fonts\.gstatic\.com\/[^\s'")]+\.woff2)/;
const QUOTE_TRIM_PATTERN = /^['"]|['"]$/g;

// Helper function to build company data map
function getCompanyDataMap(): Record<string, Company> {
  // Auto-discover all company JSON files using Vite's import.meta.glob
  // Path is relative to src/app/og/ so need to go up two levels
  const companyModules = import.meta.glob<{ default: Company }>(
    "../../data/companies/*.json",
    { eager: true }
  );

  // Build company data map from discovered files
  return Object.entries(companyModules).reduce(
    (acc, [path, module]) => {
      const filename = path.split("/").pop()?.replace(".json", "") || "";
      // Filter out schema and template files
      if (
        filename &&
        !filename.includes("schema") &&
        !filename.includes("template")
      ) {
        acc[module.default.id] = module.default;
      }
      return acc;
    },
    {} as Record<string, Company>
  );
}

// Helper function to extract font URL from CSS
function extractFontUrl(cssText: string): string {
  const fontFaces = cssText.split("@font-face");
  for (const face of fontFaces) {
    const urlMatch = face.match(FONT_URL_PATTERN);
    if (urlMatch?.[1]) {
      return urlMatch[1].trim().replace(QUOTE_TRIM_PATTERN, "");
    }
  }

  const simpleMatch = cssText.match(SIMPLE_FONT_URL_PATTERN);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  // Fallback to jsDelivr CDN
  return "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-400-normal.woff2";
}

// Helper function to fetch font buffer
async function fetchFontBuffer(fontUrl: string): Promise<ArrayBuffer> {
  const fontRes = await fetch(fontUrl);
  if (fontRes.ok) {
    return fontRes.arrayBuffer();
  }

  if (fontUrl.includes("fonts.gstatic.com")) {
    console.warn("Google Fonts failed, trying jsDelivr CDN");
    const jsdelivrUrl =
      "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-400-normal.woff2";
    const jsdelivrRes = await fetch(jsdelivrUrl);
    if (jsdelivrRes.ok) {
      return jsdelivrRes.arrayBuffer();
    }
    throw new Error(
      `Failed to fetch font from ${fontUrl} (${fontRes.status}) and fallback (${jsdelivrRes.status})`
    );
  }

  throw new Error(
    `Failed to fetch font file from ${fontUrl}: ${fontRes.status}`
  );
}

export const Route = createFileRoute("/og/$company")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { company } = params;

        // Get company data
        const companyDataMap = getCompanyDataMap();
        const companyData = companyDataMap[company];

        if (!companyData) {
          return new Response("Company not found", { status: 404 });
        }

        try {
          // Dynamically import Takumi modules only on the server
          const { initSync, Renderer } = await import("@takumi-rs/wasm");
          const wasmModule = await import(
            "@takumi-rs/wasm/takumi_wasm_bg.wasm"
          );

          // Load DM Sans variable font from Google Fonts CDN
          // Fetch CSS and extract font URL, with improved parsing
          const cssUrl =
            "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap";
          const cssRes = await fetch(cssUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (!cssRes.ok) {
            throw new Error(`Failed to fetch CSS: ${cssRes.status}`);
          }

          const cssText = await cssRes.text();

          // Extract and fetch font
          const fontUrl = extractFontUrl(cssText);
          const fontBuffer = await fetchFontBuffer(fontUrl);

          // Initialize WASM
          initSync({ module: wasmModule.default });
          const renderer = new Renderer();

          // Load variable font (supports multiple weights including 400 and 700)
          renderer.loadFont({
            data: fontBuffer,
            name: "DM Sans",
          });

          // Create the OG image layout using Takumi helpers
          const layout = container({
            style: {
              width: 1200,
              height: 630,
              backgroundColor: "#1a1a1a",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 80,
            },
            children: [
              text(companyData.name, {
                fontSize: 72,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
                textAlign: "center",
              }),
              text(`who to bother at ${companyData.name} on X`, {
                fontSize: 36,
                fontWeight: 400,
                color: "#f97316",
                marginBottom: 32,
                textAlign: "center",
              }),
              text(companyData.description, {
                fontSize: 28,
                fontWeight: 400,
                color: "#a1a1aa",
                textAlign: "center",
                maxWidth: 900,
                lineHeight: 1.4,
              }),
            ],
          });

          // Render to PNG
          const pngBuffer = renderer.render(layout, {
            width: 1200,
            height: 630,
            format: "png",
          });

          // Return PNG response with appropriate headers
          // Response accepts Uint8Array/ArrayBufferView, but TypeScript needs help with the type
          return new Response(pngBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          // Log detailed error information for debugging
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error("Failed to generate OG image:", {
            message: errorMessage,
            stack: errorStack,
            company,
            error,
          });
          return new Response(`Failed to generate OG image: ${errorMessage}`, {
            status: 500,
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }
      },
    },
  },
});
