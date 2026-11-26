"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { submitAnswers, type AnswersState } from "@/lib/report/actions";
import type { OpenQuestion } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";

type Props = {
  slug: string;
  questions: OpenQuestion[];
  answers: Record<string, string>;
  maxChars: number;
  /** The development preview shows the form with no save. */
  disabled?: boolean;
  /** The simple view of version 5 shows no question id. */
  showIds?: boolean;
};

export function AnswersForm({ slug, questions, answers, maxChars, disabled = false, showIds = true }: Props) {
  const [state, action, pending] = useActionState<AnswersState, FormData>(submitAnswers, { status: "idle" });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} id={`question-${q.id}`} className="scroll-mt-24 rounded-xl border border-line bg-surface p-5">
            <label htmlFor={`reponse-${q.id}`} className="flex gap-3 font-semibold leading-snug">
              {showIds && <span className="mt-px shrink-0 font-mono text-xs font-normal text-muted">{q.id}</span>}
              <span><RichText text={q.question} /></span>
            </label>
            <p className={`mt-2 text-sm ${showIds ? "pl-8" : ""} leading-relaxed text-muted`}><RichText text={q.context} /></p>
            <div className={`mt-3 ${showIds ? "pl-8" : ""}`}>
              <textarea
                id={`reponse-${q.id}`}
                name={`q:${q.id}`}
                defaultValue={answers[q.id] ?? ""}
                maxLength={maxChars}
                rows={3}
                disabled={disabled}
                placeholder="Votre réponse…"
                className="w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:opacity-60"
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || disabled}
          className="rounded-lg bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <AnimatePresence mode="wait" initial={false}>
          {state.status !== "idle" && !pending && (
            <motion.p
              key={state.status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role={state.status === "error" ? "alert" : "status"}
              className="text-sm"
              style={{ color: state.status === "error" ? "var(--sev-critique)" : "var(--accent)" }}
            >
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>
        {disabled && <p className="text-sm text-muted">Aperçu : l&apos;enregistrement est désactivé.</p>}
      </div>
    </form>
  );
}
