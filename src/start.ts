import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

// Middleware to redirect /vercel to the official Vercel site
const vercelRedirectMiddleware = createMiddleware().server(
  ({ next, request }) => {
    const url = new URL(request.url);

    // Check if the path is /vercel
    if (url.pathname === "/vercel") {
      // Perform a redirect to the official Vercel site
      throw redirect({
        href: "https://who-to-bother-at.vercel.app/",
        statusCode: 302,
      });
    }

    // Continue with the normal request flow
    return next();
  }
);

export const startInstance = createStart(() => ({
  requestMiddleware: [vercelRedirectMiddleware],
}));
