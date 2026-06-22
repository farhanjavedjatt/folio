"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/store";
import { useMounted } from "@/hooks/useMounted";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { PaneGrid } from "./PaneGrid";
import { CommandPalette } from "./CommandPalette";

function isEditableTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === "INPUT" ||
    node.tagName === "TEXTAREA" ||
    node.isContentEditable === true
  );
}

export function Workspace() {
  useThemeEffect();
  const mounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const sidebarOpen = useWorkspace((s) => s.settings.sidebarOpen);
  const setSidebar = useWorkspace((s) => s.setSidebar);
  const toggleSidebar = useWorkspace((s) => s.toggleSidebar);
  const createDoc = useWorkspace((s) => s.createDoc);
  const focusPaneByIndex = useWorkspace((s) => s.focusPaneByIndex);
  const activeDocId = useWorkspace(
    (s) => s.panes.find((p) => p.id === s.activePaneId)?.docId ?? null,
  );

  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (mod && (e.key === "\\" || e.key.toLowerCase() === "b")) {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      if (mod && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        focusPaneByIndex(Number(e.key) - 1);
        return;
      }
      if (isEditableTarget(e.target)) return;
      if (e.key === "/") {
        e.preventDefault();
        setSidebar(true);
        requestAnimationFrame(() => document.getElementById("sidebar-search")?.focus());
        return;
      }
      if (e.key.toLowerCase() === "n" && !mod && !e.altKey) {
        e.preventDefault();
        createDoc();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar, setSidebar, focusPaneByIndex, createDoc]);

  // On mobile, opening a document dismisses the sidebar drawer.
  const prevDoc = useRef(activeDocId);
  useEffect(() => {
    if (activeDocId !== prevDoc.current) {
      prevDoc.current = activeDocId;
      if (!isDesktop) setSidebar(false);
    }
  }, [activeDocId, isDesktop, setSidebar]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <span className="font-serif text-2xl text-faint" style={{ fontVariant: "small-caps" }}>
          Folio
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar (inline, pushes content) */}
        {isDesktop && sidebarOpen && (
          <div className="w-[264px] shrink-0 border-r border-border-strong">
            <Sidebar />
          </div>
        )}

        {/* Mobile sidebar (overlay drawer) */}
        {!isDesktop && sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="animate-fade-in absolute inset-0 bg-ink/30" onClick={() => setSidebar(false)} />
            <div className="pane-shadow animate-fade-in relative z-10 w-[280px] max-w-[85vw] border-r border-border-strong">
              <Sidebar />
            </div>
          </div>
        )}

        <main className={cn("min-w-0 flex-1")}>
          <PaneGrid />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
