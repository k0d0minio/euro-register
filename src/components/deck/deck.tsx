"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { SlideDef } from "./types";

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
};

function readHash(count: number): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) && n >= 1 && n <= count ? n - 1 : 0;
}

/**
 * Full-screen deck. Keys: → / Espace / Page↓ next, ← / Page↑ previous,
 * Début / Fin, F full screen. Click: right part next, left third previous.
 * The URL hash (#3) keeps the current slide.
 */
export function Deck({ slides, exitHref = "/" }: { slides: SlideDef[]; exitHref?: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  // Do not write the hash before the first read of it.
  const [hashRead, setHashRead] = useState(false);
  const reduce = useReducedMotion();
  const last = slides.length - 1;

  const go = useCallback(
    (next: number) => {
      setState(([cur]) => {
        const clamped = Math.max(0, Math.min(last, next));
        return clamped === cur ? [cur, 0] : [clamped, clamped > cur ? 1 : -1];
      });
    },
    [last],
  );

  // Hash → state (first load, back/forward).
  useEffect(() => {
    const sync = () => go(readHash(slides.length));
    sync();
    setHashRead(true);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [go, slides.length]);

  // State → hash.
  useEffect(() => {
    if (!hashRead) return;
    const h = `#${index + 1}`;
    if (window.location.hash !== h) history.replaceState(null, "", h);
  }, [index, hashRead]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(index + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(index - 1);
          break;
        case "Home":
          go(0);
          break;
        case "End":
          go(last);
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen?.();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, last]);

  function onStageClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a,button,[data-no-advance]")) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    go((e.clientX - left) / width < 1 / 3 ? index - 1 : index + 1);
  }

  const slide = slides[index];

  return (
    <div className="fixed inset-0 flex flex-col bg-bg text-ink select-none">
      <div className="h-1 bg-surface-2" aria-hidden>
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
        />
      </div>

      <div className="relative flex-1 overflow-hidden" onClick={onStageClick}>
        <AnimatePresence custom={dir} mode="wait" initial={false}>
          <motion.section
            key={slide.id}
            custom={dir}
            variants={variants}
            initial={reduce ? false : "enter"}
            animate="center"
            exit={reduce ? { opacity: 0 } : "exit"}
            transition={{ duration: reduce ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto"
            aria-roledescription="diapositive"
            aria-label={`${index + 1} sur ${slides.length} : ${slide.title}`}
          >
            {slide.content}
          </motion.section>
        </AnimatePresence>
      </div>

      <footer className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-sm text-muted sm:px-6">
        <Link href={exitHref} className="hover:text-ink">← Quitter</Link>
        <span className="hidden truncate sm:inline">{slide.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Diapositive précédente" className="rounded-md px-2.5 py-1 hover:bg-surface-2 disabled:opacity-30">←</button>
          <span className="w-16 text-center tabular-nums" aria-live="polite">{index + 1} / {slides.length}</span>
          <button type="button" onClick={() => go(index + 1)} disabled={index === last} aria-label="Diapositive suivante" className="rounded-md px-2.5 py-1 hover:bg-surface-2 disabled:opacity-30">→</button>
        </div>
        <span className="hidden text-xs md:inline">F : plein écran</span>
      </footer>
    </div>
  );
}
