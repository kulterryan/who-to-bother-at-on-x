// biome-ignore lint/performance/noNamespaceImport: suppress for valibot
import * as v from "valibot";

/**
 * Valibot schema for company contact information
 * Mirrors the JSON schema in schema.json
 */

// Contact schema - represents a single contact with product/role and handles
export const ContactSchema = v.object({
  product: v.pipe(v.string(), v.minLength(1, "Product name is required")),
  handles: v.pipe(
    v.array(
      v.pipe(
        v.string(),
        v.regex(
          /^@[a-zA-Z0-9_]+$/,
          "Handle must start with @ and contain only letters, numbers, and underscores"
        )
      )
    ),
    v.minLength(1, "At least one handle is required")
  ),
  email: v.optional(
    v.pipe(
      v.string(),
      v.email('Must be a valid email address')
    )
  ),
  discord: v.optional(
    v.pipe(
      v.string(),
      v.url('Must be a valid URL')
    )
  ),
});

// Category schema - represents a category of contacts (e.g., by product, team, or area)
export const CategorySchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Category name is required")),
  contacts: v.pipe(
    v.array(ContactSchema),
    v.minLength(1, "At least one contact is required per category")
  ),
});

// Company schema - represents a complete company with all contact information
export const CompanySchema = v.object({
  $schema: v.optional(v.string()),
  id: v.pipe(
    v.string(),
    v.minLength(1, "Company ID is required"),
    v.regex(
      /^[a-z0-9-]+$/,
      "Company ID must be lowercase with only letters, numbers, and hyphens"
    )
  ),
  name: v.pipe(v.string(), v.minLength(1, "Company name is required")),
  description: v.pipe(
    v.string(),
    v.minLength(1, "Company description is required")
  ),
  logoType: v.pipe(
    v.string(),
    v.minLength(1, 'Logo type is required')
  ),
  logo: v.optional(v.string()),
  website: v.optional(
    v.pipe(
      v.string(),
      v.url('Must be a valid URL')
    )
  ),
  docs: v.optional(
    v.pipe(
      v.string(),
      v.url('Must be a valid URL')
    )
  ),
  github: v.optional(
    v.pipe(
      v.string(),
      v.url('Must be a valid URL')
    )
  ),
  discord: v.optional(
    v.pipe(
      v.string(),
      v.url('Must be a valid URL')
    )
  ),
  categories: v.pipe(
    v.array(CategorySchema),
    v.minLength(1, "At least one category is required")
  ),
});

// Infer TypeScript types from schemas
export type Contact = v.InferOutput<typeof ContactSchema>;
export type Category = v.InferOutput<typeof CategorySchema>;
export type Company = v.InferOutput<typeof CompanySchema>;
