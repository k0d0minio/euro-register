import "server-only";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db, magicLinkTokens } from "@/db";
import { appUrl, isAdminEmail, slugForEmail } from "@/lib/env";
import { sendMagicLink } from "@/lib/mail";
import { hashToken, newToken, normalizeEmail } from "./crypto";
import { MAGIC_LINK_MAX_PER_WINDOW, MAGIC_LINK_TTL_MINUTES } from "./constants";

/** True when the email may sign in: in EMPLOYEE_EMAILS or in ADMIN_EMAILS. */
export async function isAllowedEmail(email: string): Promise<boolean> {
  return isAdminEmail(email) || slugForEmail(email) !== null;
}

/**
 * Issue and send a link when the email is allowed. Silent when it is not:
 * the caller always shows the same answer, so nobody learns which emails exist.
 */
export async function issueMagicLink(rawEmail: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!(await isAllowedEmail(email))) return;

  const now = Date.now();
  const windowStart = new Date(now - MAGIC_LINK_TTL_MINUTES * 60_000);
  const [{ value: recent }] = await db()
    .select({ value: count() })
    .from(magicLinkTokens)
    .where(and(eq(magicLinkTokens.email, email), gt(magicLinkTokens.createdAt, windowStart)));
  if (recent >= MAGIC_LINK_MAX_PER_WINDOW) return;

  const token = newToken();
  await db()
    .insert(magicLinkTokens)
    .values({
      tokenHash: hashToken(token),
      email,
      expiresAt: new Date(now + MAGIC_LINK_TTL_MINUTES * 60_000),
    });
  const link = `${appUrl()}/connexion/verifier?token=${encodeURIComponent(token)}`;
  await sendMagicLink(email, link);
}

/**
 * Consume a token one time. The UPDATE is atomic: a second use, an expired
 * token or an unknown token gives null.
 */
export async function consumeMagicLink(token: string): Promise<string | null> {
  if (!token || token.length > 200) return null;
  const rows = await db()
    .update(magicLinkTokens)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(magicLinkTokens.tokenHash, hashToken(token)),
        isNull(magicLinkTokens.consumedAt),
        gt(magicLinkTokens.expiresAt, new Date()),
      ),
    )
    .returning({ email: magicLinkTokens.email });
  const email = rows[0]?.email;
  if (!email) return null;
  // Access can be removed between the request and the click.
  return (await isAllowedEmail(email)) ? email : null;
}
