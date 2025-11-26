#!/usr/bin/env tsx

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, ValiError } from "valibot";
import { CompanySchema } from "../data/companies/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMPANIES_DIR = join(__dirname, "../data/companies");
const EXCLUDE_FILES = ["schema.json", "example.json.template"];

type ValidationResult = {
  file: string;
  success: boolean;
  errors?: string[];
};

/**
 * Format validation errors into readable strings
 */
function formatValidationErrors(error: unknown): string[] {
  if (error instanceof ValiError) {
    // Format valibot validation errors
    return error.issues.map((issue) => {
      const pathStr = issue.path
        ? issue.path.map((p: { key: string }) => p.key).join(".")
        : "root";
      return `  - ${pathStr}: ${issue.message}`;
    });
  }

  if (error instanceof SyntaxError) {
    // JSON parsing error
    return [`  - JSON Syntax Error: ${error.message}`];
  }

  // Other errors
  return [`  - ${String(error)}`];
}

/**
 * Validate a single company JSON file
 */
function validateCompanyFile(file: string): ValidationResult {
  const filePath = join(COMPANIES_DIR, file);
  const result: ValidationResult = {
    file,
    success: false,
  };

  try {
    // Read and parse JSON file
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Validate against schema
    parse(CompanySchema, data);

    result.success = true;
    console.log(`✅ ${file}`);
  } catch (error) {
    result.success = false;
    result.errors = formatValidationErrors(error);

    console.log(`❌ ${file}`);
    for (const err of result.errors) {
      console.log(err);
    }
    console.log();
  }

  return result;
}

/**
 * Validates all company JSON files against the valibot schema
 */
function validateCompanies(): void {
  console.log("🔍 Validating company JSON files...\n");

  // Read all JSON files from the companies directory
  const files = readdirSync(COMPANIES_DIR)
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !EXCLUDE_FILES.includes(file));

  if (files.length === 0) {
    console.log("⚠️  No company JSON files found to validate.");
    process.exit(1);
  }

  // Validate each file
  const results: ValidationResult[] = [];
  for (const file of files) {
    const result = validateCompanyFile(file);
    results.push(result);
  }

  const hasErrors = results.some((r) => !r.success);

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
try {
  validateCompanies();
} catch (error) {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
}
