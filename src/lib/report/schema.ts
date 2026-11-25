import { z } from "zod";

/**
 * Contract for the content of one audit report.
 * The audit sessions write JSON that matches this schema.
 * Documentation: docs/report-schema.md. Change both files together,
 * and increase REPORT_SCHEMA_VERSION when a change is not backward compatible.
 */
export const REPORT_SCHEMA_VERSION = 3 as const;
/**
 * Versions that the app still reads. Version 1 has no `collaboration`.
 * Version 2 has no `structure`, `risks`, `openQuestions` or `notes`.
 */
export const SUPPORTED_SCHEMA_VERSIONS = [1, 2, 3] as const;

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

export const LEVELS = ["faible", "moyen", "élevé"] as const;
export const NODE_KINDS = ["dossier", "fichier"] as const;
export const NODE_STATUSES = ["ok", "attention", "problème"] as const;
export const ASK_TO = ["employé", "J", "équipe"] as const;

const findingIds = z.array(text);

export const structureNodeSchema = z.object({
  /** Relative to the root, "/" separators, no leading or trailing "/". "" is the root. */
  path: z
    .string()
    .trim()
    .refine((p) => !p.startsWith("/") && !p.endsWith("/") && !p.includes("//"), "chemin relatif, sans « / » au début ni à la fin"),
  kind: z.enum(NODE_KINDS),
  description: text,
  status: z.enum(NODE_STATUSES),
  findingIds,
  sizeBytes: z.number().int().nonnegative().optional(),
  chars: z.number().int().nonnegative().optional(),
});

export const structureSchema = z.object({
  root: text,
  summary: text,
  nodes: z.array(structureNodeSchema).min(1),
});

export const riskSchema = z.object({
  id: z.string().regex(/^R\d{1,3}$/, "ex. R1, R12"),
  title: text,
  description: text,
  likelihood: z.enum(LEVELS),
  impact: z.enum(LEVELS),
  mitigation: text,
  findingIds,
});

export const openQuestionSchema = z.object({
  id: z.string().regex(/^Q\d{1,3}$/, "ex. Q1, Q12"),
  question: text,
  context: text,
  askTo: z.enum(ASK_TO),
});

export const noteSchema = z.object({ title: text, detail: text });

/** The parent path of a node path. The root ("") has no parent. */
export function parentPath(path: string): string | null {
  if (path === "") return null;
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

function checkUniqueIds(items: { id: string }[], path: string, ctx: z.core.$RefinementCtx) {
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (seen.has(it.id)) ctx.addIssue({ code: "custom", path: [path, i, "id"], message: `id en double : ${it.id}` });
    seen.add(it.id);
  });
}

function checkFindingRefs(
  refs: string[],
  known: Set<string>,
  path: (string | number)[],
  ctx: z.core.$RefinementCtx,
) {
  refs.forEach((id, j) => {
    if (!known.has(id)) ctx.addIssue({ code: "custom", path: [...path, j], message: `constat inconnu : ${id}` });
  });
}

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
    schemaVersion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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
    /** Required from version 3. */
    structure: structureSchema.optional(),
    /** Required from version 3. */
    risks: z.array(riskSchema).optional(),
    /** Required from version 3. */
    openQuestions: z.array(openQuestionSchema).optional(),
    /** Optional. Version 3. */
    notes: z.array(noteSchema).optional(),
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
    if (report.schemaVersion >= 3) {
      for (const key of ["structure", "risks", "openQuestions"] as const) {
        if (report[key] === undefined) {
          ctx.addIssue({ code: "custom", path: [key], message: "obligatoire à partir de schemaVersion 3" });
        }
      }
    }
    if (report.structure) {
      const nodes = report.structure.nodes;
      const paths = new Map<string, (typeof nodes)[number]>();
      nodes.forEach((n, i) => {
        if (paths.has(n.path)) {
          ctx.addIssue({ code: "custom", path: ["structure", "nodes", i, "path"], message: `chemin en double : « ${n.path} »` });
        }
        paths.set(n.path, n);
        checkFindingRefs(n.findingIds, ids, ["structure", "nodes", i, "findingIds"], ctx);
      });
      nodes.forEach((n, i) => {
        const parent = parentPath(n.path);
        if (parent === null) return;
        const p = paths.get(parent);
        if (!p) {
          ctx.addIssue({
            code: "custom",
            path: ["structure", "nodes", i, "path"],
            message: `le dossier parent « ${parent} » n'a pas de nœud`,
          });
        } else if (p.kind !== "dossier") {
          ctx.addIssue({
            code: "custom",
            path: ["structure", "nodes", i, "path"],
            message: `le parent « ${parent} » est un fichier`,
          });
        }
      });
    }
    if (report.risks) {
      checkUniqueIds(report.risks, "risks", ctx);
      report.risks.forEach((r, i) => checkFindingRefs(r.findingIds, ids, ["risks", i, "findingIds"], ctx));
    }
    if (report.openQuestions) checkUniqueIds(report.openQuestions, "openQuestions", ctx);
  });

export type ReportContent = z.infer<typeof reportContentSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Category = z.infer<typeof categorySchema>;
export type ReportPrompt = z.infer<typeof promptSchema>;
export type Collaboration = z.infer<typeof collaborationSchema>;
export type Effort = (typeof EFFORTS)[number];
export type Level = (typeof LEVELS)[number];
export type Structure = z.infer<typeof structureSchema>;
export type StructureNode = z.infer<typeof structureNodeSchema>;
export type NodeStatus = (typeof NODE_STATUSES)[number];
export type Risk = z.infer<typeof riskSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type AskTo = (typeof ASK_TO)[number];
export type Note = z.infer<typeof noteSchema>;

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
