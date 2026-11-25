"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { NODE_STATUSES, parentPath, type NodeStatus, type Structure, type StructureNode } from "@/lib/report/schema";
import { RichText } from "@/components/ui/rich-text";
import { formatBytes, nf, nodeAnchor } from "./format";

const statusStyle: Record<NodeStatus, { label: string; color: string; background: string }> = {
  ok: { label: "OK", color: "var(--sev-faible)", background: "var(--sev-faible-bg)" },
  attention: { label: "Attention", color: "var(--sev-moyen)", background: "var(--sev-moyen-bg)" },
  problème: { label: "Problème", color: "var(--sev-critique)", background: "var(--sev-critique-bg)" },
};

type TreeNode = {
  path: string;
  name: string;
  depth: number;
  /** Index in `structure.nodes`, or -1 for a parent folder that the file does not list. */
  index: number;
  node: StructureNode | null;
  children: TreeNode[];
};

function buildTree(nodes: StructureNode[], root: string): TreeNode {
  const byPath = new Map<string, TreeNode>();
  const make = (path: string, index: number, node: StructureNode | null): TreeNode => ({
    path,
    name: path === "" ? root : path.slice(path.lastIndexOf("/") + 1),
    depth: path === "" ? 0 : path.split("/").length,
    index,
    node,
    children: [],
  });
  nodes.forEach((n, i) => byPath.set(n.path, make(n.path, i, n)));
  if (!byPath.has("")) byPath.set("", make("", -1, null));
  // Make the parent folders that the file does not list, so that the tree has no hole.
  for (const path of [...byPath.keys()]) {
    let p = parentPath(path);
    while (p !== null && !byPath.has(p)) {
      byPath.set(p, make(p, -1, null));
      p = parentPath(p);
    }
  }
  for (const t of byPath.values()) {
    const p = parentPath(t.path);
    if (p !== null) byPath.get(p)!.children.push(t);
  }
  const isDir = (t: TreeNode) => t.children.length > 0 || t.node?.kind !== "fichier";
  for (const t of byPath.values()) {
    t.children.sort((a, b) => Number(isDir(b)) - Number(isDir(a)) || a.name.localeCompare(b.name, "fr"));
  }
  return byPath.get("")!;
}

function walk(t: TreeNode, fn: (t: TreeNode) => void) {
  fn(t);
  t.children.forEach((c) => walk(c, fn));
}

function ancestors(path: string): string[] {
  const out: string[] = [];
  let p = parentPath(path);
  while (p !== null) {
    out.push(p);
    p = parentPath(p);
  }
  return out;
}

export function StructureTree({ structure }: { structure: Structure }) {
  const tree = useMemo(() => buildTree(structure.nodes, structure.root), [structure]);
  const folders = useMemo(() => {
    const out: string[] = [];
    walk(tree, (t) => t.children.length > 0 && out.push(t.path));
    return out;
  }, [tree]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(folders.filter((p) => p === "" || !p.includes("/"))),
  );
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Set<NodeStatus>>(new Set());
  const [target, setTarget] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || statuses.size > 0;

  // With a filter: the matching nodes and their parent folders, all open.
  const visible = useMemo(() => {
    if (!filtering) return null;
    const keep = new Set<string>();
    walk(tree, (t) => {
      const okPath = q === "" || t.path.toLowerCase().includes(q) || (t.path === "" && structure.root.toLowerCase().includes(q));
      const okStatus = statuses.size === 0 || (t.node !== null && statuses.has(t.node.status));
      if (okPath && okStatus) {
        keep.add(t.path);
        ancestors(t.path).forEach((a) => keep.add(a));
      }
    });
    return keep;
  }, [tree, q, statuses, filtering, structure.root]);

  const counts = useMemo(() => {
    const c: Record<NodeStatus, number> = { ok: 0, attention: 0, problème: 0 };
    structure.nodes.forEach((n) => c[n.status]++);
    return c;
  }, [structure.nodes]);

  // A link to "#noeud-N" (from a finding) opens the folders above that node.
  const openAnchor = useCallback(() => {
    const m = /^#noeud-(\d+)$/.exec(window.location.hash);
    if (!m) return;
    const index = Number(m[1]);
    const node = structure.nodes[index];
    if (!node) return;
    setQuery("");
    setStatuses(new Set());
    setExpanded((prev) => new Set([...prev, ...ancestors(node.path)]));
    setTarget(index);
  }, [structure.nodes]);

  useEffect(() => {
    const first = window.setTimeout(openAnchor, 0);
    window.addEventListener("hashchange", openAnchor);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("hashchange", openAnchor);
    };
  }, [openAnchor]);

  useEffect(() => {
    if (target === null) return;
    const id = window.setTimeout(() => {
      document.getElementById(nodeAnchor(target))?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 260);
    return () => window.clearTimeout(id);
  }, [target]);

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  const toggleStatus = (s: NodeStatus) =>
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <div>
      <p className="text-[15px] leading-relaxed"><RichText text={structure.summary} /></p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="filtre-chemin">Filtrer par chemin</label>
        <input
          id="filtre-chemin"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer par chemin…"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-sm placeholder:font-sans placeholder:text-muted sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par état">
          {NODE_STATUSES.map((s) => {
            const active = statuses.has(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                disabled={counts[s] === 0}
                onClick={() => toggleStatus(s)}
                style={active ? { ...statusStyle[s], borderColor: "currentColor" } : undefined}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-muted disabled:opacity-40"
              >
                <span aria-hidden className="size-2 rounded-full" style={{ background: statusStyle[s].color }} />
                {statusStyle[s].label}
                <span className="tabular-nums text-muted">{counts[s]}</span>
              </button>
            );
          })}
        </div>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
        <button
          type="button"
          onClick={() => setExpanded(new Set(folders))}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-muted"
        >
          Tout déplier
        </button>
        <button
          type="button"
          onClick={() => setExpanded(new Set([""]))}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-muted"
        >
          Tout replier
        </button>
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {filtering
          ? `${structure.nodes.filter((n) => visible?.has(n.path)).length} chemin(s) affiché(s) sur ${structure.nodes.length}`
          : `${structure.nodes.length} chemins décrits`}
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
        <ul role="tree" aria-label={`Arborescence de ${structure.root}`} className="py-1.5">
          <Row
            t={tree}
            expanded={expanded}
            visible={visible}
            target={target}
            onToggle={toggle}
          />
        </ul>
        {visible && visible.size === 0 && (
          <p className="border-t border-line p-6 text-center text-sm text-muted">Aucun chemin ne correspond à ce filtre.</p>
        )}
      </div>
    </div>
  );
}

function Row({
  t,
  expanded,
  visible,
  target,
  onToggle,
}: {
  t: TreeNode;
  expanded: Set<string>;
  visible: Set<string> | null;
  target: number | null;
  onToggle: (path: string) => void;
}) {
  const reduce = useReducedMotion();
  if (visible && !visible.has(t.path)) return null;
  const hasChildren = t.children.length > 0;
  const isFolder = hasChildren || t.node?.kind === "dossier";
  const open = hasChildren && (visible !== null || expanded.has(t.path));
  const n = t.node;
  const isTarget = target !== null && t.index === target;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-selected={false}>
      <div
        id={t.index >= 0 ? nodeAnchor(t.index) : undefined}
        className={`group grid scroll-mt-24 gap-x-4 gap-y-0.5 px-3 py-1.5 transition-colors hover:bg-surface-2/70 md:grid-cols-[minmax(0,20rem)_1fr] ${
          isTarget ? "bg-accent-soft" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: `${t.depth * 1.1}rem` }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(t.path)}
              aria-label={open ? `Replier ${t.name}` : `Déplier ${t.name}`}
              className="grid size-5 shrink-0 place-items-center rounded text-muted hover:bg-surface-2 hover:text-ink"
            >
              <motion.span
                aria-hidden
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: reduce ? 0 : 0.15 }}
                className="text-[10px]"
              >
                ▶
              </motion.span>
            </button>
          ) : (
            <span aria-hidden className="size-5 shrink-0" />
          )}
          <span aria-hidden className="shrink-0 text-sm">{isFolder ? "📁" : "📄"}</span>
          <span
            className={`truncate font-mono text-[13px] ${isFolder ? "font-semibold" : ""}`}
            title={t.path === "" ? t.name : t.path}
          >
            {t.name}
            {isFolder && t.path !== "" ? "/" : ""}
          </span>
          {n && (
            <span
              style={statusStyle[n.status]}
              className="ml-auto shrink-0 rounded-full px-2 py-px text-[11px] font-semibold md:ml-1"
            >
              {statusStyle[n.status].label}
            </span>
          )}
        </div>
        <div
          className="min-w-0 pb-0.5 pl-(--indent) text-sm leading-relaxed md:pl-0"
          style={{ "--indent": `${t.depth * 1.1 + 2.6}rem` } as CSSProperties}
        >
          <NodeDetail n={n} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            role="group"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {t.children.map((c) => (
              <Row key={c.path} t={c} expanded={expanded} visible={visible} target={target} onToggle={onToggle} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

function NodeDetail({ n }: { n: StructureNode | null }) {
  if (!n) return <span className="text-muted italic">Dossier non décrit.</span>;
  const size = [
    n.sizeBytes !== undefined ? formatBytes(n.sizeBytes) : null,
    n.chars !== undefined ? `${nf.format(n.chars)} car.` : null,
  ].filter(Boolean);
  return (
    <span className="text-muted">
      <span className="text-ink/85"><RichText text={n.description} /></span>
      {size.length > 0 && <span className="ml-2 font-mono text-xs tabular-nums">{size.join(" · ")}</span>}
      {n.findingIds.length > 0 && (
        <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
          {n.findingIds.map((id) => (
            <a
              key={id}
              href={`#constat-${id}`}
              className="rounded-md border border-line bg-bg px-1.5 py-px font-mono text-[11px] text-ink transition-colors hover:border-accent hover:text-accent"
              aria-label={`Voir le constat ${id}`}
            >
              {id}
            </a>
          ))}
        </span>
      )}
    </span>
  );
}
