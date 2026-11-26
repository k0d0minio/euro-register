import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, employees, questionAnswers, reports } from "@/db";
import type { Viewer } from "@/lib/auth/session";
import { ANSWER_MAX_CHARS, reportContentSchema, type ReportContent } from "./schema";
import type { TeamEntry } from "@/components/report/team-view";

export type Answers = Record<string, { answer: string; updatedAt: Date }>;

export type ReportView = {
  employee: { slug: string; name: string; role: string };
  status: "draft" | "published";
  updatedAt: Date;
  content: ReportContent;
};

/**
 * The report for one slug, when this viewer may read it:
 * an admin reads every report (drafts too); an employee reads only their own
 * published report. Everything else gives null (the page answers 404).
 */
export async function getReportForViewer(slug: string, viewer: Viewer): Promise<ReportView | null> {
  if (!viewer.isAdmin && viewer.employeeSlug !== slug) return null;
  const [row] = await db()
    .select({
      slug: employees.slug,
      name: employees.name,
      role: employees.role,
      status: reports.status,
      updatedAt: reports.updatedAt,
      content: reports.content,
    })
    .from(employees)
    .innerJoin(reports, eq(reports.employeeId, employees.id))
    .where(eq(employees.slug, slug))
    .limit(1);
  if (!row) return null;
  if (row.status !== "published" && !viewer.isAdmin) return null;
  return {
    employee: { slug: row.slug, name: row.name, role: row.role },
    status: row.status,
    updatedAt: row.updatedAt,
    // Validate on read too: the DB could hold content from an older schema.
    content: reportContentSchema.parse(row.content),
  };
}

/** The saved answers of one employee, by question id. */
export async function getAnswers(slug: string): Promise<Answers> {
  const rows = await db()
    .select({ questionId: questionAnswers.questionId, answer: questionAnswers.answer, updatedAt: questionAnswers.updatedAt })
    .from(questionAnswers)
    .innerJoin(employees, eq(employees.id, questionAnswers.employeeId))
    .where(eq(employees.slug, slug));
  return Object.fromEntries(rows.map((r) => [r.questionId, { answer: r.answer, updatedAt: r.updatedAt }]));
}

/**
 * Save the answers of one employee to the `employé` questions of their published report.
 * An empty answer removes the saved answer. Returns false when the report is not open to answers.
 */
export async function saveAnswers(slug: string, answers: Record<string, string>): Promise<boolean> {
  const [row] = await db()
    .select({ employeeId: employees.id, status: reports.status, content: reports.content })
    .from(employees)
    .innerJoin(reports, eq(reports.employeeId, employees.id))
    .where(eq(employees.slug, slug))
    .limit(1);
  if (!row || row.status !== "published") return false;
  const content = reportContentSchema.parse(row.content);
  const allowed = new Set((content.openQuestions ?? []).filter((q) => q.askTo === "employé").map((q) => q.id));
  const toSave: { questionId: string; answer: string }[] = [];
  const toDelete: string[] = [];
  for (const [questionId, raw] of Object.entries(answers)) {
    if (!allowed.has(questionId)) continue;
    const answer = raw.trim().slice(0, ANSWER_MAX_CHARS);
    if (answer) toSave.push({ questionId, answer });
    else toDelete.push(questionId);
  }
  if (toDelete.length > 0) {
    await db()
      .delete(questionAnswers)
      .where(and(eq(questionAnswers.employeeId, row.employeeId), inArray(questionAnswers.questionId, toDelete)));
  }
  if (toSave.length > 0) {
    await db()
      .insert(questionAnswers)
      .values(toSave.map((a) => ({ employeeId: row.employeeId, ...a })))
      .onConflictDoUpdate({
        target: [questionAnswers.employeeId, questionAnswers.questionId],
        set: { answer: sql`excluded.answer`, updatedAt: sql`now()` },
      });
  }
  return true;
}

/** The team page: the team opportunities and the `équipe` questions of each published report. */
export async function getTeamEntries(): Promise<TeamEntry[]> {
  const rows = await db()
    .select({ slug: employees.slug, name: employees.name, content: reports.content })
    .from(employees)
    .innerJoin(reports, eq(reports.employeeId, employees.id))
    .where(eq(reports.status, "published"))
    .orderBy(asc(employees.name));
  return rows.map((r) => {
    const content = reportContentSchema.parse(r.content);
    return {
      employee: { slug: r.slug, name: r.name },
      opportunities: content.collaboration?.teamOpportunities ?? [],
      questions: (content.openQuestions ?? []).filter((q) => q.askTo === "équipe"),
    };
  });
}

/** For each employee slug: the question ids that have a saved answer. */
export async function answeredIdsBySlug(): Promise<Record<string, Set<string>>> {
  const rows = await db()
    .select({ slug: employees.slug, questionId: questionAnswers.questionId })
    .from(questionAnswers)
    .innerJoin(employees, eq(employees.id, questionAnswers.employeeId));
  const ids: Record<string, Set<string>> = {};
  for (const r of rows) (ids[r.slug] ??= new Set()).add(r.questionId);
  return ids;
}

export async function listReportsForAdmin() {
  return db()
    .select({
      slug: employees.slug,
      name: employees.name,
      role: employees.role,
      status: reports.status,
      updatedAt: reports.updatedAt,
      content: reports.content,
    })
    .from(employees)
    .leftJoin(reports, eq(reports.employeeId, employees.id))
    .orderBy(asc(employees.name));
}
