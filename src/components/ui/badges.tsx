import type { Category, Severity } from "@/lib/report/schema";

const severityVar: Record<Severity, string> = {
  critique: "critique",
  élevé: "eleve",
  moyen: "moyen",
  faible: "faible",
};

export const severityLabel: Record<Severity, string> = {
  critique: "Critique",
  élevé: "Élevé",
  moyen: "Moyen",
  faible: "Faible",
};

export function severityColors(s: Severity) {
  const v = severityVar[s];
  return { color: `var(--sev-${v})`, background: `var(--sev-${v}-bg)` };
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      style={severityColors(severity)}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {severityLabel[severity]}
    </span>
  );
}

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
      Publié
    </span>
  ) : (
    <span className="rounded-full border border-dashed border-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted">
      Brouillon
    </span>
  );
}
