import { ASK_TO, type AskTo, type Note, type OpenQuestion } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";

const askToLabel: Record<AskTo, string> = {
  employé: "À poser à l'employé",
  J: "À trancher par J",
  équipe: "À discuter en équipe",
};

export function QuestionsView({ questions }: { questions: OpenQuestion[] }) {
  return (
    <div className="space-y-8">
      {ASK_TO.map((to) => {
        const group = questions.filter((q) => q.askTo === to);
        if (group.length === 0) return null;
        return (
          <div key={to}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {askToLabel[to]} <span className="tabular-nums">({group.length})</span>
            </h3>
            <ul className="mt-3 space-y-3">
              {group.map((q) => (
                <li key={q.id} id={`question-${q.id}`} className="scroll-mt-24 rounded-xl border border-line bg-surface p-5">
                  <p className="flex gap-3 font-semibold leading-snug">
                    <span className="mt-px shrink-0 font-mono text-xs font-normal text-muted">{q.id}</span>
                    <span><RichText text={q.question} /></span>
                  </p>
                  <p className="mt-2 pl-8 text-sm leading-relaxed text-muted"><RichText text={q.context} /></p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function NotesView({ notes }: { notes: Note[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {notes.map((n, i) => (
        <li key={i} className="rounded-xl border border-line bg-surface p-5">
          <p className="flex items-start gap-2.5 font-semibold leading-snug">
            <span aria-hidden className="mt-0.5 text-accent">✦</span>
            <RichText text={n.title} />
          </p>
          <p className="mt-2 pl-6 text-sm leading-relaxed text-muted"><RichText text={n.detail} /></p>
        </li>
      ))}
    </ul>
  );
}
