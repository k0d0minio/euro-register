import { requireViewer } from "@/lib/auth/session";
import { getTeamEntries } from "@/lib/report/repo";
import { TeamView } from "@/components/report/team-view";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Page équipe" };

/** Open to each signed-in employee and admin. Published reports only, for admins too. */
export default async function TeamPage() {
  const viewer = await requireViewer();
  const entries = await getTeamEntries();

  const nav = [{ href: "/presentation", label: "Présentation" }];
  if (viewer.employeeSlug) nav.unshift({ href: `/rapport/${viewer.employeeSlug}`, label: "Mon rapport" });
  if (viewer.isAdmin) nav.unshift({ href: "/admin", label: "Tous les rapports" });

  return (
    <>
      <SiteHeader nav={nav} signedIn />
      <main className="flex-1">
        <TeamView entries={entries} />
      </main>
    </>
  );
}
