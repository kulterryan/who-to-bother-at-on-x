// Re-export valibot-inferred types from schema
export type { Category, Contact } from "../data/companies/schema";

export type Company = {
	name: string;
	slug: string;
	description: string;
	primaryColor: string;
	logo: React.ReactNode;
};
