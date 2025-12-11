import { container, text } from "@takumi-rs/helpers";
import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";

// Define search params schema
const searchSchema = v.object({
	q: v.optional(v.string(), ""),
});

export const Route = createFileRoute("/og/search")({
	validateSearch: (search) => v.parse(searchSchema, search),
	server: {
		handlers: {
			GET: async ({ request }) => {
				// Get query parameter from URL
				const url = new URL(request.url);
				const query = url.searchParams.get("q") || "";

				if (!query) {
					return new Response("Query parameter required", { status: 400 });
				}

				try {
					// Dynamically import Takumi modules only on the server
					const { initSync, Renderer } = await import("@takumi-rs/wasm");
					const wasmModule = await import(
						"@takumi-rs/wasm/takumi_wasm_bg.wasm"
					);

					// Load DM Sans variable font from Google Fonts CDN
					let fontBuffer: ArrayBuffer;

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

					// Extract WOFF2 URL
					let fontUrl: string | null = null;

					const fontFaces = cssText.split("@font-face");
					for (const face of fontFaces) {
						const urlMatch = face.match(/url\(([^)]+\.woff2[^)]*)\)/);
						if (urlMatch && urlMatch[1]) {
							fontUrl = urlMatch[1].trim().replace(/^['"]|['"]$/g, "");
							break;
						}
					}

					if (!fontUrl) {
						const simpleMatch = cssText.match(
							/(https:\/\/fonts\.gstatic\.com\/[^\s'")]+\.woff2)/,
						);
						if (simpleMatch && simpleMatch[1]) {
							fontUrl = simpleMatch[1];
						}
					}

					if (!fontUrl) {
						console.warn("Falling back to jsDelivr CDN for DM Sans font");
						fontUrl =
							"https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-400-normal.woff2";
					}

					// Fetch the font file
					const fontRes = await fetch(fontUrl);
					if (fontRes.ok) {
						fontBuffer = await fontRes.arrayBuffer();
					} else if (fontUrl.includes("fonts.gstatic.com")) {
							console.warn("Google Fonts failed, trying jsDelivr CDN");
							const jsdelivrUrl =
								"https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-400-normal.woff2";
							const jsdelivrRes = await fetch(jsdelivrUrl);
							if (jsdelivrRes.ok) {
								fontBuffer = await jsdelivrRes.arrayBuffer();
							} else {
								throw new Error(
									`Failed to fetch font from ${fontUrl} (${fontRes.status}) and fallback (${jsdelivrRes.status})`,
								);
							}
						} else {
							throw new Error(
								`Failed to fetch font file from ${fontUrl}: ${fontRes.status}`,
							);
						}

					// Initialize WASM
					initSync({ module: wasmModule.default });
					const renderer = new Renderer();

					// Load variable font
					renderer.loadFont({
						data: fontBuffer,
						name: "DM Sans",
					});

					// Create the OG image layout for search results
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
							text("Search Results", {
								fontSize: 48,
								fontWeight: 700,
								color: "#a1a1aa",
								marginBottom: 24,
								textAlign: "center",
							}),
							text(`"${query}"`, {
								fontSize: 72,
								fontWeight: 700,
								color: "#ffffff",
								marginBottom: 32,
								textAlign: "center",
								maxWidth: 1000,
							}),
							text("who to bother on X", {
								fontSize: 36,
								fontWeight: 400,
								color: "#f97316",
								textAlign: "center",
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
					return new Response(pngBuffer as unknown as BodyInit, {
						status: 200,
						headers: {
							"Content-Type": "image/png",
							"Cache-Control": "public, max-age=3600",
						},
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					const errorStack = error instanceof Error ? error.stack : undefined;
					console.error("Failed to generate search OG image:", {
						message: errorMessage,
						stack: errorStack,
						query,
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
