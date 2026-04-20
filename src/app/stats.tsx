import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";
import { seo } from "@/lib/seo";
import type { Company } from "@/types/company";

const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  {
    eager: true,
  }
);

function calculateStats() {
  const companies = Object.entries(companyModules)
    .filter(([path]) => !(path.includes("template") || path.includes("schema")))
    .map(([_, module]) => module.default);

  const companyCount = companies.length;

  const uniqueHandles = new Set<string>();
  for (const company of companies) {
    for (const category of company.categories) {
      for (const contact of category.contacts) {
        for (const handle of contact.handles) {
          uniqueHandles.add(handle.toLowerCase());
        }
      }
    }
  }

  const peopleCount = uniqueHandles.size;

  const totalContacts = companies.reduce(
    (sum, company) =>
      sum +
      company.categories.reduce(
        (catSum, category) => catSum + category.contacts.length,
        0
      ),
    0
  );

  return { companyCount, peopleCount, totalContacts };
}

const stats = calculateStats();

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      ...seo({
        title: "Stats | who to bother on X",
        description: `Browse ${stats.companyCount} tech companies and ${stats.peopleCount} contacts on X (Twitter).`,
        keywords: "tech companies, contacts, X, Twitter, statistics, stats",
        url: "https://who-to-bother-at.com/stats",
        image: "https://who-to-bother-at.com/opengraph",
      }),
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: StatsPage,
});

function StatsPage() {
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
          Statistics
        </h1>
        <p className="text-muted-foreground text-sm">
          A quick overview of the database
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard delay={0} description="Tech companies in the database" label="Companies" number={stats.companyCount} />
        <StatCard delay={1} description="Unique contacts on X (Twitter)" label="People" number={stats.peopleCount} />
        <StatCard delay={2} description="Total product/role listings" label="Contact Entries" number={stats.totalContacts} />
      </div>

      {/* About */}
      <div className="rounded-2xl bg-secondary/60 p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="mb-4 font-semibold text-foreground text-lg">
          About the Data
        </h2>
        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            This database contains contact information for{" "}
            {stats.companyCount} tech companies, with {stats.peopleCount}{" "}
            unique people you can reach out to on X (Twitter).
          </p>
          <p>
            Each contact entry represents a specific product, team, or role
            within a company. Some people may appear multiple times if they
            handle different products or areas.
          </p>
          <p>
            Want to contribute? Check out our{" "}
            <a
              className="font-medium text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent/80"
              href="https://github.com/kulterryan/cf-who-to-bother-at-on-x"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub repository
            </a>{" "}
            to add more companies or update existing information.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function StatCard({
  number,
  label,
  description,
  delay,
}: {
  number: number;
  label: string;
  description: string;
  delay: number;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-6 animate-scale-in" style={{ animationDelay: `${0.05 * delay + 0.05}s` }}>
      <div className="font-mono font-bold text-4xl text-accent">
        {number}
      </div>
      <div className="mt-1 font-semibold text-foreground">
        {label}
      </div>
      <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}
