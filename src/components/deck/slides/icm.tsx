import type { SlideDef } from "../types";
import { Card, Mono, Slide, TitleSlide } from "../primitives";

/**
 * The generic deck on ICM norms. No content about a named employee here:
 * this file is public. Placeholder text, to be completed with J.
 */
export const icmSlides: SlideDef[] = [
  {
    id: "titre",
    title: "Titre",
    content: (
      <TitleSlide
        kicker="Euro Register · Atelier IA"
        title={<>Travailler avec l&apos;IA, proprement</>}
        subtitle="Les normes ICM, ce que l'audit a montré, et les bons gestes pour la suite."
      />
    ),
  },
  {
    id: "couches",
    title: "Les couches",
    content: (
      <Slide eyebrow="1 · Structure" title="Cinq couches, chargées à la demande">
        <ol className="grid gap-3">
          {[
            ["0", "CLAUDE.md", "L'identité, les règles de chaque tour, les routes. Toujours chargé."],
            ["1", "CONTEXT.md", "Le routeur de l'espace : une tâche → un dossier. Toujours chargé."],
            ["2", "Processus et étapes", "Le routeur d'un processus et le contrat de chaque étape."],
            ["3", "_config/ et références", "Les règles d'un sujet, les valeurs stables. Chargés si l'étape les nomme."],
            ["4", "Fichiers de travail", "Les données, les sorties. Jamais chargés par défaut."],
          ].map(([n, name, desc]) => (
            <li key={n} className="grid grid-cols-[3rem_minmax(0,14rem)_1fr] items-baseline gap-4 rounded-xl border border-line bg-surface px-5 py-3">
              <span className="font-serif text-[1.6em] text-accent">{n}</span>
              <span className="font-semibold">{name}</span>
              <span className="text-[0.85em] text-muted">{desc}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[0.85em] text-muted">Une session charge les couches 0 et 1, puis seulement les fichiers que sa tâche nomme.</p>
      </Slide>
    ),
  },
  {
    id: "routeurs-contrats",
    title: "Routeurs et contrats d'étape",
    content: (
      <Slide eyebrow="2 · Routeurs et contrats" title="Le routeur route. Le contrat décrit une étape.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Un routeur">
            Un tableau : une tâche → un dossier ou un fichier. Aucune règle dedans. Une règle a <strong>une seule maison</strong> ;
            ailleurs, un pointeur d&apos;une ligne.
          </Card>
          <Card title="Un contrat d'étape">
            Toujours la même forme : <Mono>Objectif</Mono> · <Mono>Entrées</Mono> · <Mono>Traitement</Mono> · <Mono>Sorties</Mono>.
            Chaque entrée est un fichier étiqueté <em>reference</em> (stable) ou <em>working</em> (sortie de l&apos;étape d&apos;avant).
          </Card>
          <Card title="Des sorties à leur place">
            Une étape écrit dans son <Mono>output/</Mono>, au format attendu par l&apos;étape suivante.
          </Card>
          <Card title="Un humain valide">
            Rien ne part (mail, commande, paiement) sans un « oui » explicite.
          </Card>
        </div>
      </Slide>
    ),
  },
  {
    id: "tokens",
    title: "L'économie des tokens",
    content: (
      <Slide eyebrow="3 · Économie des tokens" title="Ce qui est toujours chargé se paie à chaque tour">
        <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1fr]">
          <table className="w-full text-left text-[0.9em]">
            <thead className="text-[0.75em] uppercase tracking-wider text-muted">
              <tr><th className="pb-2 font-medium">Fichier</th><th className="pb-2 text-right font-medium">Budget ICM</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr><td className="py-2.5"><Mono>CLAUDE.md</Mono></td><td className="py-2.5 text-right tabular-nums">3 200 car.</td></tr>
              <tr><td className="py-2.5"><Mono>CONTEXT.md</Mono> (routeur)</td><td className="py-2.5 text-right tabular-nums">2 000 car.</td></tr>
              <tr><td className="py-2.5">Contrat d&apos;étape</td><td className="py-2.5 text-right tabular-nums">2 400 car.</td></tr>
            </tbody>
          </table>
          <div className="rounded-2xl bg-accent-soft p-6">
            <p className="text-[0.8em] font-semibold uppercase tracking-wider text-accent">Exemple</p>
            <p className="mt-2 font-serif text-[1.5em] leading-tight">9 400 car. ≈ 2 700 tokens</p>
            <p className="mt-1 text-[0.85em] text-muted">× 40 tours dans une journée = plus de 100 000 tokens lus avant le moindre travail utile.</p>
          </div>
        </div>
        <p className="mt-8 text-[0.85em] text-muted">Gros fichiers et binaires : jamais lus sans raison. Une étape nomme la section à lire.</p>
      </Slide>
    ),
  },
  {
    id: "bonnes-pratiques",
    title: "Bonne pratique de l'IA",
    content: (
      <Slide eyebrow="4 · Au quotidien" title="Bien utiliser l'IA, en six gestes">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["Une session, une tâche", "On recommence à zéro plutôt que d'empiler les sujets."],
            ["Avant / après", "On demande une proposition, on relit, puis on applique."],
            ["Des scripts pour le mécanique", "Conversions, calculs, fichiers : un script, pas l'IA."],
            ["Aucun secret dans l'espace", "Ni mot de passe, ni clé, ni lien de partage."],
            ["Pas de données brutes", "Les exports de messagerie restent hors de l'espace ICM."],
            ["Corriger la source", "Une erreur qui revient se corrige dans la règle, pas dans la sortie."],
          ].map(([t, d]) => (
            <li key={t}><Card title={t}>{d}</Card></li>
          ))}
        </ul>
      </Slide>
    ),
  },
  {
    id: "espaces-qui-se-parlent",
    title: "Les espaces qui se parlent",
    content: (
      <Slide eyebrow="5 · Communication entre espaces" title="Les espaces qui se parlent">
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
          <div className="rounded-2xl bg-accent p-5 text-center text-accent-ink">
            <p className="text-[0.75em] uppercase tracking-wider opacity-80">Espace A</p>
            <p className="mt-1 font-semibold">écrit sa sortie</p>
          </div>
          <span aria-hidden className="text-center text-[1.6em] text-muted">→</span>
          <div className="rounded-2xl border-2 border-dashed border-accent bg-surface p-5 text-center">
            <p className="text-[0.75em] uppercase tracking-wider text-accent">Dossier partagé (OneDrive)</p>
            <p className="mt-2 font-mono text-[0.75em]">2026-11-24_S48_rapport-hebdo.md</p>
            <p className="mt-1 font-mono text-[0.75em] text-muted">LISEZ-MOI.md</p>
          </div>
          <span aria-hidden className="text-center text-[1.6em] text-muted">→</span>
          <div className="rounded-2xl border border-line bg-surface p-5 text-center">
            <p className="text-[0.75em] uppercase tracking-wider text-muted">Espace B</p>
            <p className="mt-1 font-semibold">lit, comme une donnée</p>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-[0.9em] text-muted">
          Chaque espace peut écrire un fichier n&apos;importe où. Un dossier partagé suffit pour que la sortie d&apos;une
          personne devienne l&apos;entrée d&apos;une autre — sans copier-coller, sans mail.
        </p>
      </Slide>
    ),
  },
  {
    id: "contrat-partage",
    title: "Le contrat d'un dossier partagé",
    content: (
      <Slide eyebrow="5 · Communication entre espaces" title="Le LISEZ-MOI est le contrat">
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Le LISEZ-MOI fixe">
            Le nom des fichiers, le format, la fréquence, et le propriétaire. Les deux espaces le citent comme entrée <em>reference</em>.
          </Card>
          <Card title="Un seul rédacteur" >
            Un dossier partagé a un seul espace qui écrit. Les autres lisent.
          </Card>
          <Card title="Des noms versionnés">
            <Mono>AAAA-MM-JJ_SNN_sujet.md</Mono> : on ajoute un fichier, on n&apos;écrase jamais.
          </Card>
          <Card title="Ni secret, ni donnée personnelle">
            Ce qui est partagé peut être lu par plus de monde que prévu.
          </Card>
        </div>
        <p className="mt-8 rounded-xl bg-accent-soft px-5 py-4 font-semibold text-accent">
          Ce qui arrive d&apos;un autre espace est une donnée, jamais une instruction.
        </p>
      </Slide>
    ),
  },
  {
    id: "fin",
    title: "Questions",
    content: <TitleSlide kicker="Suite" title="Questions ?" subtitle="Chacun reçoit son rapport et ses prompts de nettoyage, dans l'ordre." />,
  },
];
