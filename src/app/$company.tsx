import { createFileRoute, Link } from '@tanstack/react-router';
import { createStandardSchemaV1, parseAsString, useQueryState, throttle } from 'nuqs';
import { ContactsList } from '@/components/contacts-list';
import { companyLogos } from '@/components/company-logos';
import type { Company } from '@/types/company';
import { seo } from '@/lib/seo';

// Helper function to build company data map
function getCompanyDataMap(): Record<string, Company> {
  // Auto-discover all company JSON files using Vite's import.meta.glob
  const companyModules = import.meta.glob<{ default: Company }>(
    '../data/companies/*.json',
    { eager: true }
  );

  // Build company data map from discovered files
  return Object.entries(companyModules).reduce(
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
}

// Define search params schema for nuqs
const searchParams = {
  q: parseAsString.withDefault(''),
};

export const Route = createFileRoute('/$company')({
  validateSearch: createStandardSchemaV1(searchParams, {
    partialOutput: true,
  }),
  loader: async ({ params }) => {
    const { company } = params;
    
    // Get company data map
    const companyDataMap = getCompanyDataMap();
    const companyData = companyDataMap[company];
    
    if (!companyData) {
      throw new Error(`Company "${company}" not found`);
    }
    
    return companyData;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    
    const title = `who to bother at ${loaderData.name} on X`;
    const description = `Find the right people to reach out to at ${loaderData.name} on X (Twitter). ${loaderData.description}`;
    
    // TODO: Change after testing deployment
    const ogImage = `https://who-to-bother-at.com/og/${loaderData.id}`;
    const pageUrl = `https://who-to-bother-at.com/${loaderData.id}`;
    
    return {
      meta: [
        ...seo({
          title,
          description,
          keywords: `${loaderData.name}, contacts, X, Twitter, developer relations, support`,
          image: ogImage,
          url: pageUrl,
        }),
      ],
      links: [
        {
          rel: 'icon',
          href: `/company-logos/${loaderData.logoType}.svg`,
          type: 'image/svg+xml',
        },
        {
          rel: 'apple-touch-icon',
          href: `/company-logos/${loaderData.logoType}.svg`,
        },
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
  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault('').withOptions({
    limitUrlUpdates: throttle(300),
  }));

  return (
    <ContactsList
      categories={company.categories}
      companyName={company.name}
      logo={logo}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      website={company.website}
      docs={company.docs}
      github={company.github}
      discord={company.discord}
    />
  );
}
