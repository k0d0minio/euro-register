import { CATEGORIES, type Score } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";

/** Colour of a score: 1–2 red, 3 amber, 4–5 the accent. */
function scoreColor(score: number) {
  if (score <= 2) return "var(--sev-critique)";
  if (score === 3) return "var(--sev-moyen)";
  return "var(--accent)";
}

export function ScoresView({ scores }: { scores: Score[] }) {
  const ordered = CATEGORIES.map((c) => scores.find((s) => s.category === c)).filter((s): s is Score => Boolean(s));
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {ordered.map((s) => (
        <li key={s.category} className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold first-letter:uppercase">{s.category}</h3>
            <p className="font-serif text-2xl tabular-nums tracking-tight" style={{ color: scoreColor(s.score) }}>
              {s.score}
              <span className="text-sm text-muted"> / 5</span>
            </p>
          </div>
          <div className="mt-2 flex gap-1" role="img" aria-label={`Note ${s.score} sur 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                aria-hidden
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i <= s.score ? scoreColor(s.score) : "var(--surface-2)" }}
              />
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted"><RichText text={s.reason} /></p>
        </li>
      ))}
    </ul>
  );
}
