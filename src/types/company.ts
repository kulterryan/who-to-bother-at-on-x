// Re-export valibot-inferred Company type from schema
export type { Company } from "../data/companies/schema";

// Keep Category export for backwards compatibility
export type { Category } from "./contacts";

export type CompanyListItem = {
  id: string;
  name: string;
  description: string;
};
