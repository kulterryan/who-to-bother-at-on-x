import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { companyLogos } from "@/components/company-logos";
import { Footer } from "@/components/footer";
import { seo } from "@/lib/seo";
import type { Company, CompanyListItem } from "@/types/company";

const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  {
    eager: true,
  }
);

const companies: CompanyListItem[] = Object.entries(companyModules)
  .filter(([path]) => !(path.includes("template") || path.includes("schema")))
  .map(([_, module]) => {
    const company = module.default;
    return {
      id: company.id,
      name: company.name,
      description: company.description,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      ...seo({
        title: "who to bother on X | find help in your favorite tech companies",
        description:
          "Find the right people to reach out to at your favorite tech companies on X (Twitter).",
        keywords:
          "tech companies, contacts, X, Twitter, developers, developer relations, devrel, support",
        url: "https://who-to-bother-at.com/",
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
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );

  useEffect(() => {
    router.preloadRoute({ to: "/search" }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (searchTerm?.trim()) {
      navigate({
        to: "/search",
        search: { q: searchTerm.trim() },
        replace: true,
      });
    }
  }, [searchTerm, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
          <span className="text-balance">who to bother on</span>
          <svg
            className="inline-block shrink-0"
            fill="none"
            height="30"
            viewBox="0 0 1200 1227"
            width="34"
          >
            <title>X (Twitter) logo</title>
            <path
              d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
              fill="currentColor"
            />
          </svg>
        </h1>
        <p className="max-w-lg text-muted-foreground text-base leading-relaxed">
          Find the right people to reach out to at your favorite tech companies
        </p>
      </div>

      {/* Search */}
      <form className="relative" onSubmit={handleSearch}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Search icon</title>
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <input
          aria-label="Search companies and products"
          className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-10 text-foreground text-sm placeholder-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          onChange={(e) => setSearchTerm(e.target.value || null)}
          placeholder="Search companies and products..."
          type="text"
          value={searchTerm}
        />
        {searchTerm ? (
          <button
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm(null)}
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Clear icon</title>
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        ) : null}
      </form>

      {/* Company Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => {
          const logo = companyLogos[company.id];

          const cardClasses =
            "group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-sm";

          if (company.id === "vercel" || company.id === "laravel") {
            return (
              <a
                className={cardClasses}
                href={`/${company.id}`}
                key={company.id}
                target="_blank"
              >
                <CompanyCardContent
                  company={company}
                  logo={logo}
                />
              </a>
            );
          }

          return (
            <Link
              className={cardClasses}
              key={company.id}
              params={{ company: company.id }}
              to="/$company"
            >
              <CompanyCardContent
                company={company}
                logo={logo}
              />
            </Link>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}

function CompanyCardContent({
  company,
  logo,
}: {
  company: CompanyListItem;
  logo: React.ReactNode;
}) {
  return (
    <>
      {logo ? (
        <div className="mb-3 flex h-8 items-center [&>svg]:h-6 [&>svg]:w-auto">
          {logo}
        </div>
      ) : null}
      <h2 className="font-semibold text-card-foreground text-lg leading-tight transition-colors group-hover:text-accent">
        {company.name}
      </h2>
      <p className="mt-1.5 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed">
        {company.description}
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 font-medium text-accent text-xs">
        View contacts
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </>
  );
}
