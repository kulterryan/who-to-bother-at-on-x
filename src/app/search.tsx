import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, memo } from 'react';
import { createStandardSchemaV1, parseAsString, useQueryState, throttle } from 'nuqs';
import { search, type SearchResult } from '@/lib/search';
import { companyLogos } from '@/components/company-logos';
import { seo } from '@/lib/seo';
import { Footer } from '@/components/footer';

// Define search params schema for nuqs
const searchParams = {
  q: parseAsString.withDefault(''),
};

export const Route = createFileRoute('/search')({
  validateSearch: createStandardSchemaV1(searchParams, {
    partialOutput: true,
  }),
  head: () => {
    return {
      meta: [
        ...seo({
          title: 'Search | who to bother on X',
          description: 'Search for companies and products to find the right people to reach out to on X (Twitter).',
          keywords: 'search, tech companies, contacts, X, Twitter, developers, developer relations, devrel, support',
          url: 'https://who-to-bother-at.com/search',
          image: 'https://who-to-bother-at.com/opengraph',
        }),
      ],
      links: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault('').withOptions({
    limitUrlUpdates: throttle(300),
    shallow: true,
    history: 'replace',
  }));
  
  // Perform search - only reruns when query changes
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return search(query);
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl flex flex-col gap-6 px-6 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="text-orange-600 hover:text-orange-700 dark:hover:text-orange-500 transition-colors inline-flex items-center gap-2 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to home
          </Link>
          
          <h1 className="m-0 text-4xl font-medium text-zinc-900 dark:text-zinc-100 md:text-5xl">
            Search companies & products
          </h1>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for companies or products..."
            value={query}
            onChange={(e) => setQuery(e.target.value || null)}
            className="w-full rounded-lg border-2 border-zinc-200 bg-white py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-orange-600"
            aria-label="Search for companies or products"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery(null)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* Results */}
        {!query ? (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Enter a search term to find companies or products
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
              No results found for "{query}"
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>
            
            <div className="grid gap-4" role="list" aria-label="Search results">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </>
        )}

        <Footer />
      </main>
    </div>
  );
}

// Memoize SearchResultCard to prevent rerenders when props don't change
const SearchResultCard = memo(function SearchResultCard({ result }: { result: SearchResult }) {
  const logo = companyLogos[result.companyId];
  const isCompany = result.type === 'company';

  // For products, link with search query to filter and highlight the product
  const searchParams = isCompany ? undefined : { q: result.name };

  return (
    <Link
      to="/$company"
      params={{ company: result.companyId }}
      search={searchParams}
      className="group flex items-start gap-4 rounded-xl border-2 border-zinc-200 bg-white p-4 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
      role="listitem"
    >
      {logo && (
        <div className="flex-shrink-0 w-14 h-12 flex items-center justify-center">
          {logo}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
            {result.name}
          </h3>
          <span className={`
            inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
            ${isCompany 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            }
          `}>
            {isCompany ? 'Company' : 'Product'}
          </span>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-0">
          {result.description}
        </p>
        
      </div>

      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-orange-600 transition-colors">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
});

