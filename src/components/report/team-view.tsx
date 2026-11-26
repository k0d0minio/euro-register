import type { CollaborationOpportunity, OpenQuestion } from "@/lib/report/schema";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { OpportunityCard } from "./collaboration-view";

export type TeamEntry = {
  employee: { slug: string; name: string };
  opportunities: CollaborationOpportunity[];
  questions: OpenQuestion[];
};

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">{children}</p>;
}

export function TeamView({ entries }: { entries: TeamEntry[] }) {
  const withOpportunities = entries.filter((e) => e.opportunities.length > 0);
  const withQuestions = entries.filter((e) => e.questions.length > 0);
  const opportunityCount = withOpportunities.reduce((n, e) => n + e.opportunities.length, 0);
  const questionCount = withQuestions.reduce((n, e) => n + e.questions.length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal className="pt-12 pb-10 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Audit ICM · équipe</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Page équipe</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Les échanges possibles entre les espaces de travail, et les questions à discuter ensemble. Chaque rapport garde
          sa meilleure opportunité ; les autres sont ici.
        </p>
      </Reveal>

      <div className="space-y-16">
        <section id="opportunites" className="scroll-mt-20">
          <h2 className="font-serif text-2xl tracking-tight">
            Opportunités d&apos;équipe <span className="text-base tabular-nums text-muted">({opportunityCount})</span>
          </h2>
          <p className="mt-1 text-sm text-muted">Par espace de travail : avec qui échanger, quoi, et pour quel gain.</p>
          <div className="mt-5 space-y-8">
            {withOpportunities.length === 0 ? (
              <Empty>Aucune opportunité d&apos;équipe pour le moment.</Empty>
            ) : (
              withOpportunities.map((e) => (
                <div key={e.employee.slug}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {e.employee.name} <span className="tabular-nums">({e.opportunities.length})</span>
                  </h3>
                  <ul className="mt-3 grid gap-3 md:grid-cols-2">
                    {e.opportunities.map((o, i) => (
                      <li key={i} className="flex"><OpportunityCard opportunity={o} /></li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="questions" className="scroll-mt-20">
          <h2 className="font-serif text-2xl tracking-tight">
            Questions pour l&apos;équipe <span className="text-base tabular-nums text-muted">({questionCount})</span>
          </h2>
          <p className="mt-1 text-sm text-muted">Ce que les audits n&apos;ont pas pu trancher seuls : à discuter ensemble.</p>
          <div className="mt-5">
            {withQuestions.length === 0 ? (
              <Empty>Aucune question pour l&apos;équipe pour le moment.</Empty>
            ) : (
              <ul className="space-y-3">
                {withQuestions.flatMap((e) =>
                  e.questions.map((q) => (
                    <li key={`${e.employee.slug}-${q.id}`} className="rounded-xl border border-line bg-surface p-5">
                      <p className="text-xs text-muted">
                        Audit de <span className="font-medium text-ink">{e.employee.name}</span> · <span className="font-mono">{q.id}</span>
                      </p>
                      <p className="mt-1.5 font-semibold leading-snug"><RichText text={q.question} /></p>
                      <p className="mt-2 text-sm leading-relaxed text-muted"><RichText text={q.context} /></p>
                    </li>
                  )),
                )}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
