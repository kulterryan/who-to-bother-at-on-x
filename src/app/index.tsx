import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { companyLogos } from "@/components/company-logos";
import { Footer } from "@/components/footer";
import { seo } from "@/lib/seo";
import type { Company, CompanyListItem } from "@/types/company";

// Auto-discover all company JSON files (excluding templates)
const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  {
    eager: true,
  }
);

// Extract company list items from the loaded modules
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

  // Preload search page once homepage is mounted
  useEffect(() => {
    router.preloadRoute({ to: "/search" }).catch(() => {
      // Silently fail if preload doesn't work
    });
  }, [router]);

  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
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
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16 md:py-24">
        <h1 className="m-0 font-medium text-4xl text-zinc-900 md:text-5xl dark:text-zinc-100">
          who to bother on{" "}
          <svg
            className="inline-block"
            fill="none"
            height="36"
            viewBox="0 0 1200 1227"
            width="40"
          >
            <path
              d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
              fill="currentColor"
            />
          </svg>
        </h1>

        <p className="m-0 text-lg text-zinc-600 dark:text-zinc-400">
          Find the right people to reach out to at your favorite tech companies
        </p>

        {/* Search Input */}
        <form className="relative" onSubmit={handleSearch}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            className="w-full rounded-lg border-2 border-zinc-200 bg-white py-3 pr-4 pl-11 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-orange-600"
            onChange={(e) => setSearchTerm(e.target.value || null)}
            placeholder="Search companies and products..."
            type="text"
            value={searchTerm}
          />
          {searchTerm && (
            <button
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={() => setSearchTerm(null)}
              type="button"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
        </form>

        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => {
            const logo = companyLogos[company.id];

            // Use regular anchor tag for Vercel to trigger server redirect
            if (company.id === "vercel") {
              return (
                <a
                  className="group flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
                  href="/vercel"
                  key={company.id}
                  rel="noopener"
                  target="_blank"
                >
                  {logo && <div className="mb-4">{logo}</div>}
                  <h2 className="mb-2 font-semibold text-2xl text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
                    {company.name}
                  </h2>
                  <p className="line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {company.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 font-medium text-orange-600 text-sm">
                    View contacts
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
                      <title>View contacts</title>
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </a>
              );
            }

            return (
              <Link
                className="group block rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
                className="group flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
                key={company.id}
                params={{ company: company.id }}
                params={{ company: company.id }}
                to="/$company"
              >
                {logo && <div className="mb-4">{logo}</div>}
                <h2 className="mb-2 font-semibold text-2xl text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
                  {company.name}
                </h2>
                <p className="line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {company.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 font-medium text-orange-600 text-sm">
                  View contacts
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
                    <title>View contacts</title>
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <Footer />
      </main>
    </div>
  );
}
