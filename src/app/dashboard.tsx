import { createFileRoute, Link } from "@tanstack/react-router";
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
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
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
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link className="inline-block" to="/">
            <h1 className="font-medium text-2xl">
              who to bother on{" "}
              <svg
                className="inline-block"
                fill="none"
                height="22"
                viewBox="0 0 1200 1227"
                width="24"
              >
                <title>X (Twitter) logo</title>
                <path
                  d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                  fill="currentColor"
                />
              </svg>
            </h1>
          </Link>
          <button
            className="rounded-lg border-2 border-zinc-200 px-4 py-2 font-medium text-sm transition-colors hover:border-red-500 hover:text-red-500 dark:border-zinc-700 dark:hover:border-red-500"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="rounded-xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-6 flex items-center gap-4">
            {session?.user?.image ? (
              <img
                alt={session.user.name || "User"}
                className="h-16 w-16 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
                src={session.user.image}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 font-bold text-2xl text-white">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-2xl">
                Welcome, {session?.user?.name || "User"}!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <svg
                fill="none"
                height="20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Success checkmark</title>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">🎉 Authentication is working!</span>
            </div>
            <p className="mt-2 text-green-600 text-sm dark:text-green-500">
              You've successfully authenticated with GitHub. This page is
              protected by the auth middleware.
            </p>
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-6 rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-lg">Session Details</h3>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <Link
            className="flex-1 rounded-lg border-2 border-zinc-200 bg-white p-4 text-center font-medium transition-all hover:border-orange-600 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
            to="/"
          >
            ← Back to Home
          </Link>
          <Link
            className="flex-1 rounded-lg border-2 border-orange-600 bg-orange-600 p-4 text-center font-medium text-white transition-all hover:bg-orange-700"
            to="/search"
          >
            Search Companies →
          </Link>
        </div>
      </main>
    </div>
  );
}
