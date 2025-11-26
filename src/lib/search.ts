import Fuse from "fuse.js";
import type { Company } from "@/types/company";

export type SearchResultType = "company" | "product";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  description: string;
  companyId: string;
  companyName: string;
  handles?: string[];
}

// Auto-discover all company JSON files (excluding templates)
const companyModules = import.meta.glob<{ default: Company }>(
  "../data/companies/*.json",
  {
    eager: true,
  }
);

// Build the search index with both companies and products
function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  Object.entries(companyModules)
    .filter(
      ([path]) =>
        !(
          path.includes("template") ||
          path.includes("schema") ||
          path.includes("vercel")
        )
    )
    .forEach(([_, module]) => {
      const company = module.default;

      // Add company as a search result
      results.push({
        type: "company",
        id: company.id,
        name: company.name,
        description: company.description,
        companyId: company.id,
        companyName: company.name,
      });

      // Add each product from categories as a search result
      company.categories.forEach((category) => {
        category.contacts.forEach((contact) => {
          // Create a unique ID for this product
          const productId = `${company.id}-${contact.product.toLowerCase().replace(/\s+/g, "-")}`;

          results.push({
            type: "product",
            id: productId,
            name: contact.product,
            description: `${contact.product} at ${company.name}`,
            companyId: company.id,
            companyName: company.name,
            handles: contact.handles,
          });
        });
      });
    });

  return results;
}

// Build the index once at module load time
const searchIndex = buildSearchIndex();

// Create Fuse instance for fuzzy searching
const fuse = new Fuse(searchIndex, {
  keys: [
    { name: "name", weight: 2 },
    { name: "description", weight: 1 },
    { name: "companyName", weight: 1.5 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
});

/**
 * Search for companies and products
 * @param query - The search query string
 * @returns Array of search results, sorted by relevance
 */
export function search(query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const fuseResults = fuse.search(query);

  // Remove duplicate products (same product name for same company)
  const seen = new Set<string>();
  const uniqueResults: SearchResult[] = [];

  for (const result of fuseResults) {
    const item = result.item;
    const key = `${item.type}-${item.companyId}-${item.name}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults;
}

/**
 * Get all available search results (for debugging or showing all)
 */
export function getAllResults(): SearchResult[] {
  return searchIndex;
}
