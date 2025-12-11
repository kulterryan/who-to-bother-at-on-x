#!/usr/bin/env tsx

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as v from "valibot";
import { CompanySchema } from "../data/companies/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPANIES_DIR = path.join(__dirname, "../data/companies");
const EXCLUDE_FILES = ["schema.json", "example.json.template"];

type ValidationResult = {
  file: string;
  success: boolean;
  errors?: string[];
};

/**
 * Validates all company JSON files against the valibot schema
 */
async function validateCompanies(): Promise<void> {
  console.log("🔍 Validating company JSON files...\n");

  // Read all JSON files from the companies directory
  const files = fs
    .readdirSync(COMPANIES_DIR)
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !EXCLUDE_FILES.includes(file));

  if (files.length === 0) {
    console.log("⚠️  No company JSON files found to validate.");
    process.exit(1);
  }

  const results: ValidationResult[] = [];
  let hasErrors = false;

  // Validate each file
  for (const file of files) {
    const filePath = path.join(COMPANIES_DIR, file);
    const result: ValidationResult = {
      file,
      success: false,
    };

    try {
      // Read and parse JSON file
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      // Validate against schema
      v.parse(CompanySchema, data);

      result.success = true;
      console.log(`✅ ${file}`);
    } catch (error) {
      result.success = false;
      hasErrors = true;

      if (error instanceof v.ValiError) {
        // Format valibot validation errors
        result.errors = error.issues.map((issue) => {
          const pathStr = issue.path
            ? issue.path.map((p: { key: string }) => p.key).join(".")
            : "root";
          return `  - ${pathStr}: ${issue.message}`;
        });
      } else if (error instanceof SyntaxError) {
        // JSON parsing error
        result.errors = [`  - JSON Syntax Error: ${error.message}`];
      } else {
        // Other errors
        result.errors = [`  - ${String(error)}`];
      }

      console.log(`❌ ${file}`);
      if (result.errors) {
        result.errors.forEach((err) => console.log(err));
      }
      console.log();
    }

    results.push(result);
  }

  // Print summary
  console.log(`\n${"=".repeat(50)}`);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n📊 Validation Summary:");
  console.log(`   Total files: ${results.length}`);
  console.log(`   ✅ Passed: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (hasErrors) {
    console.log("\n❌ Validation failed! Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("\n✅ All company JSON files are valid!");
    process.exit(0);
  }
}

// Run validation
validateCompanies().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
