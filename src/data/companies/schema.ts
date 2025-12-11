import {
  array,
  email,
  type InferOutput,
  minLength,
  object,
  optional,
  pipe,
  regex,
  string,
  url,
} from "valibot";

/**
 * Valibot schema for company contact information
 * Mirrors the JSON schema in schema.json
 */

// Contact schema - represents a single contact with product/role and handles
export const ContactSchema = object({
  product: pipe(string(), minLength(1, "Product name is required")),
  handles: pipe(
    array(
      pipe(
        string(),
        regex(
          /^@[a-zA-Z0-9_]+$/,
          "Handle must start with @ and contain only letters, numbers, and underscores"
        )
      )
    ),
    minLength(1, "At least one handle is required")
  ),
  email: optional(pipe(string(), email("Must be a valid email address"))),
  discord: optional(pipe(string(), url("Must be a valid URL"))),
});

// Category schema - represents a category of contacts (e.g., by product, team, or area)
export const CategorySchema = object({
  name: pipe(string(), minLength(1, "Category name is required")),
  contacts: pipe(
    array(ContactSchema),
    minLength(1, "At least one contact is required per category")
  ),
});

// Company schema - represents a complete company with all contact information
export const CompanySchema = object({
  $schema: optional(string()),
  id: pipe(
    string(),
    minLength(1, "Company ID is required"),
    regex(
      /^[a-z0-9-]+$/,
      "Company ID must be lowercase with only letters, numbers, and hyphens"
    )
  ),
  name: pipe(string(), minLength(1, "Company name is required")),
  description: pipe(string(), minLength(1, "Company description is required")),
  logoType: pipe(string(), minLength(1, "Logo type is required")),
  logo: optional(string()),
  website: optional(pipe(string(), url("Must be a valid URL"))),
  docs: optional(pipe(string(), url("Must be a valid URL"))),
  github: optional(pipe(string(), url("Must be a valid URL"))),
  discord: optional(pipe(string(), url("Must be a valid URL"))),
  categories: pipe(
    array(CategorySchema),
    minLength(1, "At least one category is required")
  ),
});

// Infer TypeScript types from schemas
export type Contact = InferOutput<typeof ContactSchema>;
export type Category = InferOutput<typeof CategorySchema>;
export type Company = InferOutput<typeof CompanySchema>;
