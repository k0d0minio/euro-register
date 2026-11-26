import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getAnswers, getReportForViewer } from "@/lib/report/repo";
import { ReportView, type ReportAudience } from "@/components/report/report-view";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Rapport" };

export default async function ReportPage({ params }: PageProps<"/rapport/[slug]">) {
  const { slug } = await params;
  const viewer = await requireViewer();
  const report = await getReportForViewer(slug, viewer);
  // Same answer for "does not exist" and "not yours".
  if (!report) notFound();

  const answers = await getAnswers(slug);
  // An admin who is also this employee sees the admin view.
  const audience: ReportAudience = viewer.isAdmin ? { mode: "admin", answers } : { mode: "employee", slug, answers };

  const nav = [
    { href: "/equipe", label: "Page équipe" },
    { href: "/presentation", label: "Présentation" },
  ];
  if (viewer.isAdmin) nav.unshift({ href: "/admin", label: "Tous les rapports" });

  return (
    <>
      <SiteHeader nav={nav} signedIn />
      <main className="flex-1">
        <ReportView
          employee={report.employee}
          status={report.status}
          updatedAt={report.updatedAt}
          content={report.content}
          audience={audience}
          teamHref="/equipe"
        />
      </main>
    </>
  );
}
