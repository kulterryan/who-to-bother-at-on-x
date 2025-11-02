# Contributing to Who to Bother At

Thank you for your interest in contributing! This directory helps developers find the right people to reach out to at tech companies on X (formerly Twitter).

## Quick Start

1. **Fork and clone** the repository
2. **Create a new JSON file** for your company in `src/data/companies/yourcompany.json`
3. **Add company data** following the schema structure
4. **Add your company logo** to `src/components/company-logos.tsx`
5. **Validate your changes** with `pnpm validate`
6. **Test locally** with `pnpm dev`
7. **Submit a Pull Request**

For detailed instructions, see the sections below.

## How to Add a New Company

### Step 1: Create the JSON File

Create a new file in `src/data/companies/`:

```bash
touch src/data/companies/yourcompany.json
```

### Step 2: Add Company Data

Add company data following this structure (the `$schema` property enables IDE autocomplete and validation):

```json
{
  "$schema": "./schema.json",
  "id": "yourcompany",
  "name": "Your Company",
  "description": "Brief description of what your company does",
  "logoType": "yourcompany",
  "categories": [
    {
      "name": "Category Name",
      "contacts": [
        {
          "product": "Product or Role",
          "handles": ["@twitter_handle"],
          "email": "contact@example.com"
        }
      ]
    }
  ]
}
```

**Note**: The `email` field is optional. Only include it if the contact has publicly shared their email for professional inquiries.

### Step 3: Add Your Company Logo

Add your SVG logo to `src/components/company-logos.tsx`:

- Add your SVG logo to the `companyLogos` object
- Use the same key as your `logoType` in the JSON file
- Include a `<title>` element for accessibility
- Add `aria-labelledby="yourcompany-logo-title"` to the SVG element

Example:
```typescript
yourcompany: (
  <svg viewBox="0 0 100 100" width="30" height="30" aria-labelledby="yourcompany-logo-title">
    <title id="yourcompany-logo-title">YourCompany logo</title>
    <path fill="currentColor" d="..." />
  </svg>
),
```

### Step 4: Test Locally

```bash
pnpm install
pnpm dev
```

Navigate to `http://localhost:3000/yourcompany` to see your company page.

### Step 5: Validate Your Changes

Before submitting your PR, validate that your JSON file conforms to the schema:

```bash
pnpm validate
```

This will check all company JSON files against the Valibot schema and report any errors. Common validation errors include:

- Missing required fields (`id`, `name`, `description`, `logoType`, `categories`)
- Invalid handle format (must start with `@` and contain only letters, numbers, and underscores)
- Invalid email format (if provided)
- Empty contacts or categories arrays

Fix any validation errors before proceeding.

### Step 6: Submit Your Pull Request

Create a PR with your changes. We'll review and merge it!

## How It Works

The application automatically discovers all company JSON files in `src/data/companies/` at build time. When you add a new company JSON file, it will automatically be available as a route without needing to manually import it in the code. The company ID (filename without `.json`) becomes the route path.

## Schema Validation

This project uses [Valibot](https://valibot.dev) to validate all company JSON files:

- The Valibot schema (`src/data/companies/schema.ts`) defines all validation rules
- A JSON Schema (`src/data/companies/schema.json`) is auto-generated from the Valibot schema for IDE autocomplete and validation hints
- All JSON files are validated at build time to ensure data integrity
- Run `pnpm validate` locally to check your files before submitting a PR
- The build will fail if any JSON file fails validation, preventing deployment of invalid data

## Guidelines

### Handles and Email Addresses

- **Handles**: Only include public Twitter/X handles of people who are comfortable being contacted
- **Email addresses**: Only include publicly available email addresses (e.g., from company websites, public profiles, or with explicit permission)

### Content Organization

- **Categories**: Group contacts logically (e.g., by product, team, or area)
- **Descriptions**: Keep them concise and informative
- **Logos**: Use SVG format when possible, keep them reasonably sized

## Code of Conduct

- Be respectful and professional
- Only add accurate information
- Don't add personal contact information without permission
- Focus on people who are actively engaged with the community

## Questions?

Feel free to open an issue or reach out to [@thehungrybird_](https://x.com/thehungrybird_) on X.
