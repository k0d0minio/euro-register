export const nf = new Intl.NumberFormat("fr-BE");

export function formatBytes(n: number) {
  if (n < 1024) return `${nf.format(n)} o`;
  if (n < 1024 ** 2) return `${nf.format(Math.round(n / 1024))} Ko`;
  return `${new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 1 }).format(n / 1024 ** 2)} Mo`;
}

export function formatDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(`${iso}T12:00:00`) : iso;
  return new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(d);
}

/** Anchor of a node of the folder tree: its index in `structure.nodes`. */
export const nodeAnchor = (index: number) => `noeud-${index}`;
