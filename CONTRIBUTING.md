# Contributing to Who to Bother

Thank you for your interest in contributing! This directory helps developers find the right people to reach out to at tech companies.

## How to Add a New Company

1. **Fork the repository** and clone it locally

2. **Create a new JSON file** for your company in `src/data/companies/`:
   ```bash
   touch src/data/companies/yourcompany.json
   ```

3. **Add company data** following this structure:
   ```json
   {
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

4. **Import your company data** in `src/app/$company.tsx`:
   ```typescript
   import yourcompanyData from '@/data/companies/yourcompany.json';
   
   // Add to the companyDataMap object:
   const companyDataMap: Record<string, Company> = {
     // ... existing companies
     yourcompany: yourcompanyData as Company,
   };
   ```

5. **Add your company logo** to `src/components/company-logos.tsx`:
   - Add your SVG logo to the `companyLogos` object
   - Use the same key as your `logoType` in the JSON file
   - Include a `<title>` element for accessibility (e.g., `<title id="yourcompany-logo-title">YourCompany logo</title>`)
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

6. **Test locally**:
   ```bash
   pnpm install
   pnpm dev
   ```

7. **Submit a Pull Request** with your changes

## Guidelines

- **Handles**: Only include public Twitter/X handles of people who are comfortable being contacted
- **Email addresses**: Only include publicly available email addresses (e.g., from company websites, public profiles, or with explicit permission)
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
