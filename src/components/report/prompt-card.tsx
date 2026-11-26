"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ReportPrompt } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for a page with no clipboard permission.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function PromptCard({ prompt }: { prompt: ReportPrompt }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function onCopy() {
    const ok = await copyText(prompt.prompt);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <article className="grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-[auto_1fr]">
      <div
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-accent font-serif text-lg text-accent-ink"
      >
        {prompt.order}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold leading-snug">
          <span className="sr-only">Étape {prompt.order} : </span>
          {prompt.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          <RichText text={prompt.goal} />
        </p>
        <div className="relative mt-4 rounded-lg bg-code-bg text-code-ink">
          <button
            type="button"
            onClick={onCopy}
            className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-code-ink transition-colors hover:bg-white/20"
            aria-label={`Copier le prompt ${prompt.order}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {state === "copied" ? "✓ Copié" : state === "failed" ? "Échec de la copie" : "Copier"}
              </motion.span>
            </AnimatePresence>
          </button>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 pr-24 font-mono text-[13px] leading-relaxed">
            {prompt.prompt}
          </pre>
        </div>
      </div>
    </article>
  );
}
