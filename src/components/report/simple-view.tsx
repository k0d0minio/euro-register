"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import type { Simple, SimpleAction } from "@/lib/report/schema";
import { copyText } from "./prompt-card";

/**
 * The simple view of a version 5 report: what the employee reads first.
 * Plain words, large type, no ids or codes (J, 2026-11-26).
 */
export function SimpleView({ simple }: { simple: Simple }) {
  const actions = [...simple.actions].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-14">
      <p className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">{simple.headline}</p>

      <section aria-labelledby="ce-qui-marche">
        <h2 id="ce-qui-marche" className="font-serif text-2xl tracking-tight sm:text-3xl">Ce qui marche bien</h2>
        <ul className="mt-6 space-y-4">
          {simple.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-4 text-lg leading-relaxed">
              <span aria-hidden className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm text-accent">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="a-faire">
        <h2 id="a-faire" className="font-serif text-2xl tracking-tight sm:text-3xl">À faire</h2>
        <ol className="mt-6 space-y-5">
          {actions.map((a) => (
            <li key={a.order}><ActionCard action={a} /></li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ActionCard({ action }: { action: SimpleAction }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [open, setOpen] = useState(false);
  const promptId = useId();

  async function onCopy() {
    const ok = await copyText(action.prompt);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <article className="flex gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-accent font-serif text-2xl text-accent-ink">
        {action.order}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-semibold leading-snug sm:text-2xl">
          <span className="sr-only">Action {action.order} : </span>
          {action.title}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          <span className="font-medium text-ink">Pourquoi :</span> {action.why}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-12 items-center rounded-xl bg-accent px-5 py-3 text-base font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                aria-live="polite"
              >
                {state === "copied" ? "✓ Copié" : state === "failed" ? "La copie n'a pas marché" : "Copier le message pour Claude"}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={promptId}
            className="text-sm text-muted underline underline-offset-4 hover:text-accent"
          >
            {open ? "cacher le message" : "voir le message"}
          </button>
        </div>
        {open && (
          <pre
            id={promptId}
            className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-code-bg p-4 font-mono text-[13px] leading-relaxed text-code-ink"
          >
            {action.prompt}
          </pre>
        )}
      </div>
    </article>
  );
}
