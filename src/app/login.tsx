import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <title>Loading spinner</title>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-semibold text-foreground text-xl">
            You're already signed in
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Welcome back, {session.user?.name || session.user?.email}!
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-foreground text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
            to="/"
          >
            Go to Home
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <main className="mx-auto w-full max-w-sm px-6 animate-scale-in">
        <div className="rounded-2xl bg-card p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <Link className="inline-block" to="/">
              <h1 className="flex items-center justify-center gap-2 font-semibold text-foreground text-lg">
                who to bother on{" "}
                <svg className="inline-block" fill="none" height="16" viewBox="0 0 1200 1227" width="18">
                  <title>X (Twitter) logo</title>
                  <path
                    d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                    fill="currentColor"
                  />
                </svg>
              </h1>
            </Link>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Sign in to your account
            </p>
          </div>

          {/* GitHub Login */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
            onClick={handleGitHubLogin}
            type="button"
          >
            <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
              <title>GitHub logo</title>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-border/40 border-t" />
            <span className="px-3 text-muted-foreground text-xs">or</span>
            <div className="flex-1 border-border/40 border-t" />
          </div>

          {/* Back to Home */}
          <Link
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-medium text-foreground text-sm transition-all duration-200 hover:bg-secondary/80 active:scale-95"
            to="/"
          >
            <ArrowLeft className="size-3.5" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
