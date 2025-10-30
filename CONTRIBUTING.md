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
             "handles": ["@twitter_handle"]
           }
         ]
       }
     ]
   }
   ```

4. **Add your company to the registry** in `src/data/companies.json`:
   ```json
   {
     "id": "yourcompany",
     "name": "Your Company",
     "description": "Brief description of what your company does"
   }
   ```

5. **Import your company data** in `src/app/$company.tsx`:
   ```typescript
   import yourcompanyData from '@/data/companies/yourcompany.json';
   
   // Add to the companyDataMap object:
   const companyDataMap: Record<string, Company> = {
     // ... existing companies
     yourcompany: yourcompanyData as Company,
   };
   ```

6. **Add your company logo** to `src/components/company-logos.tsx`:
   - Add your SVG logo to the `companyLogos` object
   - Use the same key as your `logoType` in the JSON file

7. **Test locally**:
   ```bash
   pnpm install
   pnpm dev
   ```

8. **Submit a Pull Request** with your changes

## Guidelines

- **Handles**: Only include public Twitter/X handles of people who are comfortable being contacted
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
