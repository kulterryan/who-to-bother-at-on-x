import { createFileRoute, Link } from "@tanstack/react-router";
import { signIn, useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      ...seo({
        title: "Login | who to bother on X",
        description: "Sign in to your account using GitHub.",
        keywords: "login, sign in, authentication, GitHub",
        url: "https://who-to-bother-at.com/login",
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
  component: LoginPage,
});

function LoginPage() {
  const { data: session, isPending } = useSession();

  const handleGitHubLogin = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/contribute",
    });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Loading spinner</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-900 dark:text-zinc-100">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 font-medium text-2xl">
            You're already signed in
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Welcome back, {session.user?.name || session.user?.email}!
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
            to="/"
          >
            Go to Home
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Arrow right</title>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-md px-6">
        <div className="rounded-xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-8 text-center">
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
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Sign in to your account
            </p>
          </div>

          {/* GitHub Login Button */}
          <button
            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-zinc-200 bg-zinc-900 px-6 py-3 font-medium text-white transition-all hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={handleGitHubLogin}
            type="button"
          >
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
              <title>GitHub logo</title>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-zinc-200 border-t dark:border-zinc-700" />
            <span className="px-4 text-sm text-zinc-500">or</span>
            <div className="flex-1 border-zinc-200 border-t dark:border-zinc-700" />
          </div>

          {/* Back to Home */}
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 px-6 py-3 font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            to="/"
          >
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Back arrow</title>
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
