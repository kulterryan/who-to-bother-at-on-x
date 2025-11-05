import { createFileRoute, Link } from "@tanstack/react-router";
import { companyLogos } from "@/components/company-logos";
import { ContactsList } from "@/components/contacts-list";
import { seo } from "@/lib/seo";
import type { Company } from "@/types/company";

// Auto-discover all company JSON files using Vite's import.meta.glob
const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  { eager: true }
);

// Generate company data map from discovered files
const companyDataMap: Record<string, Company> = Object.entries(
  companyModules
).reduce(
  (acc, [path, module]) => {
    const filename = path.split("/").pop()?.replace(".json", "") || "";
    // Filter out schema and template files
    if (
      filename &&
      !filename.includes("schema") &&
      !filename.includes("template")
    ) {
      // Key by the id field from the JSON to match how links are generated in index.tsx
      acc[module.default.id] = module.default;
    }
    return acc;
  },
  {} as Record<string, Company>
);

export const Route = createFileRoute("/$company")({
  loader: ({ params }) => {
    const { company } = params;

    const companyData = companyDataMap[company];
    if (!companyData) {
      throw new Error(`Company "${company}" not found`);
    }

    return companyData;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [] };
    }

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
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="text-center">
        <h1 className="mb-4 font-medium text-2xl">Company Not Found</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">{error.message}</p>
        <Link className="text-orange-600 underline" to="/">
          Back to home
        </Link>
      </div>
    </div>
  ),
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
