import { Deck } from "@/components/deck/deck";
import { icmSlides } from "@/components/deck/slides/icm";
import { homeFor, requireViewer } from "@/lib/auth/session";

export const metadata = { title: "Présentation" };

export default async function PresentationPage() {
  const viewer = await requireViewer();
  return <Deck slides={icmSlides} exitHref={homeFor(viewer) === "/presentation" ? "/" : homeFor(viewer)} />;
}
