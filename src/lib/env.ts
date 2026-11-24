import "server-only";

export function appUrl(): string {
  const url = process.env.APP_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("APP_URL is not set");
  return "http://localhost:3000";
}

/** ADMIN_EMAILS: comma-separated list. Stored and compared in lowercase. */
export function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().has(email.trim().toLowerCase());
}

/**
 * EMPLOYEE_EMAILS: comma-separated `slug=email` pairs, e.g. `prenom-nom=prenom.nom@…`.
 * The employee emails live only here (J, 2026-11-24), never in git or in the database.
 * Returns a map from lowercase email to slug.
 */
export function employeeEmails(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (process.env.EMPLOYEE_EMAILS ?? "").split(",")) {
    const i = pair.indexOf("=");
    if (i < 1) continue;
    const slug = pair.slice(0, i).trim();
    const email = pair.slice(i + 1).trim().toLowerCase();
    if (slug && email) map.set(email, slug);
  }
  return map;
}

export function slugForEmail(email: string): string | null {
  return employeeEmails().get(email.trim().toLowerCase()) ?? null;
}

export const isDev = process.env.NODE_ENV !== "production";
