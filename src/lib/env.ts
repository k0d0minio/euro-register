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

export const isDev = process.env.NODE_ENV !== "production";
