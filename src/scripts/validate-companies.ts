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
 * Formats an error into a user-friendly message
 */
function formatError(error: unknown): string[] {
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
 * Validates a single company JSON file
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
    result.errors = formatError(error);
    console.log(`❌ ${file}`);
    for (const err of result.errors) {
      console.log(err);
    }
    console.log();
  }

  return result;
}

/**
 * Prints validation summary and exits with appropriate code
 */
function printSummary(results: ValidationResult[]): void {
  console.log(`\n${"-".repeat(50)}`);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n📊 Validation Summary:");
  console.log(`   Total files: ${results.length}`);
  console.log(`   ✅ Passed: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (failCount > 0) {
    console.log("\n❌ Validation failed! Please fix the errors above.");
    process.exit(1);
  }

  console.log("\n✅ All company JSON files are valid!");
  process.exit(0);
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

  const results = files.map((file) => validateFile(file));
  printSummary(results);
}

// Run validation
validateCompanies();
