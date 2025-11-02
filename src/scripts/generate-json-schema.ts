#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { toJsonSchema } from '@valibot/to-json-schema';
import { CompanySchema } from '../data/companies/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../data/companies/schema.json');

/**
 * Generates JSON Schema from Valibot schema
 */
async function generateJsonSchema(): Promise<void> {
  try {
    // Convert Valibot schema to JSON Schema
    const jsonSchema = toJsonSchema(CompanySchema);

    // Add metadata to the generated schema
    const schemaWithMetadata = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Company',
      description: 'Schema for company contact information',
      ...jsonSchema,
    };

    // Format JSON with proper indentation
    const jsonContent = JSON.stringify(schemaWithMetadata, null, 2);

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, jsonContent + '\n', 'utf-8');

    console.log(`Generated JSON Schema: ${OUTPUT_PATH}`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating JSON Schema:', error);
    process.exit(1);
  }
}

// Run generation
generateJsonSchema().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
