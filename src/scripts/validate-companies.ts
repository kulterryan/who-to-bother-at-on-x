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
 * Formats validation errors from different error types
 */
function formatValidationError(error: unknown): string[] {
  if (error instanceof ValiError) {
    return error.issues.map((issue) => {
      const pathStr = issue.path
        ? issue.path.map((p: { key: string }) => p.key).join(".")
        : "root";
      return `  - ${pathStr}: ${issue.message}`;
    });
  }
  if (error instanceof SyntaxError) {
    return [`  - JSON Syntax Error: ${error.message}`];
  }
  return [`  - ${String(error)}`];
}

/**
 * Validates a single company file
 */
function validateFile(file: string): ValidationResult {
  const filePath = join(COMPANIES_DIR, file);
  const result: ValidationResult = {
    file,
    success: false,
  };

  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    parse(CompanySchema, data);
    result.success = true;
    console.log(`✅ ${file}`);
  } catch (error) {
    result.success = false;
    result.errors = formatValidationError(error);
    console.log(`❌ ${file}`);
    if (result.errors) {
      for (const err of result.errors) {
        console.log(err);
      }
    }
    console.log();
  }

  return result;
}

/**
 * Prints validation summary
 */
function printSummary(results: ValidationResult[]): void {
  console.log(`\n${"=".repeat(50)}`);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n📊 Validation Summary:");
  console.log(`   Total files: ${results.length}`);
  console.log(`   ✅ Passed: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  const hasErrors = failCount > 0;
  if (hasErrors) {
    console.log("\n❌ Validation failed! Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("\n✅ All company JSON files are valid!");
    process.exit(0);
  }
}

/**
 * Validates all company JSON files against the valibot schema
 */
function validateCompanies(): void {
  console.log("🔍 Validating company JSON files...\n");

  const files = readdirSync(COMPANIES_DIR)
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !EXCLUDE_FILES.includes(file));

  if (files.length === 0) {
    console.log("⚠️  No company JSON files found to validate.");
    process.exit(1);
  }

  const results = files.map(validateFile);
  printSummary(results);
}

// Run validation
try {
  validateCompanies();
} catch (error) {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
}
