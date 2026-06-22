"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Pane, TocItem } from "@/lib/types";
import { useWorkspace } from "@/lib/store";
import { computeStats, readingTimeLabel } from "@/lib/stats";
import { parseFrontMatter } from "@/lib/markdown";
import { buildTocFromElement } from "@/lib/toc";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { buildStandaloneHtml, copyToClipboard, downloadText, printHtml } from "@/lib/export";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { Outline } from "./Outline";
import { PaneHeader, type PaneActions } from "./PaneHeader";
import { EmptyPane } from "./EmptyPane";
import { cn } from "@/lib/cn";

interface DocPaneProps {
  pane: Pane;
  index: number;
  totalPanes: number;
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function DocPane({ pane, index, totalPanes }: DocPaneProps) {
  const doc = useWorkspace((s) => (pane.docId ? s.docs[pane.docId] ?? null : null));
  const isActive = useWorkspace((s) => s.activePaneId === pane.id);
  const setActivePane = useWorkspace((s) => s.setActivePane);
  const updateDocContent = useWorkspace((s) => s.updateDocContent);
  const formatDoc = useWorkspace((s) => s.formatDoc);
  const outlineOpen = useWorkspace((s) => s.settings.outlineOpen);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);

  const content = doc?.content ?? "";
  const { data: frontmatter, body } = useMemo(() => parseFrontMatter(content), [content]);
  const stats = useMemo(() => computeStats(content), [content]);
  const tags = useMemo(() => toTags(frontmatter.tags), [frontmatter.tags]);

  const showPreview = pane.mode !== "edit";
  const showEditor = pane.mode !== "preview";
  const activeId = useScrollSpy(scrollRef, `${pane.docId}:${pane.mode}:${content.length}`);

  // Rebuild the outline from the rendered DOM after content/mode changes.
  // (The outline only renders in preview mode, so a stale value otherwise is fine.)
  useEffect(() => {
    if (!showPreview) return;
    const raf = requestAnimationFrame(() => setToc(buildTocFromElement(scrollRef.current)));
    return () => cancelAnimationFrame(raf);
  }, [content, showPreview, pane.docId]);

  const getHtml = useCallback(
    () => scrollRef.current?.querySelector(".folio-prose")?.innerHTML ?? "",
    [],
  );

  const actions: PaneActions = useMemo(() => {
    const baseName = doc ? doc.name.replace(/\.[^.]+$/, "") : "document";
    return {
      copyMarkdown: () => doc && copyToClipboard(doc.content),
      downloadMd: () =>
        doc && downloadText(/\.md$/i.test(doc.name) ? doc.name : `${doc.name}.md`, doc.content, "text/markdown"),
      copyHtml: () => copyToClipboard(getHtml()),
      downloadHtml: () => doc && downloadText(`${baseName}.html`, buildStandaloneHtml(doc.name, getHtml()), "text/html"),
      print: () => doc && printHtml(doc.name, getHtml()),
      format: () => doc && formatDoc(doc.id),
    };
  }, [doc, formatDoc, getHtml]);

  const onJump = useCallback((id: string) => {
    const el = scrollRef.current?.querySelector(`#${CSS.escape(id)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      onMouseDown={() => !isActive && setActivePane(pane.id)}
      className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface"
    >
      <PaneHeader
        pane={pane}
        doc={doc}
        index={index}
        isActive={isActive}
        totalPanes={totalPanes}
        actions={actions}
      />

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col md:flex-row",
          isActive && totalPanes > 1 && "ring-2 ring-inset ring-primary",
        )}
      >
        {!doc ? (
          <EmptyPane />
        ) : (
          <>
            {showEditor && (
              <div
                className={cn(
                  "min-h-0 min-w-0 overflow-hidden border-border",
                  pane.mode === "split" ? "flex-1 border-b md:border-b-0 md:border-r" : "flex-1",
                )}
              >
                <MarkdownEditor
                  value={doc.content}
                  onChange={(v) => updateDocContent(doc.id, v)}
                />
              </div>
            )}

            {showPreview && (
              <div ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                <div className="px-6 py-9 sm:px-10">
                  <div className="mx-auto max-w-[68ch]">
                    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-faint">
                      <span>{readingTimeLabel(stats)}</span>
                      <span aria-hidden>·</span>
                      <span>{stats.words.toLocaleString()} words</span>
                      {stats.headings > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{stats.headings} headings</span>
                        </>
                      )}
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-pill bg-surface-alt px-2 py-0.5 text-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <MarkdownView content={body} />
                </div>
              </div>
            )}

            {showPreview && pane.mode === "preview" && outlineOpen && totalPanes === 1 && (
              <Outline items={toc} activeId={activeId} onJump={onJump} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
