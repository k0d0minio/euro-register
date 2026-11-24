import fixture from "../../../../fixtures/exemple.json";
import { seedFileSchema } from "@/lib/report/schema";
import { ReportView } from "@/components/report/report-view";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Aperçu du rapport (fictif)" };

export default function PreviewReportPage() {
  const data = seedFileSchema.parse(fixture);
  return (
    <>
      <SiteHeader nav={[{ href: "/apercu/presentation", label: "Présentation" }]} note="Aperçu · données fictives" />
      <main className="flex-1">
        <ReportView employee={data.employee} status={data.status} content={data.report} />
      </main>
    </>
  );
}
