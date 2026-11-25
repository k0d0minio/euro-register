import type { ReportContent, Severity } from "@/lib/report/schema";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { FindingsList } from "./findings-list";
import { PromptCard } from "./prompt-card";
import { CollaborationView } from "./collaboration-view";
import { formatBytes, formatDate, nf, nodeAnchor } from "./format";
import { NotesView, QuestionsView } from "./questions-view";
import { RisksView } from "./risks-view";
import { StructureTree } from "./structure-tree";
import { Toc, TocMobile, type TocItem } from "./toc";
import type { NodeLinks } from "./findings-list";
import { SeverityBadge, StatusBadge } from "@/components/ui/badges";

type Props = {
  employee: { name: string; role: string };
  status: "draft" | "published";
  updatedAt?: Date;
  content: ReportContent;
};

const rank: Record<Severity, number> = { critique: 0, élevé: 1, moyen: 2, faible: 3 };

function Section({ id, title, children, intro }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ReportView({ employee, status, updatedAt, content: r }: Props) {
  const m = r.metrics;
  const stats: { label: string; value: string; note?: string }[] = [
    { label: "Fichiers", value: nf.format(m.fileCount) },
    { label: "Taille totale", value: formatBytes(m.totalSizeBytes) },
    {
      label: "Contexte toujours chargé",
      value: `≈ ${nf.format(m.alwaysLoadedTokensEstimate)} tokens`,
      note: `${nf.format(m.alwaysLoadedChars)} caractères à chaque tour`,
    },
  ];
  if (m.markdownFileCount !== undefined)
    stats.push({
      label: "Fichiers Markdown",
      value: nf.format(m.markdownFileCount),
      note: m.markdownSizeBytes !== undefined ? formatBytes(m.markdownSizeBytes) : undefined,
    });
  if (m.workflowCount !== undefined) stats.push({ label: "Processus", value: nf.format(m.workflowCount) });
  if (m.stageContractCount !== undefined) stats.push({ label: "Contrats d'étape", value: nf.format(m.stageContractCount) });
  if (m.largestContractChars !== undefined)
    stats.push({
      label: "Plus gros contrat",
      value: `${nf.format(m.largestContractChars)} car.`,
      note: m.largestContractChars > 2400 ? "au-dessus de la limite ICM (2 400)" : "sous la limite ICM (2 400)",
    });
  for (const e of m.extra) stats.push(e);

  const prompts = [...r.prompts].sort((a, b) => a.order - b.order);
  const findingsBySeverity = [...r.findings].sort((a, b) => rank[a.severity] - rank[b.severity]);
  const structure = r.structure;
  const risks = r.risks ?? [];
  const questions = r.openQuestions ?? [];
  const notes = r.notes ?? [];

  // Finding → node of the tree: the node that names the finding, else the node of its path.
  const nodeLinks: NodeLinks = {};
  if (structure) {
    const byPath = new Map(structure.nodes.map((n, i) => [n.path, i]));
    structure.nodes.forEach((n, i) =>
      n.findingIds.forEach((id) => {
        nodeLinks[id] ??= { anchor: nodeAnchor(i), path: n.path };
      }),
    );
    for (const f of r.findings) {
      if (nodeLinks[f.id] || !f.path) continue;
      const i = byPath.get(f.path.replace(/^\/+|\/+$/g, ""));
      if (i !== undefined) nodeLinks[f.id] = { anchor: nodeAnchor(i), path: structure.nodes[i].path };
    }
  }

  const hasSuggestions = r.findings.length > 0 || prompts.length > 0 || r.nextSteps.length > 0;
  const toc: TocItem[] = [
    { id: "synthese", label: "Synthèse" },
    { id: "mesures", label: "Mesures" },
  ];
  if (r.strengths.length > 0) toc.push({ id: "points-forts", label: "Points forts", count: r.strengths.length });
  if (structure) toc.push({ id: "arborescence", label: "Arborescence", count: structure.nodes.length });
  toc.push({ id: "constats", label: "Constats", count: r.findings.length });
  if (risks.length > 0) toc.push({ id: "risques", label: "Risques", count: risks.length });
  if (hasSuggestions)
    toc.push({
      id: "suggestions",
      label: "Suggestions",
      children: [
        ...(r.findings.length > 0 ? [{ id: "recommandations", label: "Recommandations", count: r.findings.length }] : []),
        ...(prompts.length > 0 ? [{ id: "prompts", label: "Prompts", count: prompts.length }] : []),
        ...(r.nextSteps.length > 0 ? [{ id: "suite", label: "Prochaines étapes", count: r.nextSteps.length }] : []),
      ],
    });
  if (questions.length > 0) toc.push({ id: "questions", label: "Questions ouvertes", count: questions.length });
  if (notes.length > 0) toc.push({ id: "notes", label: "Notes", count: notes.length });
  if (r.collaboration) toc.push({ id: "communication", label: "Communication" });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      {/* Hero */}
      <Reveal className="pt-12 pb-10 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Audit ICM préliminaire</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{employee.name}</h1>
        <p className="mt-2 text-muted">{employee.role}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <StatusBadge status={status} />
          <span>Audit du {formatDate(r.auditDate)}</span>
          {updatedAt && <span>· mis à jour le {formatDate(updatedAt)}</span>}
          <span>· schéma v{r.schemaVersion}</span>
        </div>
        <p className="mt-2 text-xs text-muted"><RichText text={r.source} /></p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-4">
            <Toc items={toc} />
          </div>
        </nav>

        <div className="min-w-0 space-y-16">
          <TocMobile items={toc} />

          <Section id="synthese" title="Synthèse">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <p className="font-serif text-xl leading-snug sm:text-2xl"><RichText text={r.summary.headline} /></p>
              <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed">
                {r.summary.points.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span><RichText text={p} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section id="mesures" title="Mesures" intro="Estimation : 1 token ≈ 3,5 caractères de texte français.">
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
                  <dt className="text-xs text-muted">{s.label}</dt>
                  <dd className="mt-1 font-serif text-2xl tabular-nums tracking-tight">{s.value}</dd>
                  {s.note && <dd className="mt-1 text-xs text-muted"><RichText text={s.note} /></dd>}
                </div>
              ))}
            </dl>
          </Section>

          {r.strengths.length > 0 && (
            <Section id="points-forts" title="Points forts">
              <ul className="grid gap-3 md:grid-cols-2">
                {r.strengths.map((s, i) => (
                  <li key={i} className="rounded-xl border border-line bg-surface p-5">
                    <p className="flex items-start gap-2.5 font-semibold">
                      <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-xs text-accent">✓</span>
                      <RichText text={s.title} />
                    </p>
                    {s.detail && <p className="mt-2 pl-7.5 text-sm leading-relaxed text-muted"><RichText text={s.detail} /></p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {structure && (
            <Section
              id="arborescence"
              title="Arborescence"
              intro={`Dossier racine : ${structure.root}. Chaque chemin porte sa description, son état et ses constats.`}
            >
              <StructureTree structure={structure} />
            </Section>
          )}

          <Section id="constats" title="Constats" intro="Du plus grave au moins grave. Filtrez par gravité ou par catégorie.">
            <FindingsList findings={r.findings} nodeLinks={nodeLinks} />
          </Section>

          {risks.length > 0 && (
            <Section id="risques" title="Risques" intro="Ce qui peut arriver si rien ne change : probabilité × impact.">
              <RisksView risks={risks} />
            </Section>
          )}

          {hasSuggestions && (
            <Section id="suggestions" title="Suggestions" intro="Les recommandations des constats, les prompts à coller et les prochaines étapes.">
              <div className="space-y-12">
                {r.findings.length > 0 && (
                  <div id="recommandations" className="scroll-mt-20">
                    <h3 className="font-serif text-lg tracking-tight">Recommandations</h3>
                    <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                      {findingsBySeverity.map((f) => (
                        <li key={f.id} className="grid gap-2 p-4 sm:grid-cols-[7.5rem_1fr]">
                          <div className="flex items-start gap-2">
                            <a href={`#constat-${f.id}`} className="font-mono text-xs text-muted hover:text-accent">{f.id}</a>
                            <SeverityBadge severity={f.severity} />
                          </div>
                          <div className="min-w-0 text-sm leading-relaxed">
                            <p className="font-medium"><RichText text={f.title} /></p>
                            <p className="mt-1 text-muted"><RichText text={f.recommendation} /></p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {prompts.length > 0 && (
                  <div id="prompts" className="scroll-mt-20">
                    <h3 className="font-serif text-lg tracking-tight">Prompts de nettoyage</h3>
                    <p className="mt-1 text-sm text-muted">À coller dans votre session Claude, un à la fois, dans cet ordre.</p>
                    <ol className="mt-4 space-y-4">
                      {prompts.map((p) => (
                        <li key={p.order}><PromptCard prompt={p} /></li>
                      ))}
                    </ol>
                  </div>
                )}

                {r.nextSteps.length > 0 && (
                  <div id="suite" className="scroll-mt-20">
                    <h3 className="font-serif text-lg tracking-tight">Prochaines étapes</h3>
                    <ol className="mt-4 space-y-3">
                      {r.nextSteps.map((s, i) => (
                        <li key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
                          <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-[15px] leading-relaxed"><RichText text={s} /></span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </Section>
          )}

          {questions.length > 0 && (
            <Section id="questions" title="Questions ouvertes" intro="Ce que l'audit n'a pas pu trancher à partir de l'espace de travail seul.">
              <QuestionsView questions={questions} />
            </Section>
          )}

          {notes.length > 0 && (
            <Section id="notes" title="Notes" intro="Autres observations utiles : idées à partager, habitudes, outils.">
              <NotesView notes={notes} />
            </Section>
          )}

          {r.collaboration && (
            <Section
              id="communication"
              title="Communication entre espaces de travail"
              intro="Les espaces de travail peuvent échanger leurs sorties par des dossiers partagés (OneDrive)."
            >
              <CollaborationView data={r.collaboration} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
