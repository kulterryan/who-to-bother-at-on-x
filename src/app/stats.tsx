import { createFileRoute, Link } from '@tanstack/react-router';
import type { Company } from '@/types/company';
import { seo } from '@/lib/seo';
import { Footer } from '@/components/footer';

// Auto-discover all company JSON files (excluding templates)
const companyModules = import.meta.glob<{ default: Company }>('../data/companies/*.json', {
  eager: true,
});

// Calculate stats
function calculateStats() {
  const companies = Object.entries(companyModules)
    .filter(([path]) => !path.includes('template') && !path.includes('schema'))
    .map(([_, module]) => module.default);

  const companyCount = companies.length;
  
  // Count unique people (by X handle)
  const uniqueHandles = new Set<string>();
  companies.forEach((company) => {
    company.categories.forEach((category) => {
      category.contacts.forEach((contact) => {
        contact.handles.forEach((handle) => {
          uniqueHandles.add(handle.toLowerCase());
        });
      });
    });
  });

  const peopleCount = uniqueHandles.size;

  // Count total contact entries (products/roles)
  const totalContacts = companies.reduce((sum, company) => {
    return sum + company.categories.reduce((catSum, category) => {
      return catSum + category.contacts.length;
    }, 0);
  }, 0);

  return {
    companyCount,
    peopleCount,
    totalContacts,
  };
}

const stats = calculateStats();

export const Route = createFileRoute('/stats')({
  head: () => ({
    meta: [
      ...seo({
        title: 'Stats | who to bother on X',
        description: `Browse ${stats.companyCount} tech companies and ${stats.peopleCount} contacts on X (Twitter).`,
        keywords: 'tech companies, contacts, X, Twitter, statistics, stats',
        url: 'https://who-to-bother-at.com/stats',
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
  component: StatsPage,
});

function StatsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl flex flex-col gap-8 px-6 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600 transition-colors w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to home
          </Link>

          <h1 className="m-0 text-4xl font-medium text-zinc-900 dark:text-zinc-100 md:text-5xl">
            Statistics
          </h1>

          <p className="m-0 text-lg text-zinc-600 dark:text-zinc-400">
            A quick overview of the database
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Companies */}
          <div className="flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-2 text-5xl font-bold text-orange-600">
              {stats.companyCount}
            </div>
            <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Companies
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Tech companies in the database
            </p>
          </div>

          {/* People */}
          <div className="flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-2 text-5xl font-bold text-orange-600">
              {stats.peopleCount}
            </div>
            <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              People
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Unique contacts on X (Twitter)
            </p>
          </div>

          {/* Contact Entries */}
          <div className="flex flex-col rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-2 text-5xl font-bold text-orange-600">
              {stats.totalContacts}
            </div>
            <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Contact Entries
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Total product/role listings
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            About the Data
          </h2>
          <div className="space-y-3 text-sm text-balance">
            <p className='text-zinc-600 dark:text-zinc-400'>
              This database contains contact information for {stats.companyCount} tech companies, 
              with {stats.peopleCount} unique people you can reach out to on X (Twitter).
            </p>
            <p className='text-zinc-600 dark:text-zinc-400'>
              Each contact entry represents a specific product, team, or role within a company. 
              Some people may appear multiple times if they handle different products or areas.
            </p>
            <p className='text-zinc-600 dark:text-zinc-400'>
              Want to contribute? Check out our{' '}
              <a
                href="https://github.com/kulterryan/cf-who-to-bother-at-on-x"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-orange-600 hover:underline"
              >
                GitHub repository
              </a>
              {' '}to add more companies or update existing information.
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

