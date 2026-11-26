import fixture from "../../../../fixtures/exemple.json";
import { seedFileSchema } from "@/lib/report/schema";
import { TeamView } from "@/components/report/team-view";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Aperçu de la page équipe (fictif)" };

export default function PreviewTeamPage() {
  const data = seedFileSchema.parse(fixture);
  const entries = [
    {
      employee: { slug: data.employee.slug, name: data.employee.name },
      opportunities: data.report.collaboration?.teamOpportunities ?? [],
      questions: (data.report.openQuestions ?? []).filter((q) => q.askTo === "équipe"),
    },
  ];
  return (
    <>
      <SiteHeader
        nav={[
          { href: "/apercu/rapport", label: "Rapport" },
          { href: "/apercu/presentation", label: "Présentation" },
        ]}
        note="Aperçu · données fictives"
      />
      <main className="flex-1">
        <TeamView entries={entries} />
      </main>
    </>
  );
}
