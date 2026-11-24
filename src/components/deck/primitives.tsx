import type { ReactNode } from "react";

/** Standard slide frame: eyebrow, title, body. Type scales with the viewport. */
export function Slide({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-12">
      {eyebrow && (
        <p className="text-[clamp(0.7rem,1.1vw,0.9rem)] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-serif text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[1.08] tracking-tight">{title}</h2>
      {children && <div className="mt-[clamp(1.5rem,4vh,3rem)] text-[clamp(1rem,1.5vw,1.35rem)] leading-relaxed">{children}</div>}
    </div>
  );
}

export function TitleSlide({ kicker, title, subtitle }: { kicker: string; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-12">
      <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 size-[50vmin] -translate-y-1/2 rounded-full bg-accent-soft blur-3xl" />
      <p className="relative text-[clamp(0.75rem,1.2vw,1rem)] font-semibold uppercase tracking-[0.22em] text-accent">{kicker}</p>
      <h1 className="relative mt-5 max-w-4xl font-serif text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[1.02] tracking-tight">{title}</h1>
      {subtitle && <p className="relative mt-6 max-w-2xl text-[clamp(1rem,1.7vw,1.5rem)] text-muted">{subtitle}</p>}
    </div>
  );
}

export function Card({ title, children, accent }: { title: ReactNode; children?: ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-[clamp(1rem,2vw,1.6rem)]">
      <p className="font-semibold" style={accent ? { color: accent } : undefined}>{title}</p>
      {children && <div className="mt-1.5 text-[0.85em] leading-relaxed text-muted">{children}</div>}
    </div>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>;
}
