import { container, text } from "@takumi-rs/helpers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/opengraph")({
  server: {
    handlers: {
      GET: async () => {
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
              /(https:\/\/fonts\.gstatic\.com\/[^\s'")]+\.woff2)/
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
                `Failed to fetch font from ${fontUrl} (${fontRes.status}) and fallback (${jsdelivrRes.status})`
              );
            }
          } else {
            throw new Error(
              `Failed to fetch font file from ${fontUrl}: ${fontRes.status}`
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

          // Create the OG image layout for homepage
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
              text("who to bother on X", {
                fontSize: 72,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
                textAlign: "center",
              }),
              text(
                "Find the right people to reach out to at your favorite tech companies",
                {
                  fontSize: 36,
                  fontWeight: 400,
                  color: "#f97316",
                  marginBottom: 32,
                  textAlign: "center",
                }
              ),
              text(
                "A community-maintained directory to help developers find the right people to reach out to at tech companies on X (formerly Twitter).",
                {
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#a1a1aa",
                  textAlign: "center",
                  maxWidth: 900,
                  lineHeight: 1.4,
                }
              ),
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
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error("Failed to generate homepage OG image:", {
            message: errorMessage,
            stack: errorStack,
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
