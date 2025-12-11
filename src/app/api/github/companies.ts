import { createFileRoute } from "@tanstack/react-router";
import type { Company } from "@/types/company";

// Import all company data at build time
const companyModules = import.meta.glob<{ default: Company }>(
  "../../../data/companies/*.json",
  {
    eager: true,
  }
);

// Build a map of company ID to company data
const companies: Map<string, Company> = new Map();

for (const [path, module] of Object.entries(companyModules)) {
  // Skip template and schema files
  if (path.includes("template") || path.includes("schema")) {
    continue;
  }

  const company = module.default;
  if (company?.id) {
    companies.set(company.id, company);
  }
}

export const Route = createFileRoute("/api/github/companies")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const companyId = url.searchParams.get("id");

        // If a specific company is requested
        if (companyId) {
          const company = companies.get(companyId);

          if (!company) {
            return new Response(
              JSON.stringify({ error: "Company not found" }),
              {
                status: 404,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          return new Response(JSON.stringify({ company }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Return all companies (for listing/selection)
        const allCompanies = Array.from(companies.values()).map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          logoType: c.logoType,
        }));

        return new Response(JSON.stringify({ companies: allCompanies }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
