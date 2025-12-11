import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  // GitHub OAuth provider
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      // Request public_repo scope for creating PRs
      scope: ["read:user", "user:email", "public_repo"],
    },
  },

  // Stateless session configuration (no database required)
  // See: https://www.better-auth.com/docs/concepts/session-management#stateless-session-management
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days cache duration
      strategy: "jwe", // Encrypted tokens for security
      refreshCache: true, // Enable stateless refresh
    },
  },

  // Store account data in cookie for stateless OAuth (includes access tokens)
  account: {
    accountLinking: {
      enabled: true,
    },
    storeStateStrategy: "cookie",
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie
  },

  // This plugin must be last in the plugins array
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
