import { createFileRoute, Link } from '@tanstack/react-router';
import { ContactsList } from '@/components/contacts-list';
import { companyLogos } from '@/components/company-logos';
import type { Company } from '@/types/company';

// Auto-discover all company JSON files using Vite's import.meta.glob
const companyModules = import.meta.glob<{ default: Company }>(
  '../data/companies/*.json',
  { eager: true }
);

// Generate company data map from discovered files
const companyDataMap: Record<string, Company> = Object.entries(companyModules).reduce(
  (acc, [path, module]) => {
    // Extract company ID from path: '../data/companies/cloudflare.json' -> 'cloudflare'
    const companyId = path.split('/').pop()?.replace('.json', '') || '';
    // Filter out schema and template files
    if (companyId && !companyId.includes('schema') && !companyId.includes('template')) {
      acc[companyId] = module.default;
    }
    return acc;
  },
  {} as Record<string, Company>
);


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
