"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { CATEGORIES, SEVERITIES, type Category, type Finding, type Severity } from "@/lib/report/schema";
import { CategoryTag, SeverityBadge, severityColors, severityLabel } from "@/components/ui/badges";
import { RichText } from "@/components/ui/rich-text";

const rank: Record<Severity, number> = { critique: 0, élevé: 1, moyen: 2, faible: 3 };

export function FindingsList({ findings }: { findings: Finding[] }) {
  const [severities, setSeverities] = useState<Set<Severity>>(new Set());
  const [category, setCategory] = useState<Category | null>(null);
  const reduce = useReducedMotion();

  const sorted = useMemo(
    () => [...findings].sort((a, b) => rank[a.severity] - rank[b.severity]),
    [findings],
  );
  const visible = sorted.filter(
    (f) => (severities.size === 0 || severities.has(f.severity)) && (!category || f.category === category),
  );
  const countBy = (s: Severity) => findings.filter((f) => f.severity === s).length;
  const toggle = (s: Severity) =>
    setSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const total = findings.length || 1;

  return (
    <div>
      {/* Distribution bar */}
      <div className="mb-5 flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        {SEVERITIES.map((s) => (
          <div key={s} style={{ width: `${(countBy(s) / total) * 100}%`, background: severityColors(s).color }} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par gravité">
        {SEVERITIES.map((s) => {
          const n = countBy(s);
          const active = severities.has(s);
          return (
            <button
              key={s}
              type="button"
              disabled={n === 0}
              aria-pressed={active}
              onClick={() => toggle(s)}
              style={active ? { ...severityColors(s), borderColor: "currentColor" } : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-muted disabled:opacity-40 disabled:hover:border-line"
            >
              <span aria-hidden className="size-2 rounded-full" style={{ background: severityColors(s).color }} />
              {severityLabel[s]}
              <span className="tabular-nums text-muted">{n}</span>
            </button>
          );
        })}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
        <label className="sr-only" htmlFor="filtre-categorie">Catégorie</label>
        <select
          id="filtre-categorie"
          value={category ?? ""}
          onChange={(e) => setCategory((e.target.value || null) as Category | null)}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({findings.filter((f) => f.category === c).length})
            </option>
          ))}
        </select>
        {(severities.size > 0 || category) && (
          <button
            type="button"
            onClick={() => {
              setSeverities(new Set());
              setCategory(null);
            }}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {visible.length} constat{visible.length > 1 ? "s" : ""} sur {findings.length}
      </p>

      <ul className="mt-3 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((f) => (
            <motion.li
              key={f.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <FindingCard finding={f} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Aucun constat ne correspond à ces filtres.
        </p>
      )}
    </div>
  );
}

function FindingCard({ finding: f }: { finding: Finding }) {
  return (
    <article
      id={`constat-${f.id}`}
      className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 pl-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: severityColors(f.severity).color }} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">{f.id}</span>
        <SeverityBadge severity={f.severity} />
        <CategoryTag category={f.category} />
      </div>
      <h3 className="mt-2.5 text-base font-semibold leading-snug">
        <RichText text={f.title} />
      </h3>
      {f.path && (
        <p className="mt-1 font-mono text-xs text-muted break-all">{f.path}</p>
      )}
      <dl className="mt-4 grid gap-4 text-sm leading-relaxed md:grid-cols-2">
        <div>
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Constat</dt>
          <dd><RichText text={f.evidence} /></dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Recommandation</dt>
          <dd><RichText text={f.recommendation} /></dd>
        </div>
      </dl>
    </article>
  );
}
