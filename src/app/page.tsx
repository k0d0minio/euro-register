import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db";
import { getViewer, homeFor } from "@/lib/auth/session";
import { isDev } from "@/lib/env";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const viewer = await getViewer();
  if (viewer) redirect(homeFor(viewer));

  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl opacity-70" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-accent font-bold text-accent-ink">ER</span>
          <h1 className="mt-5 font-serif text-3xl tracking-tight">Audit ICM</h1>
          <p className="mt-2 text-sm text-muted">
            Euro Register — votre rapport d&apos;audit et la présentation des normes ICM.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <SignInForm />
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Pas de mot de passe : vous recevez un lien à usage unique, valable 15 minutes.
          </p>
        </div>
        {isDev && (
          <div className="mt-6 rounded-xl border border-dashed border-line p-4 text-xs leading-relaxed text-muted">
            <p className="font-semibold text-ink">Mode développement</p>
            <p className="mt-1">
              Le lien de connexion s&apos;affiche dans la console du serveur.{" "}
              {!isDbConfigured() && "DATABASE_URL n'est pas défini : la connexion est désactivée. "}
              Aperçus sans connexion :{" "}
              <Link className="underline" href="/apercu/rapport">rapport fictif</Link> ·{" "}
              <Link className="underline" href="/apercu/presentation">présentation</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
