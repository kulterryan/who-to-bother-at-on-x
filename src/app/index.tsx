import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { companyLogos } from '@/components/company-logos';
import type { CompanyListItem } from '@/types/company';
import type { Company } from '@/types/company';
import { seo } from '@/lib/seo';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';

// Auto-discover all company JSON files (excluding templates)
const companyModules = import.meta.glob<{ default: Company }>('../data/companies/*.json', {
  eager: true,
});

// Extract company list items from the loaded modules
const companies: CompanyListItem[] = Object.entries(companyModules)
  .filter(([path]) => !path.includes('template') && !path.includes('schema'))
  .map(([_, module]) => {
    const company = module.default;
    return {
      id: company.id,
      name: company.name,
      description: company.description,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      ...seo({
        title: 'who to bother on X | find help in your favorite tech companies',
        description: 'Find the right people to reach out to at your favorite tech companies on X (Twitter).',
        keywords: 'tech companies, contacts, X, Twitter, developers, developer relations, devrel, support',
        url: 'https://who-to-bother-at.com/',
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
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Navigate to search page when user starts typing
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      navigate({
        to: '/search',
        search: { q: debouncedSearchTerm.trim() },
        replace: false, // Allow back button to work
      });
    }
  }, [debouncedSearchTerm, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigation is handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl flex flex-col gap-4 px-6 py-16 md:py-24">
        <h1 className="m-0 text-4xl font-medium text-zinc-900 dark:text-zinc-100 md:text-5xl">
          who to bother on{' '}
          <svg fill="none" viewBox="0 0 1200 1227" width="40" height="36" className="inline-block">
            <path fill="currentColor" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
          </svg>
        </h1>

        <p className="m-0 text-lg text-zinc-600 dark:text-zinc-400">Find the right people to reach out to at your favorite tech companies</p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search companies and products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-2 border-zinc-200 bg-white py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-orange-600"
            aria-label="Search companies and products"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => {
            const logo = companyLogos[company.id];
            
            // Use regular anchor tag for Vercel to trigger server redirect
            if (company.id === 'vercel') {
              return (
                <a
                  key={company.id}
                  href="/vercel"
                  target='_blank'
                  className="group flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
                >
                  {logo && (
                    <div className="mb-4">
                      {logo}
                    </div>
                  )}
                  <h2 className="mb-2 text-2xl font-semibold text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
                    {company.name}
                  </h2>
                  <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{company.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
                    View contacts
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </a>
              );
            }
            
            return (
              <Link 
                key={company.id}
                to="/$company"
                params={{ company: company.id }} 
                className="group flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-orange-600"
              >
                {logo && (
                  <div className="mb-4">
                    {logo}
                  </div>
                )}
                <h2 className="mb-2 text-2xl font-semibold text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
                  {company.name}
                </h2>
                <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{company.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
                  View contacts
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
