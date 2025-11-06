import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ContactsList } from '@/components/contacts-list';
import { companyLogos } from '@/components/company-logos';
import type { Company } from '@/types/company';
import { seo } from '@/lib/seo';

// Server function to fetch company data by ID
const getCompanyData = createServerFn({ method: 'GET' })
  .inputValidator((companyId: string) => companyId)
  .handler(async ({ data: companyId }: { data: string }) => {
    // Auto-discover all company JSON files using Vite's import.meta.glob
    const companyModules = import.meta.glob<{ default: Company }>(
      '../data/companies/*.json',
      { eager: true }
    );

    // Build company data map from discovered files
    const companyDataMap: Record<string, Company> = Object.entries(companyModules).reduce(
      (acc, [path, module]) => {
        const filename = path.split('/').pop()?.replace('.json', '') || '';
        // Filter out schema and template files
        if (filename && !filename.includes('schema') && !filename.includes('template')) {
          // Key by the id field from the JSON to match how links are generated in index.tsx
          acc[module.default.id] = module.default;
        }
        return acc;
      },
      {} as Record<string, Company>
    );

    const companyData = companyDataMap[companyId];
    if (!companyData) {
      throw new Error(`Company "${companyId}" not found`);
    }

    return companyData;
  });

export const Route = createFileRoute('/$company')({
  loader: async ({ params }) => {
    const { company } = params;
    return await getCompanyData({ data: company });
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    
    const title = `who to bother at ${loaderData.name} on X`;
    const description = `Find the right people to reach out to at ${loaderData.name} on X (Twitter). ${loaderData.description}`;
    
    return {
      meta: [
        ...seo({
          title,
          description,
          keywords: `${loaderData.name}, contacts, X, Twitter, developer relations, support`,
        }),
      ],
    };
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
