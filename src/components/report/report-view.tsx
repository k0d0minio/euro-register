import type { ReportContent } from "@/lib/report/schema";
import { StatusBadge } from "@/components/ui/badges";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { FindingsList } from "./findings-list";
import { PromptCard } from "./prompt-card";
import { CollaborationView } from "./collaboration-view";

type Props = {
  employee: { name: string; role: string };
  status: "draft" | "published";
  updatedAt?: Date;
  content: ReportContent;
};

const nf = new Intl.NumberFormat("fr-BE");

function formatBytes(n: number) {
  if (n < 1024) return `${nf.format(n)} o`;
  if (n < 1024 ** 2) return `${nf.format(Math.round(n / 1024))} Ko`;
  return `${new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 1 }).format(n / 1024 ** 2)} Mo`;
}

function formatDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(`${iso}T12:00:00`) : iso;
  return new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(d);
}

const allSections = [
  { id: "synthese", label: "Synthèse" },
  { id: "mesures", label: "Mesures" },
  { id: "points-forts", label: "Points forts" },
  { id: "constats", label: "Constats" },
  { id: "prompts", label: "Prompts" },
  { id: "communication", label: "Communication" },
  { id: "suite", label: "Prochaines étapes" },
];

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
  const sections = allSections.filter(
    (s) =>
      (s.id !== "communication" || r.collaboration) &&
      (s.id !== "points-forts" || r.strengths.length > 0) &&
      (s.id !== "prompts" || prompts.length > 0) &&
      (s.id !== "suite" || r.nextSteps.length > 0),
  );

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
        </div>
        <p className="mt-2 text-xs text-muted"><RichText text={r.source} /></p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[180px_1fr]">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 border-l border-line text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition-colors hover:border-ink hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-16">
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

          <Section id="constats" title="Constats" intro="Du plus grave au moins grave. Filtrez par gravité ou par catégorie.">
            <FindingsList findings={r.findings} />
          </Section>

          {prompts.length > 0 && (
            <Section id="prompts" title="Prompts de nettoyage" intro="À coller dans votre session Claude, un à la fois, dans cet ordre.">
              <ol className="space-y-4">
                {prompts.map((p) => (
                  <li key={p.order}><PromptCard prompt={p} /></li>
                ))}
              </ol>
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

          {r.nextSteps.length > 0 && (
            <Section id="suite" title="Prochaines étapes">
              <ol className="space-y-3">
                {r.nextSteps.map((s, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
                    <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[15px] leading-relaxed"><RichText text={s} /></span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
