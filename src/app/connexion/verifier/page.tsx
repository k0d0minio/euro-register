import Link from "next/link";
import { verifyMagicLink } from "@/lib/auth/actions";

export const metadata = { title: "Connexion" };

/**
 * The link opens this page; only the button consumes the token (POST).
 * So a mail scanner that opens the link does not use it up.
 */
export default async function VerifyPage({ searchParams }: PageProps<"/connexion/verifier">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const failed = sp.erreur !== undefined || !token;

  return (
    <main className="grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        {failed ? (
          <>
            <h1 className="font-serif text-2xl">Lien invalide ou expiré</h1>
            <p className="mt-3 text-sm text-muted">
              Un lien ne sert qu&apos;une fois et expire après 15 minutes. Demandez-en un nouveau.
            </p>
            <Link href="/" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl">Confirmer la connexion</h1>
            <p className="mt-3 text-sm text-muted">Cliquez pour ouvrir votre session sur cet appareil.</p>
            <form action={verifyMagicLink} className="mt-6">
              <input type="hidden" name="token" value={token} />
              <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-ink hover:opacity-90">
                Me connecter
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
