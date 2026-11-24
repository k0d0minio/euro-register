/**
 * Load report JSON files into the database.
 *
 *   pnpm seed <file.json | folder>            validate, then write to the database
 *   pnpm seed <file.json | folder> --check    validate only (no database needed)
 *
 * The data lives OUTSIDE the repo. The script refuses a path inside the repo,
 * except the invented example in fixtures/.
 */
import "dotenv/config";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { employees, reports } from "../src/db/schema";
import { seedFileSchema, type SeedFile } from "../src/lib/report/schema";

const repoRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(repoRoot, "fixtures");

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function listFiles(target: string): string[] {
  const abs = path.resolve(target);
  if (!existsSync(abs)) fail(`introuvable : ${abs}`);
  const inside = abs === repoRoot || abs.startsWith(repoRoot + path.sep);
  const inFixtures = abs === fixturesDir || abs.startsWith(fixturesDir + path.sep);
  if (inside && !inFixtures) {
    fail(`refusé : ${abs} est dans le repo. Les données réelles restent hors git.`);
  }
  if (statSync(abs).isDirectory()) {
    return readdirSync(abs)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => path.join(abs, f));
  }
  return [abs];
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const target = args.find((a) => !a.startsWith("--"));
  if (!target) fail("usage : pnpm seed <fichier.json | dossier> [--check]");

  const files = listFiles(target);
  if (files.length === 0) fail("aucun fichier .json trouvé");

  const parsed: { file: string; data: SeedFile }[] = [];
  let errors = 0;
  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`✗ ${file} : JSON invalide (${(e as Error).message})`);
      errors++;
      continue;
    }
    const result = seedFileSchema.safeParse(raw);
    if (!result.success) {
      console.error(`✗ ${file}`);
      for (const issue of result.error.issues) {
        console.error(`    ${issue.path.join(".") || "(racine)"} : ${issue.message}`);
      }
      errors++;
      continue;
    }
    parsed.push({ file, data: result.data });
    console.log(`✓ ${path.basename(file)} (${result.data.report.findings.length} constats)`);
  }
  if (errors > 0) fail(`${errors} fichier(s) invalide(s). Rien n'a été écrit.`);
  if (checkOnly) {
    console.log("Validation OK. Mode --check : rien n'a été écrit.");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) fail("DATABASE_URL n'est pas défini (.env).");
  const db = drizzle(neon(url));

  for (const { data } of parsed) {
    const [employee] = await db
      .insert(employees)
      .values(data.employee)
      .onConflictDoUpdate({
        target: employees.slug,
        set: { name: data.employee.name, email: data.employee.email, role: data.employee.role },
      })
      .returning({ id: employees.id });

    await db
      .insert(reports)
      .values({
        employeeId: employee.id,
        schemaVersion: data.report.schemaVersion,
        content: data.report,
        status: data.status,
      })
      .onConflictDoUpdate({
        target: reports.employeeId,
        set: {
          schemaVersion: data.report.schemaVersion,
          content: data.report,
          status: data.status,
          updatedAt: sql`now()`,
        },
      });
    console.log(`→ ${data.employee.slug} : ${data.status}`);
  }
  console.log(`${parsed.length} rapport(s) écrit(s).`);
}

main().catch((e) => fail((e as Error).message));
