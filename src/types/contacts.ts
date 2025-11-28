// Re-export valibot-inferred types from schema
export type { Category, Contact } from "../data/companies/schema";

export interface Company {
	name: string;
	slug: string;
	description: string;
	primaryColor: string;
	logo: React.ReactNode;
}
