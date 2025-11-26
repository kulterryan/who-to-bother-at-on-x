import { Outlet, createRootRoute, Scripts, HeadContent } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import appCss from "./globals.css?url"
import dmSansLatinUrl from '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url'
import jetbrainsMonoLatinUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url'
import { ThemeProvider } from '@/components/theme-provider';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { seo } from '@/lib/seo';

const faviconUrl = '/favicon.svg';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: 'theme-color',
        content: '#ea580c',
      },
      {
        name: 'msapplication-TileImage',
        content: faviconUrl,
      },
      ...seo({
        title: "who to bother on X",
        description:
          "Find the right people to reach out to at your favorite tech companies on X (Twitter)",
        keywords:
          "tech companies, contacts, X, Twitter, developers, developer relations, devrel, support",
      }),
    ],
    links: [
      // Preload critical fonts to avoid FOIT
      {
        rel: 'preload',
        href: dmSansLatinUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: jetbrainsMonoLatinUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: faviconUrl,
      },
      {
        rel: 'apple-touch-icon',
        href: faviconUrl,
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
  ssr: true,
});

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: suppress for theme setting for now
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var e=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';document.documentElement.className='system'===e?matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':e}catch{document.documentElement.className=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}}()`,
          }}
        />
        {HeadContent()}
      </head>
      <body>
        <ThemeProvider>
          <NuqsAdapter>
            <Outlet />
          </NuqsAdapter>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", margin: "1rem 0" }}>Page Not Found</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "0.5rem",
        }}
      >
        Go Home
      </a>
    </div>
  );
}
