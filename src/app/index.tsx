'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import companiesRegistry from '@/data/companies.json';
import type { CompanyListItem } from '@/types/company';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const companies = companiesRegistry as CompanyListItem[];
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="mb-4 text-4xl font-medium text-zinc-900 md:text-5xl">
          who to bother on{' '}
          <svg fill="none" viewBox="0 0 1200 1227" width="40" height="36" className="inline-block">
            <path fill="#000" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
          </svg>
        </h1>

        <p className="mb-12 text-lg text-zinc-600">Find the right people to reach out to at your favorite tech companies</p>

        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => (
            <Link 
              key={company.id}
              to="/$company"
              params={{ company: company.id }} 
              className="group block rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-zinc-900 hover:shadow-lg"
            >
              <h2 className="mb-2 text-2xl font-semibold text-zinc-900 transition-colors group-hover:text-orange-600">
                {company.name}
              </h2>
              <p className="text-sm text-zinc-600">{company.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
                View contacts
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-lg bg-zinc-50 p-6">
          <h3 className="mb-2 text-lg font-medium text-zinc-900">Want to add your company?</h3>
          <p className="text-sm text-zinc-600">
            This is a community-maintained directory. Have more contacts or companies to add? Mention{' '}
            <a href="https://x.com/thehungrybird_" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400">
              @thehungrybird_
            </a>{' '}
            on X.
          </p>
        </div>

        <p className="mt-12 text-center text-sm text-zinc-500">
          Concept by:{' '}
          <a href="https://x.com/strehldev" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400">
            @strehldev
          </a>
        </p>
      </main>
    </div>
  );
}
