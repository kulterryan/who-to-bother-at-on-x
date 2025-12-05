#!/usr/bin/env tsx

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toJsonSchema } from "@valibot/to-json-schema";
import { CompanySchema } from "../data/companies/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = join(__dirname, "../data/companies/schema.json");

/**
 * Generates JSON Schema from Valibot schema
 */
function generateJsonSchema(): void {
  try {
    // Convert Valibot schema to JSON Schema
    const jsonSchema = toJsonSchema(CompanySchema);

    // Add metadata to the generated schema
    const schemaWithMetadata = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Company",
      description: "Schema for company contact information",
      ...jsonSchema,
    };

    // Format JSON with proper indentation
    const jsonContent = JSON.stringify(schemaWithMetadata, null, 2);

    // Write to file
    writeFileSync(OUTPUT_PATH, `${jsonContent}\n`, "utf-8");

    console.log(`Generated JSON Schema: ${OUTPUT_PATH}`);
    process.exit(0);
  } catch (error) {
    console.error("Error generating JSON Schema:", error);
    process.exit(1);
  }
}

// Run generation
generateJsonSchema();
