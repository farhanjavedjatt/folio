"use client";

import { Fragment, useRef, useState } from "react";
import { useWorkspace } from "@/lib/store";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DocPane } from "./DocPane";

const MIN_PCT = 16;

export function PaneGrid() {
  const panes = useWorkspace((s) => s.panes);
  const activePaneId = useWorkspace((s) => s.activePaneId);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>(() => panes.map(() => 100 / panes.length));
  const [prevCount, setPrevCount] = useState(panes.length);

  // Reset to equal widths when the number of panes changes (render-time pattern).
  if (prevCount !== panes.length) {
    setPrevCount(panes.length);
    setSizes(Array.from({ length: panes.length }, () => 100 / panes.length));
  }

  // Self-contained drag: handlers capture the divider index and starting widths,
  // and tear themselves down on mouseup.
  const startDrag = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const cont = containerRef.current;
    if (!cont) return;
    const startX = e.clientX;
    const base = [...sizes];

    const onMove = (ev: MouseEvent) => {
      const w = cont.getBoundingClientRect().width;
      if (w === 0) return;
      const deltaPct = ((ev.clientX - startX) / w) * 100;
      const left = base[index - 1] + deltaPct;
      const right = base[index] - deltaPct;
      if (left < MIN_PCT || right < MIN_PCT) return;
      const next = [...base];
      next[index - 1] = left;
      next[index] = right;
      setSizes(next);
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Keyboard resize: nudge the divider between panes index-1 and index.
  const nudge = (index: number, deltaPct: number) => {
    setSizes((prev) => {
      const base = prev.length === panes.length ? prev : panes.map(() => 100 / panes.length);
      const left = base[index - 1] + deltaPct;
      const right = base[index] - deltaPct;
      if (left < MIN_PCT || right < MIN_PCT) return base;
      const nextArr = [...base];
      nextArr[index - 1] = left;
      nextArr[index] = right;
      return nextArr;
    });
  };

  // Mobile: show only the active pane to avoid cramming.
  if (!isDesktop) {
    const idx = Math.max(0, panes.findIndex((p) => p.id === activePaneId));
    const pane = panes[idx] ?? panes[0];
    return (
      <div className="flex h-full min-h-0">
        <DocPane key={pane.id} pane={pane} index={idx} totalPanes={panes.length} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full min-h-0">
      {panes.map((pane, i) => (
        <Fragment key={pane.id}>
          {i > 0 && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Resize panes (use arrow keys)"
              aria-valuemin={MIN_PCT}
              aria-valuemax={100 - MIN_PCT}
              aria-valuenow={Math.round(sizes[i - 1] ?? 100 / panes.length)}
              onMouseDown={startDrag(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  nudge(i, -4);
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  nudge(i, 4);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  setSizes(panes.map(() => 100 / panes.length));
                }
              }}
              className="relative z-10 w-px shrink-0 cursor-col-resize bg-border-strong transition-colors hover:bg-primary focus-visible:bg-primary"
            >
              <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
            </div>
          )}
          <div
            className="flex min-w-0"
            style={{ flexBasis: `${sizes[i] ?? 100 / panes.length}%`, flexGrow: 1, flexShrink: 1 }}
          >
            <DocPane pane={pane} index={i} totalPanes={panes.length} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}
