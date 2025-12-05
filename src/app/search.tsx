import { createFileRoute, Link } from "@tanstack/react-router";
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

// Define search params schema for nuqs
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

// Helper component to render search results
function SearchResults({
  query,
  results,
}: {
  query: string | null;
  results: SearchResult[];
}) {
  if (!query) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Search</title>
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Enter a search term to find companies or products
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>No results</title>
          <path
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <p className="mb-2 text-lg text-zinc-600 dark:text-zinc-400">
          No results found for "{query}"
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for "
        {query}"
      </div>
      <ul aria-label="Search results" className="grid gap-4">
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </ul>
    </>
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

  // Perform search - only reruns when query changes
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return search(query);
  }, [query]);

  return (
    <div className="text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            className="inline-flex w-fit items-center gap-2 text-orange-600 transition-colors hover:text-orange-700 dark:hover:text-orange-500"
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
              <title>Arrow left</title>
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to home
          </Link>

          <h1 className="m-0 font-medium text-4xl text-zinc-900 md:text-5xl dark:text-zinc-100">
            Search companies & products
          </h1>
        </div>

        {/* Search Input */}
        <form className="relative" onSubmit={(e) => e.preventDefault()}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Search</title>
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
            className="w-full rounded-lg border-2 border-zinc-200 bg-white py-3 pr-4 pl-11 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-orange-600"
            onChange={(e) => setQuery(e.target.value || null)}
            placeholder="Search for companies or products..."
            type="text"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={() => setQuery(null)}
              type="button"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Close</title>
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

        {/* Results */}
        <SearchResults query={query} results={results} />

        <Footer />
      </main>
    </div>
  );
}

// Memoize SearchResultCard to prevent rerenders when props don't change
const SearchResultCard = memo(function SearchResultCardComponent({
  result,
}: {
  result: SearchResult;
}) {
  const logo = companyLogos[result.companyId];
  const isCompany = result.type === "company";

  // For products, link with search query to filter and highlight the product
  const linkSearchParams = isCompany ? undefined : { q: result.name };

  return (
    <Link
      className="group flex items-start gap-4 rounded-xl border-2 border-zinc-200 bg-white p-4 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
      params={{ company: result.companyId }}
      role="listitem"
      search={linkSearchParams}
      to="/$company"
    >
      {logo ? (
        <div className="flex h-12 w-14 shrink-0 items-center justify-center">
          {logo}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-semibold text-lg text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
            {result.name}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${
              isCompany
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            }
          `}
          >
            {isCompany ? "Company" : "Product"}
          </span>
        </div>

        <p className="mb-0 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {result.description}
        </p>
      </div>

      <div className="shrink-0">
        <svg
          className="text-zinc-400 transition-colors group-hover:text-orange-600"
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
          <title>Arrow right</title>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
});
