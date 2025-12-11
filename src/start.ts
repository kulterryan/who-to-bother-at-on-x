import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

// Middleware to redirect to the official site
const redirectMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url);

    // Check if the path is /vercel
    if (url.pathname === "/vercel") {
      // Perform a redirect to the official Vercel site
      throw redirect({
        href: "https://who-to-bother-at.vercel.app/",
        statusCode: 302,
      });
    }

    if (url.pathname === "/sitemap.xml") {
      // Perform a redirect to the official sitemap
      throw redirect({
        href: "https://who-to-bother-at.com/sitemap/xml",
        statusCode: 302,
      });
    }

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

export const startInstance = createStart(() => ({
  requestMiddleware: [redirectMiddleware],
}));
