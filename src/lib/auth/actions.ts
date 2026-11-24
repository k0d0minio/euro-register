"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDbConfigured } from "@/db";
import { consumeMagicLink, issueMagicLink } from "./magic-link";
import { createSession, destroySession, homeFor, viewerForEmail } from "./session";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

export async function requestMagicLink(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) {
    return { status: "error", message: "Adresse e-mail invalide." };
  }
  if (!isDbConfigured()) {
    return { status: "error", message: "Service indisponible (base de données non configurée)." };
  }
  // Work after the response: same answer and about the same time, allowed email or not.
  after(async () => {
    try {
      await issueMagicLink(parsed.data);
    } catch (e) {
      console.error("[auth] issueMagicLink failed:", (e as Error).message);
    }
  });
  return { status: "sent" };
}

export async function verifyMagicLink(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const email = await consumeMagicLink(token);
  if (!email) redirect("/connexion/verifier?erreur=1");
  const viewer = await viewerForEmail(email);
  if (!viewer) redirect("/connexion/verifier?erreur=1");
  await createSession(email);
  redirect(homeFor(viewer));
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
