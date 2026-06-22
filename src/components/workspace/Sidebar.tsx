"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { FilePlus2, Search, Upload, X } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import { deriveTitle } from "@/lib/markdown";
import { ACCEPT_ATTR, readFiles } from "@/lib/files";
import { SidebarItem } from "./SidebarItem";

const ROMAN = ["I", "II", "III", "IV"];

export function Sidebar() {
  const docs = useWorkspace((s) => s.docs);
  const docOrder = useWorkspace((s) => s.docOrder);
  const panes = useWorkspace((s) => s.panes);
  const activePaneId = useWorkspace((s) => s.activePaneId);
  const createDoc = useWorkspace((s) => s.createDoc);
  const importFiles = useWorkspace((s) => s.importFiles);

  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocId = useMemo(
    () => panes.find((p) => p.id === activePaneId)?.docId ?? null,
    [panes, activePaneId],
  );

  // docId -> { badges: roman[], editing: bool }
  const paneMap = useMemo(() => {
    const map = new Map<string, { badges: string[]; editing: boolean }>();
    panes.forEach((p, i) => {
      if (!p.docId) return;
      const entry = map.get(p.docId) ?? { badges: [], editing: false };
      entry.badges.push(ROMAN[i] ?? String(i + 1));
      if (p.mode !== "preview") entry.editing = true;
      map.set(p.docId, entry);
    });
    return map;
  }, [panes]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = docOrder
      .map((id) => docs[id])
      .filter(Boolean)
      .filter((d) => {
        if (!q) return true;
        return (
          d.name.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
        );
      });
    // Pinned first, otherwise preserve order.
    return list
      .map((d) => ({ doc: d, subtitle: deriveTitle(d.content) }))
      .sort((a, b) => Number(!!b.doc.pinned) - Number(!!a.doc.pinned));
  }, [docs, docOrder, query]);

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = await readFiles(e.dataTransfer.files);
    if (files.length) importFiles(files);
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = await readFiles(e.target.files);
    if (files.length) importFiles(files);
    e.target.value = "";
  };

  const count = docOrder.length;

  return (
    <aside className="flex h-full w-full flex-col bg-surface-alt">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h2 className="label-caps text-base">Library</h2>
          <span className="font-mono text-[11px] text-faint">
            {count} document{count === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-3 border-b border-border" />
      </div>

      {/* Search */}
      <div className="px-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="sidebar-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search documents"
            aria-label="Search documents"
            className="w-full rounded-pill border border-border bg-surface py-1.5 pl-8 pr-8 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[4px] border border-border bg-surface-alt px-1.5 font-mono text-[10px] text-faint">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* List + drop zone */}
      <div
        className="relative mt-2 min-h-0 flex-1 overflow-y-auto py-1"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragOver(false);
        }}
        onDrop={onDrop}
      >
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-faint">
            {query ? "No matching documents." : "No documents yet."}
          </p>
        ) : (
          items.map(({ doc, subtitle }) => {
            const entry = paneMap.get(doc.id);
            return (
              <SidebarItem
                key={doc.id}
                doc={doc}
                subtitle={subtitle}
                isActive={doc.id === activeDocId}
                badges={entry?.badges ?? []}
                editing={entry?.editing ?? false}
              />
            );
          })
        )}

        {dragOver && (
          <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-card border-2 border-dashed border-primary bg-surface/80">
            <p className="text-sm font-medium text-primary">Drop markdown files to import</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-border p-3">
        <button
          type="button"
          onClick={() => createDoc()}
          className="flex flex-1 items-center justify-center gap-2 rounded-control bg-primary px-3 py-2 text-sm font-medium text-primary-fg transition-opacity hover:opacity-90"
        >
          <FilePlus2 size={15} />
          New
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
          title="Upload markdown files"
        >
          <Upload size={15} />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          hidden
          onChange={onPickFiles}
        />
      </div>
    </aside>
  );
}
