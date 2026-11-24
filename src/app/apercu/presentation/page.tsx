import { Deck } from "@/components/deck/deck";
import { icmSlides } from "@/components/deck/slides/icm";

export const metadata = { title: "Aperçu de la présentation" };

export default function PreviewPresentationPage() {
  return <Deck slides={icmSlides} exitHref="/" />;
}
