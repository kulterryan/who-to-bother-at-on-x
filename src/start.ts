import { createMiddleware, createStart } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

// Middleware to redirect /vercel to the official Vercel site
const vercelRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  
  // Check if the path is /vercel
  if (url.pathname === '/vercel') {
    // Perform a redirect to the official Vercel site
    throw redirect({
      href: 'https://who-to-bother-at.vercel.app/',
      statusCode: 302,
    })
  }
  
  // Continue with the normal request flow
  return next()
})

const laravelRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
    const url = new URL(request.url);

    // Check if the path is /laravel
    if (url.pathname === "/laravel") {
      // Perform a redirect to the official Laravel site
      throw redirect({
        href: "https://who-to-bother-at.laravel.cloud/",
        statusCode: 302,
      });
    }

    // Continue with the normal request flow
    return next();
  }
);

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [vercelRedirectMiddleware, laravelRedirectMiddleware],
  };
})

