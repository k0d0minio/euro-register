import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db, employees, isDbConfigured, sessions } from "@/db";
import { isAdminEmail, isDev } from "@/lib/env";
import { hashToken, newToken } from "./crypto";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "./constants";

export type Viewer = {
  email: string;
  isAdmin: boolean;
  /** Slug of the employee's own report, when the viewer is an employee. */
  employeeSlug: string | null;
};

export async function createSession(email: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await db().insert(sessions).values({ tokenHash: hashToken(token), email, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in viewer, or null. Cached for one request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !isDbConfigured()) return null;
  const [row] = await db()
    .select({ email: sessions.email })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  return viewerForEmail(row.email);
});

/** Null when the email is neither an employee nor an admin (any more). */
export async function viewerForEmail(email: string): Promise<Viewer | null> {
  const [employee] = await db()
    .select({ slug: employees.slug })
    .from(employees)
    .where(eq(employees.email, email))
    .limit(1);
  const isAdmin = isAdminEmail(email);
  if (!employee && !isAdmin) return null;
  return { email, isAdmin, employeeSlug: employee?.slug ?? null };
}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/");
  return viewer;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured()) {
    await db().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

export function homeFor(viewer: Viewer): string {
  if (viewer.isAdmin) return "/admin";
  return viewer.employeeSlug ? `/rapport/${viewer.employeeSlug}` : "/presentation";
}
