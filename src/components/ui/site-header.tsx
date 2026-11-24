import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

type Props = {
  nav?: { href: string; label: string }[];
  signedIn?: boolean;
  note?: string;
};

export function SiteHeader({ nav = [], signedIn = false, note }: Props) {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70 sticky top-0 z-20">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg tracking-tight">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-xs font-sans font-bold text-accent-ink">
            ER
          </span>
          Audit ICM
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {note && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--sev-moyen-bg)", color: "var(--sev-moyen)" }}>
              {note}
            </span>
          )}
          {signedIn && (
            <form action={signOut}>
              <button className="text-muted hover:text-ink transition-colors">Se déconnecter</button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
