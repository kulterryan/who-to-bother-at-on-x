import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GithubIcon, HeartIcon } from "lucide-react";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { seo } from "@/lib/seo";

type Sponsor = {
  name: string;
  twitterHandle: string;
  githubHandle: string;
  tier: "gold" | "silver" | "bronze";
};

const getAvatarUrl = (twitterHandle: string) =>
  `https://unavatar.io/twitter/${twitterHandle}`;

const sponsors: Sponsor[] = [
  {
    name: "Brandon McConnell",
    twitterHandle: "branmcconnell",
    githubHandle: "brandonmcconnell",
    tier: "gold",
  },
];

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      ...seo({
        title: "Sponsors | who to bother on X",
        description: "Support the project and see our amazing sponsors.",
        keywords: "sponsors, support, github sponsors, open source",
        url: "https://who-to-bother-at.com/sponsors",
        image: "https://who-to-bother-at.com/opengraph",
      }),
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: SponsorsPage,
});

function SponsorsPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="flex flex-col gap-3 animate-fade-in">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
          Sponsors
        </h1>
        <p className="text-muted-foreground text-sm">
          Support the development and maintenance of this project.
        </p>
      </div>

      {/* Sponsors Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sponsors.map((sponsor, i) => (
          <div
            className="flex items-center gap-4 rounded-2xl bg-card p-5 transition-all duration-200 hover:bg-secondary/80 animate-scale-in"
            key={sponsor.name}
            style={{ animationDelay: `${0.05 * i + 0.05}s` }}
          >
            <Avatar className="size-14">
              <AvatarImage
                alt={sponsor.name}
                src={getAvatarUrl(sponsor.twitterHandle)}
              />
              <AvatarFallback className="bg-secondary text-lg text-muted-foreground">
                {sponsor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate font-semibold text-foreground">
                {sponsor.name}
              </span>
              <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                {sponsor.twitterHandle ? (
                  <a
                    className="flex w-fit items-center gap-1.5 transition-colors duration-200 hover:text-accent"
                    href={`https://x.com/${sponsor.twitterHandle}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <svg
                      className="inline-block size-3"
                      fill="none"
                      viewBox="0 0 1200 1227"
                    >
                      <title>X (Twitter) logo</title>
                      <path
                        d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                        fill="currentColor"
                      />
                    </svg>
                    @{sponsor.twitterHandle}
                  </a>
                ) : null}
                {sponsor.githubHandle ? (
                  <a
                    className="flex w-fit items-center gap-1.5 transition-colors duration-200 hover:text-accent"
                    href={`https://github.com/${sponsor.githubHandle}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <GithubIcon className="size-3" />
                    {sponsor.githubHandle}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {/* Become a Sponsor */}
        <a
          className="flex items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-card/50 p-5 transition-all duration-200 hover:bg-card hover:border-accent/40 animate-scale-in"
          href="https://github.com/sponsors/kulterryan"
          rel="noopener noreferrer"
          style={{ animationDelay: '0.1s' }}
          target="_blank"
        >
          <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-border/60">
            <HeartIcon className="size-6 text-accent" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">
              Become a sponsor
            </span>
            <span className="text-muted-foreground text-xs">
              Support this project
            </span>
          </div>
        </a>
      </div>

      <Footer />
    </main>
  );
}
