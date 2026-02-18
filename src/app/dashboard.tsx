import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { authMiddleware } from "@/lib/auth-middleware";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      ...seo({
        title: "Dashboard | who to bother on X",
        description: "Your personal dashboard.",
        keywords: "dashboard, account, profile",
        url: "https://who-to-bother-at.com/dashboard",
        image: "https://who-to-bother-at.com/opengraph",
      }),
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: DashboardPage,
  server: {
    middleware: [authMiddleware],
  },
});

function DashboardPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <main className="mx-auto max-w-4xl px-6 pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="mb-8 flex items-center justify-between">
        <Link
          className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <button
          className="rounded-lg border border-border px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:border-destructive hover:text-destructive"
          onClick={handleSignOut}
          type="button"
        >
          Sign Out
        </button>
      </div>

      {/* Welcome Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-4">
          {session?.user?.image ? (
            <img
              alt={session.user.name || "User"}
              className="h-14 w-14 rounded-full border border-border"
              height={56}
              src={session.user.image}
              width={56}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-xl">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-card-foreground text-xl">
              Welcome, {session?.user?.name || "User"}!
            </h2>
            <p className="text-muted-foreground text-sm">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
          <p className="font-medium text-green-700 text-sm dark:text-green-400">
            Authentication is working!
          </p>
          <p className="mt-1 text-green-600 text-xs dark:text-green-500">
            You've successfully authenticated with GitHub. This page is protected by the auth middleware.
          </p>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-3 font-semibold text-card-foreground">Session Details</h3>
        <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-secondary-foreground text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      {/* Quick Links */}
      <div className="mt-4 flex gap-3">
        <Link
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 font-medium text-card-foreground text-sm transition-all hover:border-accent/40"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>
        <Link
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-3 font-medium text-accent-foreground text-sm transition-opacity hover:opacity-90"
          to="/search"
        >
          Search Companies
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
