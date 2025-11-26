// vite.config.ts

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3311,
    hmr: {
      protocol: 'ws',
      port: 3311,
      overlay: true,
      timeout: 30000, // Increase timeout to 30 seconds
    },
    watch: {
      // Disable polling for better performance
      usePolling: false,
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    // Enables Vite to resolve imports using path aliases.
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: "src", // This is the default
      router: {
        routesDirectory: 'app', // Defaults to "routes", relative to srcDirectory
      }
    }),
    viteReact(),
  ],
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [{ name: 'vendor', test: /\/react(?:-dom)?/ }]
        }
      }
    }
  }
})