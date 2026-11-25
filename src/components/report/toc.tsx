"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string; count?: number; children?: TocItem[] };

/** The table of contents. It marks the section that is on screen. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const ids = items.flatMap((i) => [i.id, ...(i.children ?? []).map((c) => c.id)]);
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, [items]);

  const link = (i: TocItem, sub = false) => {
    const on = active === i.id;
    return (
      <a
        href={`#${i.id}`}
        aria-current={on ? "location" : undefined}
        className={`relative -ml-px flex items-baseline justify-between gap-2 border-l py-0.5 transition-colors ${
          sub ? "pl-7 text-[13px]" : "pl-4"
        } ${on ? "border-transparent text-ink" : "border-transparent text-muted hover:text-ink"}`}
      >
        {on && (
          <motion.span
            layoutId="toc-active"
            aria-hidden
            className="absolute inset-y-0 -left-px w-0.5 rounded-full bg-accent"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
        <span>{i.label}</span>
        {i.count !== undefined && <span className="text-xs tabular-nums text-muted">{i.count}</span>}
      </a>
    );
  };

  return (
    <ul className="space-y-1.5 border-l border-line text-sm">
      {items.map((i) => (
        <li key={i.id}>
          {link(i)}
          {i.children && i.children.length > 0 && (
            <ul className="mt-1 space-y-1">
              {i.children.map((c) => (
                <li key={c.id}>{link(c, true)}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The table of contents on a narrow screen: a menu at the top of the report. */
export function TocMobile({ items }: { items: TocItem[] }) {
  return (
    <details className="group rounded-xl border border-line bg-surface lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
        Sommaire
        <span aria-hidden className="text-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="grid gap-1 border-t border-line px-4 py-3 text-sm sm:grid-cols-2">
        {items.flatMap((i) => [i, ...(i.children ?? [])]).map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className="text-muted hover:text-ink">
              {i.label}
              {i.count !== undefined && <span className="ml-1.5 text-xs tabular-nums">({i.count})</span>}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
