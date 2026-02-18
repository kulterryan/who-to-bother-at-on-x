import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  createStandardSchemaV1,
  parseAsString,
  throttle,
  useQueryState,
} from "nuqs";
import { memo, useMemo } from "react";
import { companyLogos } from "@/components/company-logos";
import { Footer } from "@/components/footer";
import { type SearchResult, search } from "@/lib/search";
import { seo } from "@/lib/seo";

const searchParams = {
  q: parseAsString.withDefault(""),
};

export const Route = createFileRoute("/search")({
  validateSearch: createStandardSchemaV1(searchParams, {
    partialOutput: true,
  }),
  head: () => ({
    meta: [
      ...seo({
        title: "Search | who to bother on X",
        description:
          "Search for companies and products to find the right people to reach out to on X (Twitter).",
        keywords:
          "search, tech companies, contacts, X, Twitter, developers, developer relations, devrel, support",
        url: "https://who-to-bother-at.com/search",
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
  component: SearchPage,
});

function SearchResults({
  query,
  results,
}: {
  query: string;
  results: SearchResult[];
}) {
  if (!query) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-fade-in">
        <svg
          className="h-10 w-10 text-muted-foreground/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Search icon</title>
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <p className="text-muted-foreground text-sm">
          Enter a search term to find companies or products
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-fade-in">
        <svg
          className="h-10 w-10 text-muted-foreground/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>No results icon</title>
          <path
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <p className="text-muted-foreground text-sm">
          No results found for "{query}"
        </p>
        <p className="text-muted-foreground/60 text-xs">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-muted-foreground text-xs">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for "
        {query}"
      </p>

      <ul aria-label="Search results" className="flex flex-col gap-2">
        {results.map((result, i) => (
          <SearchResultCard index={i} key={result.id} result={result} />
        ))}
      </ul>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
      shallow: true,
      history: "replace",
    })
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return search(query);
  }, [query]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="flex flex-col gap-4 animate-fade-in">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
          to="/"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>

        <h1 className="font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
          Search companies & products
        </h1>
      </div>

      {/* Search Input */}
      <form className="relative animate-slide-up" onSubmit={(e) => e.preventDefault()} style={{ animationDelay: '0.05s' }}>
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
          aria-label="Search for companies or products"
          autoFocus
          className="w-full rounded-xl bg-secondary/70 py-3 pr-10 pl-10 text-foreground text-sm placeholder-muted-foreground transition-all duration-200 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30"
          onChange={(e) => setQuery(e.target.value || null)}
          placeholder="Search for companies or products..."
          type="text"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            onClick={() => setQuery(null)}
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

      <SearchResults query={query} results={results} />
      <Footer />
    </main>
  );
}

const SearchResultCard = memo(function SearchResultCardComponent({
  result,
  index,
}: {
  result: SearchResult;
  index: number;
}) {
  const logo = companyLogos[result.companyId];
  const isCompany = result.type === "company";
  const resultSearchParams = isCompany ? undefined : { q: result.name };

  return (
    <Link
      className="group flex items-center gap-4 rounded-2xl bg-card p-4 transition-all duration-200 hover:bg-secondary/80 active:scale-[0.99] animate-slide-up"
      params={{ company: result.companyId }}
      role="listitem"
      search={resultSearchParams}
      style={{ animationDelay: `${0.03 * index}s` }}
      to="/$company"
    >
      {logo ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-auto">
          {logo}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-card-foreground text-sm transition-colors duration-200 group-hover:text-accent">
            {result.name}
          </h3>
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
              isCompany
                ? "bg-secondary text-muted-foreground"
                : "bg-accent/10 text-accent"
            }`}
          >
            {isCompany ? "Company" : "Product"}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs leading-relaxed">
          {result.description}
        </p>
      </div>

      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
});
