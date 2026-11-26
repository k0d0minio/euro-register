"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/session";
import { saveAnswers } from "./repo";

export type AnswersState = { status: "idle" | "saved" | "error"; message?: string };

/** The employee saves the answers to the `employé` questions of their own report. */
export async function submitAnswers(_prev: AnswersState, formData: FormData): Promise<AnswersState> {
  const viewer = await getViewer();
  const slug = String(formData.get("slug") ?? "");
  if (!viewer || !slug || viewer.employeeSlug !== slug) {
    return { status: "error", message: "Seul l'employé de ce rapport peut répondre." };
  }
  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q:") && typeof value === "string") answers[key.slice(2)] = value;
  }
  const ok = await saveAnswers(slug, answers);
  if (!ok) return { status: "error", message: "Ce rapport n'accepte pas de réponses pour le moment." };
  revalidatePath(`/rapport/${slug}`);
  return { status: "saved", message: "Réponses enregistrées." };
}
