import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, employees, reports } from "@/db";
import type { Viewer } from "@/lib/auth/session";
import { reportContentSchema, type ReportContent } from "./schema";

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
