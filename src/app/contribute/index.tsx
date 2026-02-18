import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, GitPullRequest, LogIn, Plus } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contribute/")({
  head: () => ({
    meta: [
      ...seo({
        title: "Contribute | who to bother on X",
        description:
          "Add your company or update existing company information. Submit a PR directly from the website.",
        keywords: "contribute, add company, edit company, pull request",
        url: "https://who-to-bother-at.com/contribute",
        image: "https://who-to-bother-at.com/opengraph",
      }),
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: ContributePage,
});

function ContributePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Loading spinner</title>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

  return (
    <main className="mx-auto max-w-4xl px-6 pt-8 pb-20 md:pt-12 md:pb-28">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 animate-fade-in">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
          Contribute
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Add your company to the directory. Your changes will be submitted as a pull request.
        </p>
      </div>

      {/* Not Logged In */}
      {!session && (
        <div className="rounded-2xl bg-card p-8 text-center animate-scale-in">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <LogIn className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Sign in to Contribute</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            You need to sign in with GitHub to submit contributions. This allows us to create pull requests on your behalf.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
            to="/login"
          >
            <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
              <title>GitHub logo</title>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </Link>
        </div>
      )}

      {/* Logged In */}
      {session ? (
        <>
          {/* User Info */}
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-green-50 p-4 dark:bg-green-950/30 animate-fade-in">
            {session.user?.image ? (
              <img
                alt={session.user.name || "User"}
                className="h-10 w-10 rounded-full"
                height={40}
                src={session.user.image}
                width={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-semibold text-sm text-white">
                {session.user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="font-medium text-green-700 text-sm dark:text-green-400">
                Signed in as {session.user?.name || session.user?.email}
              </p>
              <p className="text-green-600 text-xs dark:text-green-500">
                Ready to contribute via GitHub
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              className="group rounded-2xl bg-card p-6 transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98] animate-scale-in"
              to="/contribute/add"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Add New Company</h3>
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                Add a new company with contact information and logo.
              </p>
              <div className="mt-4 flex items-center gap-1.5 font-medium text-accent text-xs">
                <span>Get started</span>
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>

          {/* How it Works */}
          <div className="mt-12">
            <h3 className="mb-4 font-semibold text-foreground text-lg">How it Works</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { step: "1", title: "Fill out the form", desc: "Enter company details, contacts, and upload your logo." },
                { step: "2", title: "Submit your changes", desc: "We'll automatically create a pull request on your behalf." },
                { step: "3", title: "Get it reviewed", desc: "A maintainer will review and merge your contribution." },
              ].map((item, i) => (
                <div className="rounded-2xl bg-card p-5 animate-slide-up" key={item.step} style={{ animationDelay: `${0.05 * i + 0.1}s` }}>
                  <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono font-bold text-accent-foreground text-xs">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Links */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 border-border/40 border-t pt-8">
        <a
          className="inline-flex items-center gap-1.5 text-muted-foreground text-xs transition-colors duration-200 hover:text-foreground"
          href="https://github.com/kulterryan/cf-who-to-bother-at-on-x"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitPullRequest className="h-3.5 w-3.5" />
          View Repository
        </a>
        <a
          className="inline-flex items-center gap-1.5 text-muted-foreground text-xs transition-colors duration-200 hover:text-foreground"
          href="https://github.com/kulterryan/cf-who-to-bother-at-on-x/blob/main/CONTRIBUTING.md"
          rel="noopener noreferrer"
          target="_blank"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Contributing Guide
        </a>
      </div>
    </main>
  );
}
