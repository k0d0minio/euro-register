import { z } from "zod";

/**
 * Contract for the content of one audit report.
 * The audit sessions write JSON that matches this schema.
 * Documentation: docs/report-schema.md. Change both files together,
 * and increase REPORT_SCHEMA_VERSION when a change is not backward compatible.
 */
export const REPORT_SCHEMA_VERSION = 1 as const;

export const SEVERITIES = ["critique", "élevé", "moyen", "faible"] as const;
export const CATEGORIES = [
  "conventions ICM",
  "efficacité tokens",
  "cohérence",
  "sécurité",
] as const;

export const severitySchema = z.enum(SEVERITIES);
export const categorySchema = z.enum(CATEGORIES);

const text = z.string().trim().min(1);

export const metricsSchema = z.object({
  fileCount: z.number().int().nonnegative(),
  totalSizeBytes: z.number().int().nonnegative(),
  markdownFileCount: z.number().int().nonnegative().optional(),
  markdownSizeBytes: z.number().int().nonnegative().optional(),
  alwaysLoadedChars: z.number().int().nonnegative(),
  alwaysLoadedTokensEstimate: z.number().int().nonnegative(),
  workflowCount: z.number().int().nonnegative().optional(),
  stageContractCount: z.number().int().nonnegative().optional(),
  largestContractChars: z.number().int().nonnegative().optional(),
  extra: z
    .array(z.object({ label: text, value: text, note: text.optional() }))
    .default([]),
});

export const strengthSchema = z.object({
  title: text,
  detail: text.optional(),
});

export const findingSchema = z.object({
  id: z.string().regex(/^[A-Z]{1,3}\d{1,3}$/, "ex. C1, C12"),
  severity: severitySchema,
  category: categorySchema,
  title: text,
  path: text.optional(),
  evidence: text,
  recommendation: text,
});

export const promptSchema = z.object({
  order: z.number().int().positive(),
  title: text,
  goal: text,
  prompt: text,
});

export const reportContentSchema = z
  .object({
    schemaVersion: z.literal(REPORT_SCHEMA_VERSION),
    auditDate: z.iso.date(),
    source: text,
    summary: z.object({
      headline: text,
      points: z.array(text).min(1),
    }),
    metrics: metricsSchema,
    strengths: z.array(strengthSchema),
    findings: z.array(findingSchema),
    prompts: z.array(promptSchema),
    nextSteps: z.array(text),
  })
  .superRefine((report, ctx) => {
    const ids = new Set<string>();
    report.findings.forEach((f, i) => {
      if (ids.has(f.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["findings", i, "id"],
          message: `id en double : ${f.id}`,
        });
      }
      ids.add(f.id);
    });
    const orders = report.prompts.map((p) => p.order).sort((a, b) => a - b);
    orders.forEach((o, i) => {
      if (o !== i + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["prompts"],
          message: "les valeurs order doivent être 1, 2, 3… sans trou ni doublon",
        });
      }
    });
  });

export type ReportContent = z.infer<typeof reportContentSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Category = z.infer<typeof categorySchema>;
export type ReportPrompt = z.infer<typeof promptSchema>;

/** Seed file: one employee and the content of their report. */
export const seedFileSchema = z.object({
  employee: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case ASCII"),
    name: text,
    email: z.email().transform((e) => e.trim().toLowerCase()),
    role: text,
  }),
  status: z.enum(["draft", "published"]).default("draft"),
  report: reportContentSchema,
});

export type SeedFile = z.infer<typeof seedFileSchema>;
