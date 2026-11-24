import type { Collaboration, Effort } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";
import { PromptCard } from "./prompt-card";

const effortStyle: Record<Effort, { label: string; color: string; background: string }> = {
  faible: { label: "Effort faible", color: "var(--sev-faible)", background: "var(--sev-faible-bg)" },
  moyen: { label: "Effort moyen", color: "var(--sev-moyen)", background: "var(--sev-moyen-bg)" },
  élevé: { label: "Effort élevé", color: "var(--sev-eleve)", background: "var(--sev-eleve-bg)" },
};

function Node({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
        strong ? "bg-accent text-accent-ink" : "border border-line bg-surface-2"
      }`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function Arrow({ via }: { via: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col items-center px-1 text-muted">
      <span className="max-w-full truncate font-mono text-[11px]" title={via}>{via}</span>
      <span aria-hidden className="relative mt-1 h-px w-full min-w-10 bg-current">
        <span className="absolute -right-0.5 -top-[3px] size-0 border-y-[3.5px] border-l-[6px] border-y-transparent border-l-current" />
      </span>
    </span>
  );
}

export function CollaborationView({ data: c }: { data: Collaboration }) {
  const prompts = [...c.prompts].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-10">
      <p className="text-[15px] leading-relaxed"><RichText text={c.summary} /></p>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Échanges actuels</h3>
        {c.currentLinks.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line p-5 text-sm text-muted">
            Aucun échange avec un autre espace aujourd&apos;hui.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {c.currentLinks.map((l, i) => (
              <li key={i} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center gap-2" aria-label={l.direction === "sortant" ? `Vous vers ${l.counterpart}` : `${l.counterpart} vers vous`}>
                  {l.direction === "sortant" ? (
                    <><Node label="Votre espace" strong /><Arrow via={l.channel} /><Node label={l.counterpart} /></>
                  ) : (
                    <><Node label={l.counterpart} /><Arrow via={l.channel} /><Node label="Votre espace" strong /></>
                  )}
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-muted">Contenu</dt><dd><RichText text={l.content} /></dd></div>
                  <div><dt className="text-xs text-muted">Fréquence</dt><dd><RichText text={l.frequency} /></dd></div>
                  <div>
                    <dt className="text-xs text-muted">Contrat (LISEZ-MOI)</dt>
                    <dd>
                      {l.contract ? (
                        <code className="font-mono text-xs break-all">{l.contract}</code>
                      ) : (
                        <span style={{ color: "var(--sev-eleve)" }}>Aucun contrat écrit</span>
                      )}
                    </dd>
                  </div>
                  <div><dt className="text-xs text-muted">Preuve</dt><dd className="font-mono text-xs break-all text-muted">{l.evidence}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      {c.opportunities.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Opportunités</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {c.opportunities.map((o, i) => (
              <li key={i} className="flex flex-col rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">Avec <span className="font-medium text-ink">{o.counterpart}</span></span>
                  <span style={effortStyle[o.effort]} className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {effortStyle[o.effort].label}
                  </span>
                </div>
                <p className="mt-2 font-semibold leading-snug"><RichText text={o.idea} /></p>
                <p className="mt-2 text-sm leading-relaxed text-muted"><RichText text={o.value} /></p>
                <p className="mt-3 border-t border-line pt-3 text-sm">
                  <span className="text-xs text-muted">À partager : </span>
                  <RichText text={o.whatToShare} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {c.safeguards.length > 0 && (
        <div className="rounded-xl bg-accent-soft p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Garde-fous</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {c.safeguards.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-0.5 text-accent">◆</span>
                <span><RichText text={s} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {prompts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Prompts pour mettre en place l&apos;échange</h3>
          <ol className="mt-3 space-y-4">
            {prompts.map((p) => (
              <li key={p.order}><PromptCard prompt={p} /></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
