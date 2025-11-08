import { createFileRoute } from '@tanstack/react-router';
import type { Company } from '@/types/company';
import { container, text } from '@takumi-rs/helpers';

// Helper function to build company data map
function getCompanyDataMap(): Record<string, Company> {
  // Auto-discover all company JSON files using Vite's import.meta.glob
  const companyModules = import.meta.glob<{ default: Company }>(
    '../data/companies/*.json',
    { eager: true }
  );

  // Build company data map from discovered files
  return Object.entries(companyModules).reduce(
    (acc, [path, module]) => {
      const filename = path.split('/').pop()?.replace('.json', '') || '';
      // Filter out schema and template files
      if (filename && !filename.includes('schema') && !filename.includes('template')) {
        acc[module.default.id] = module.default;
      }
      return acc;
    },
    {} as Record<string, Company>
  );
}

export const Route = createFileRoute('/og/$company')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { company } = params;
        const url = new URL(request.url);
        
        // Get company data
        const companyDataMap = getCompanyDataMap();
        const companyData = companyDataMap[company];
        
        if (!companyData) {
          return new Response('Company not found', { status: 404 });
        }
        
        try {
          // Dynamically import Takumi modules only on the server
          const { initSync, Renderer } = await import('@takumi-rs/wasm');
          const wasmModule = await import('@takumi-rs/wasm/takumi_wasm_bg.wasm');
          const fontRegularUrl = await import('@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url');
          const fontBoldUrl = await import('@fontsource-variable/dm-sans/files/dm-sans-latin-ext-wght-normal.woff2?url');
          
          // Fetch font files as ArrayBuffer
          const [fontRegularRes, fontBoldRes] = await Promise.all([
            fetch(new URL(fontRegularUrl.default, url.origin)),
            fetch(new URL(fontBoldUrl.default, url.origin)),
          ]);
          
          if (!fontRegularRes.ok || !fontBoldRes.ok) {
            throw new Error(`Failed to fetch fonts: ${fontRegularRes.status} ${fontBoldRes.status}`);
          }
          
          const fontRegularBuffer = await fontRegularRes.arrayBuffer();
          const fontBoldBuffer = await fontBoldRes.arrayBuffer();
          
          // Initialize WASM
          initSync({ module: wasmModule.default });
          const renderer = new Renderer();
          
          // Load fonts
          renderer.loadFont({
            data: fontRegularBuffer,
            name: 'DM Sans',
            weight: 400,
            style: 'normal',
          });
          
          renderer.loadFont({
            data: fontBoldBuffer,
            name: 'DM Sans',
            weight: 700,
            style: 'normal',
          });
          
          // Create the OG image layout using Takumi helpers
          const layout = container({
            style: {
              width: 1200,
              height: 630,
              backgroundColor: '#1a1a1a',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 80,
            },
            children: [
              text(companyData.name, {
                fontSize: 72,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 24,
                textAlign: 'center',
              }),
              text(`who to bother at ${companyData.name} on X`, {
                fontSize: 36,
                fontWeight: 400,
                color: '#f97316',
                marginBottom: 32,
                textAlign: 'center',
              }),
              text(companyData.description, {
                fontSize: 28,
                fontWeight: 400,
                color: '#a1a1aa',
                textAlign: 'center',
                maxWidth: 900,
                lineHeight: 1.4,
              }),
            ],
          });
          
          // Render to PNG
          const pngBuffer = renderer.render(layout, {
            width: 1200,
            height: 630,
            format: 'png',
          });
          
          // Return PNG response with appropriate headers
          // Response accepts Uint8Array/ArrayBufferView, but TypeScript needs help with the type
          return new Response(pngBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        } catch (error) {
          console.error('Failed to generate OG image:', error);
          return new Response('Failed to generate OG image', { status: 500 });
        }
      },
    },
  },
});

