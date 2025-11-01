'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import { ContactsList } from '@/components/contacts-list';
import { companyLogos } from '@/components/company-logos';
import type { Company } from '@/types/company';

// Import all company data
import cloudflareData from '@/data/companies/cloudflare.json';
import vercelData from '@/data/companies/vercel.json';
import planetscaleData from '@/data/companies/planetscale.json';
import tanstackData from '@/data/companies/tanstack.json';
import mintlifyData from '@/data/companies/mintlify.json';
import webflowData from '@/data/companies/webflow.json';
import upstashData from '@/data/companies/upstash.json';
import githubData from '@/data/companies/github.json';
import betterauthData from '@/data/companies/betterauth.json';
import computesdkData from '@/data/companies/computesdk.json';

// Create a map of company data
const companyDataMap: Record<string, Company> = {
  cloudflare: cloudflareData as Company,
  planetscale: planetscaleData as Company,
  tanstack: tanstackData as Company,
  vercel: vercelData as Company,
  mintlify: mintlifyData as Company,
  webflow: webflowData as Company,
  upstash: upstashData as Company,
  github: githubData as Company,
  betterauth: betterauthData as Company,
  computesdk: computesdkData as Company,
};

export const Route = createFileRoute('/$company')({
  loader: async ({ params }) => {
    const { company } = params;
    
    const companyData = companyDataMap[company];
    if (!companyData) {
      throw new Error(`Company "${company}" not found`);
    }
    
    return companyData;
  },
  component: CompanyPage,
  errorComponent: ({ error }) => {
    return (
      <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Company Not Found</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error.message}</p>
          <Link to="/" className="text-orange-600 underline">Back to home</Link>
        </div>
      </div>
    );
  },
});

function CompanyPage() {
  const company = Route.useLoaderData();
  const logo = companyLogos[company.logoType];

  return (
    <ContactsList
      categories={company.categories}
      companyName={company.name}
      logo={logo}
    />
  );
}
