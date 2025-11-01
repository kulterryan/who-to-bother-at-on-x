import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import appCss from "./globals.css?url"
import { getThemeServerFn } from '@/lib/theme';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/theme-toggle';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'who to bother on X' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
  loader: () => getThemeServerFn(),
  ssr: true,
});

function RootLayout() {
  const theme = Route.useLoaderData();
  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <head>
        <title>who to bother at</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Outlet />
          <ModeToggle />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#000', 
          color: '#fff', 
          textDecoration: 'none', 
          borderRadius: '0.5rem' 
        }}
      >
        Go Home
      </a>
    </div>
  );
}
