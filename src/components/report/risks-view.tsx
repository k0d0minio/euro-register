import { LEVELS, type Level, type Risk } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";

const levelRank: Record<Level, number> = { faible: 0, moyen: 1, élevé: 2 };
const levelLabel: Record<Level, string> = { faible: "Faible", moyen: "Moyen", élevé: "Élevé" };

/** Score 1 to 9: (likelihood + 1) × (impact + 1). */
const score = (r: Pick<Risk, "likelihood" | "impact">) => (levelRank[r.likelihood] + 1) * (levelRank[r.impact] + 1);

function scoreTone(s: number) {
  if (s >= 6) return { color: "var(--sev-critique)", background: "var(--sev-critique-bg)" };
  if (s === 4) return { color: "var(--sev-eleve)", background: "var(--sev-eleve-bg)" };
  if (s === 3) return { color: "var(--sev-moyen)", background: "var(--sev-moyen-bg)" };
  return { color: "var(--sev-faible)", background: "var(--sev-faible-bg)" };
}

function LevelTag({ label, level }: { label: string; level: Level }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
      {label} : <span className="font-semibold text-ink">{levelLabel[level]}</span>
    </span>
  );
}

export function RisksView({ risks }: { risks: Risk[] }) {
  const sorted = [...risks].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id, "fr", { numeric: true }));
  const impactsTopDown = [...LEVELS].reverse();

  return (
    <div className="space-y-8">
      <figure className="overflow-x-auto">
        <div className="grid min-w-[30rem] grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5 text-sm">
          {impactsTopDown.map((impact, row) => (
            <div key={impact} className="contents">
              <div className="flex items-center justify-end pr-2 text-xs text-muted">
                {row === 0 && <span className="sr-only">Impact </span>}
                {levelLabel[impact]}
              </div>
              {LEVELS.map((likelihood) => {
                const cell = sorted.filter((r) => r.likelihood === likelihood && r.impact === impact);
                const tone = scoreTone(score({ likelihood, impact }));
                return (
                  <div
                    key={likelihood}
                    className="flex min-h-20 flex-wrap content-start gap-1.5 rounded-lg p-2"
                    style={{ background: tone.background }}
                    aria-label={`Probabilité ${likelihood}, impact ${impact} : ${cell.length} risque(s)`}
                  >
                    {cell.map((r) => (
                      <a
                        key={r.id}
                        href={`#risque-${r.id}`}
                        title={r.title}
                        className="rounded-md bg-surface px-2 py-0.5 font-mono text-xs font-semibold shadow-sm transition-transform hover:-translate-y-px"
                        style={{ color: tone.color }}
                      >
                        {r.id}
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          <div />
          {LEVELS.map((l) => (
            <div key={l} className="pt-1 text-center text-xs text-muted">{levelLabel[l]}</div>
          ))}
        </div>
        <figcaption className="mt-2 flex justify-between pl-14 text-xs text-muted">
          <span>↑ Impact</span>
          <span>Probabilité →</span>
        </figcaption>
      </figure>

      <ul className="space-y-3">
        {sorted.map((r) => {
          const tone = scoreTone(score(r));
          return (
            <li key={r.id}>
              <article
                id={`risque-${r.id}`}
                className="relative scroll-mt-24 overflow-hidden rounded-xl border border-line bg-surface p-5 pl-6 target:ring-2 target:ring-accent"
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: tone.color }} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted">{r.id}</span>
                  <LevelTag label="Probabilité" level={r.likelihood} />
                  <LevelTag label="Impact" level={r.impact} />
                </div>
                <h3 className="mt-2.5 font-semibold leading-snug"><RichText text={r.title} /></h3>
                <dl className="mt-3 grid gap-4 text-sm leading-relaxed md:grid-cols-2">
                  <div>
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Risque</dt>
                    <dd><RichText text={r.description} /></dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Parade</dt>
                    <dd><RichText text={r.mitigation} /></dd>
                  </div>
                </dl>
                {r.findingIds.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    Constats liés :
                    {r.findingIds.map((id) => (
                      <a
                        key={id}
                        href={`#constat-${id}`}
                        className="rounded-md border border-line px-1.5 py-px font-mono text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        {id}
                      </a>
                    ))}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
