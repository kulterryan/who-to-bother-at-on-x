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
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <Link
          className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <button
          className="rounded-lg bg-secondary px-3 py-1.5 font-medium text-muted-foreground text-sm transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-95"
          onClick={handleSignOut}
          type="button"
        >
          Sign Out
        </button>
      </div>

      {/* Welcome Card */}
      <div className="rounded-2xl bg-card p-6 animate-scale-in">
        <div className="mb-5 flex items-center gap-4">
          {session?.user?.image ? (
            <img
              alt={session.user.name || "User"}
              className="h-14 w-14 rounded-full"
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
            <h2 className="font-semibold text-foreground text-xl">
              Welcome, {session?.user?.name || "User"}!
            </h2>
            <p className="text-muted-foreground text-sm">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <p className="font-medium text-green-700 text-sm dark:text-green-400">
            Authentication is working!
          </p>
          <p className="mt-1 text-green-600 text-xs dark:text-green-500">
            You've successfully authenticated with GitHub. This page is protected by the auth middleware.
          </p>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-4 rounded-2xl bg-card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <h3 className="mb-3 font-semibold text-foreground">Session Details</h3>
        <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-secondary-foreground text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      {/* Quick Links */}
      <div className="mt-4 flex gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Link
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-card py-3 font-medium text-foreground text-sm transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98]"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>
        <Link
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent py-3 font-medium text-accent-foreground text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          to="/search"
        >
          Search Companies
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
