import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { listReportsForAdmin } from "@/lib/report/repo";
import { SiteHeader } from "@/components/ui/site-header";
import { StatusBadge } from "@/components/ui/badges";

export const metadata = { title: "Tous les rapports" };

export default async function AdminPage() {
  const viewer = await requireViewer();
  if (!viewer.isAdmin) notFound();
  const rows = await listReportsForAdmin();
  const fmt = new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <SiteHeader nav={[{ href: "/presentation", label: "Présentation" }]} signedIn />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl tracking-tight">Tous les rapports</h1>
        <p className="mt-1 text-sm text-muted">{rows.length} employé(s). Les brouillons ne sont visibles que par les admins.</p>
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Employé</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Constats</th>
                <th className="px-4 py-3 font-medium">Mis à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.slug} className="hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    {r.status ? (
                      <Link href={`/rapport/${r.slug}`} className="font-medium hover:underline">{r.name}</Link>
                    ) : (
                      <span className="font-medium">{r.name}</span>
                    )}
                    <div className="text-xs text-muted">{r.role}</div>
                  </td>
                  <td className="px-4 py-3">{r.status ? <StatusBadge status={r.status} /> : <span className="text-xs text-muted">Pas de rapport</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.content?.findings.length ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{r.updatedAt ? fmt.format(r.updatedAt) : "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Aucun employé. Chargez les rapports avec <code>pnpm seed</code>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
