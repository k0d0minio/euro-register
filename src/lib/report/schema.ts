import { z } from "zod";

/**
 * Contract for the content of one audit report.
 * The audit sessions write JSON that matches this schema.
 * Documentation: docs/report-schema.md. Change both files together,
 * and increase REPORT_SCHEMA_VERSION when a change is not backward compatible.
 */
export const REPORT_SCHEMA_VERSION = 2 as const;
/** Versions that the app still reads. Version 1 has no `collaboration`. */
export const SUPPORTED_SCHEMA_VERSIONS = [1, 2] as const;

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

export const EFFORTS = ["faible", "moyen", "élevé"] as const;

export const collaborationLinkSchema = z.object({
  direction: z.enum(["sortant", "entrant"]),
  /** Employee slug or a role. */
  counterpart: text,
  /** Shared folder path or tool. */
  channel: text,
  content: text,
  frequency: text,
  /** Path of the LISEZ-MOI / README that governs the exchange, or null. */
  contract: text.nullable(),
  /** Workspace path that shows the link. */
  evidence: text,
});

export const collaborationOpportunitySchema = z.object({
  counterpart: text,
  idea: text,
  value: text,
  whatToShare: text,
  effort: z.enum(EFFORTS),
});

export const collaborationSchema = z.object({
  summary: text,
  currentLinks: z.array(collaborationLinkSchema),
  opportunities: z.array(collaborationOpportunitySchema),
  safeguards: z.array(text),
  prompts: z.array(promptSchema),
});

function checkOrder(prompts: { order: number }[], path: (string | number)[], ctx: z.core.$RefinementCtx) {
  const orders = prompts.map((p) => p.order).sort((a, b) => a - b);
  if (orders.some((o, i) => o !== i + 1)) {
    ctx.addIssue({
      code: "custom",
      path,
      message: "les valeurs order doivent être 1, 2, 3… sans trou ni doublon",
    });
  }
}

export const reportContentSchema = z
  .object({
    schemaVersion: z.union([z.literal(1), z.literal(2)]),
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
    /** Required from version 2. */
    collaboration: collaborationSchema.optional(),
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
    checkOrder(report.prompts, ["prompts"], ctx);
    if (report.collaboration) {
      checkOrder(report.collaboration.prompts, ["collaboration", "prompts"], ctx);
    } else if (report.schemaVersion >= 2) {
      ctx.addIssue({
        code: "custom",
        path: ["collaboration"],
        message: "obligatoire à partir de schemaVersion 2",
      });
    }
  });

export type ReportContent = z.infer<typeof reportContentSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Category = z.infer<typeof categorySchema>;
export type ReportPrompt = z.infer<typeof promptSchema>;
export type Collaboration = z.infer<typeof collaborationSchema>;
export type Effort = (typeof EFFORTS)[number];

/** Seed file: one employee and the content of their report. */
export const seedFileSchema = z.object({
  employee: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case ASCII"),
    name: text,
    /** Optional and never stored: the sign-in emails are in EMPLOYEE_EMAILS. `--print-env` reads it. */
    email: z.email().transform((e) => e.trim().toLowerCase()).optional(),
    role: text,
  }),
  status: z.enum(["draft", "published"]).default("draft"),
  report: reportContentSchema,
});

export type SeedFile = z.infer<typeof seedFileSchema>;
