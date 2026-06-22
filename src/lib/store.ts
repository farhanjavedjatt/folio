"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MdDocument, Pane, Settings, ThemeSetting, ViewMode } from "./types";
import { SAMPLE_DOCS } from "./samples";
import { formatMarkdown } from "./markdown";

const MAX_PANES = 3;
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`);
const now = () => Date.now();

export interface WorkspaceState {
  docs: Record<string, MdDocument>;
  docOrder: string[];
  panes: Pane[];
  activePaneId: string;
  settings: Settings;
  _hasHydrated: boolean;

  // Document CRUD
  createDoc: (opts?: { name?: string; content?: string; open?: boolean }) => string;
  importFiles: (files: { name: string; content: string }[]) => string | null;
  updateDocContent: (id: string, content: string) => void;
  renameDoc: (id: string, name: string) => void;
  deleteDoc: (id: string) => void;
  duplicateDoc: (id: string) => string | null;
  togglePin: (id: string) => void;
  reorderDocs: (order: string[]) => void;
  formatDoc: (id: string) => Promise<void>;

  // Panes / layout
  setActivePane: (paneId: string) => void;
  openDocInActivePane: (docId: string) => void;
  openDocInPane: (paneId: string, docId: string | null) => void;
  openDocInNewPane: (docId: string) => void;
  setPaneMode: (paneId: string, mode: ViewMode) => void;
  closePane: (paneId: string) => void;
  setLayout: (count: number) => void;
  focusPaneByIndex: (index: number) => void;

  // Settings
  setTheme: (theme: ThemeSetting) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  toggleOutline: () => void;
  setWrapEditor: (wrap: boolean) => void;
  setFontScale: (scale: number) => void;
}

const defaultSettings: Settings = {
  theme: "system",
  sidebarOpen: true,
  outlineOpen: true,
  wrapEditor: true,
  fontScale: 1,
};

function makeDoc(name: string, content: string, pinned = false): MdDocument {
  const t = now();
  return { id: uid(), name, content, createdAt: t, updatedAt: t, pinned };
}

/** First-run state: seed sample documents and open the welcome doc. */
function createInitialState() {
  const docs: Record<string, MdDocument> = {};
  const docOrder: string[] = [];
  for (const s of SAMPLE_DOCS) {
    const doc = makeDoc(s.name, s.content, s.pinned);
    docs[doc.id] = doc;
    docOrder.push(doc.id);
  }
  const firstPane: Pane = { id: uid(), docId: docOrder[0] ?? null, mode: "preview" };
  return { docs, docOrder, panes: [firstPane], activePaneId: firstPane.id };
}

/** Ensure a unique, sensible filename ending in .md. */
function ensureName(name: string | undefined, existing: MdDocument[]): string {
  let base = (name ?? "").trim() || "Untitled.md";
  if (!/\.[a-z0-9]+$/i.test(base)) base += ".md";
  const taken = new Set(existing.map((d) => d.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  const dot = base.lastIndexOf(".");
  const stem = base.slice(0, dot);
  const ext = base.slice(dot);
  let n = 2;
  while (taken.has(`${stem} ${n}${ext}`.toLowerCase())) n++;
  return `${stem} ${n}${ext}`;
}

function firstUnshownDoc(docOrder: string[], panes: Pane[]): string | null {
  const shown = new Set(panes.map((p) => p.docId).filter(Boolean));
  return docOrder.find((id) => !shown.has(id)) ?? null;
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      settings: defaultSettings,
      _hasHydrated: false,

      createDoc: (opts) => {
        const { docs, docOrder, panes, activePaneId } = get();
        const doc = makeDoc(ensureName(opts?.name, Object.values(docs)), opts?.content ?? "");
        const nextDocs = { ...docs, [doc.id]: doc };
        const nextOrder = [doc.id, ...docOrder];
        let nextPanes = panes;
        if (opts?.open !== false) {
          nextPanes = panes.map((p) => (p.id === activePaneId ? { ...p, docId: doc.id } : p));
        }
        set({ docs: nextDocs, docOrder: nextOrder, panes: nextPanes });
        return doc.id;
      },

      importFiles: (files) => {
        if (files.length === 0) return null;
        const { docs, docOrder, panes, activePaneId } = get();
        const nextDocs = { ...docs };
        const added: string[] = [];
        for (const f of files) {
          const doc = makeDoc(ensureName(f.name, Object.values(nextDocs)), f.content);
          nextDocs[doc.id] = doc;
          added.push(doc.id);
        }
        const firstId = added[0];
        const nextPanes = panes.map((p) => (p.id === activePaneId ? { ...p, docId: firstId } : p));
        set({ docs: nextDocs, docOrder: [...added, ...docOrder], panes: nextPanes });
        return firstId;
      },

      updateDocContent: (id, content) => {
        const doc = get().docs[id];
        if (!doc || doc.content === content) return;
        set({ docs: { ...get().docs, [id]: { ...doc, content, updatedAt: now() } } });
      },

      renameDoc: (id, name) => {
        const doc = get().docs[id];
        if (!doc) return;
        const clean = ensureName(name, Object.values(get().docs).filter((d) => d.id !== id));
        set({ docs: { ...get().docs, [id]: { ...doc, name: clean, updatedAt: now() } } });
      },

      deleteDoc: (id) => {
        const { docs, docOrder, panes } = get();
        if (!docs[id]) return;
        const nextDocs = { ...docs };
        delete nextDocs[id];
        const nextOrder = docOrder.filter((d) => d !== id);
        const fallback = nextOrder[0] ?? null;
        const nextPanes = panes.map((p) => (p.docId === id ? { ...p, docId: fallback } : p));
        set({ docs: nextDocs, docOrder: nextOrder, panes: nextPanes });
      },

      duplicateDoc: (id) => {
        const { docs, docOrder } = get();
        const doc = docs[id];
        if (!doc) return null;
        const copy = makeDoc(ensureName(doc.name, Object.values(docs)), doc.content);
        const idx = docOrder.indexOf(id);
        const nextOrder = [...docOrder];
        nextOrder.splice(idx + 1, 0, copy.id);
        set({ docs: { ...docs, [copy.id]: copy }, docOrder: nextOrder });
        return copy.id;
      },

      togglePin: (id) => {
        const doc = get().docs[id];
        if (!doc) return;
        set({ docs: { ...get().docs, [id]: { ...doc, pinned: !doc.pinned } } });
      },

      reorderDocs: (order) => set({ docOrder: order }),

      formatDoc: async (id) => {
        const doc = get().docs[id];
        if (!doc) return;
        const formatted = await formatMarkdown(doc.content);
        const latest = get().docs[id];
        if (!latest) return;
        set({ docs: { ...get().docs, [id]: { ...latest, content: formatted, updatedAt: now() } } });
      },

      setActivePane: (paneId) => set({ activePaneId: paneId }),

      openDocInActivePane: (docId) => {
        const { panes, activePaneId } = get();
        set({ panes: panes.map((p) => (p.id === activePaneId ? { ...p, docId } : p)) });
      },

      openDocInPane: (paneId, docId) => {
        set({ panes: get().panes.map((p) => (p.id === paneId ? { ...p, docId } : p)), activePaneId: paneId });
      },

      openDocInNewPane: (docId) => {
        const { panes } = get();
        if (panes.length >= MAX_PANES) {
          // Replace the active pane instead of overflowing.
          get().openDocInActivePane(docId);
          return;
        }
        const pane: Pane = { id: uid(), docId, mode: "preview" };
        set({ panes: [...panes, pane], activePaneId: pane.id });
      },

      setPaneMode: (paneId, mode) => {
        set({ panes: get().panes.map((p) => (p.id === paneId ? { ...p, mode } : p)) });
      },

      closePane: (paneId) => {
        const { panes, activePaneId } = get();
        if (panes.length <= 1) return;
        const nextPanes = panes.filter((p) => p.id !== paneId);
        const nextActive = activePaneId === paneId ? nextPanes[0].id : activePaneId;
        set({ panes: nextPanes, activePaneId: nextActive });
      },

      setLayout: (count) => {
        const target = Math.max(1, Math.min(MAX_PANES, count));
        const { panes, activePaneId, docOrder } = get();
        if (target === panes.length) return;
        if (target < panes.length) {
          const nextPanes = panes.slice(0, target);
          const nextActive = nextPanes.some((p) => p.id === activePaneId) ? activePaneId : nextPanes[0].id;
          set({ panes: nextPanes, activePaneId: nextActive });
          return;
        }
        const nextPanes = [...panes];
        while (nextPanes.length < target) {
          const docId = firstUnshownDoc(docOrder, nextPanes);
          nextPanes.push({ id: uid(), docId, mode: "preview" });
        }
        set({ panes: nextPanes });
      },

      focusPaneByIndex: (index) => {
        const pane = get().panes[index];
        if (pane) set({ activePaneId: pane.id });
      },

      setTheme: (theme) => set({ settings: { ...get().settings, theme } }),
      toggleSidebar: () => set({ settings: { ...get().settings, sidebarOpen: !get().settings.sidebarOpen } }),
      setSidebar: (open) => set({ settings: { ...get().settings, sidebarOpen: open } }),
      toggleOutline: () => set({ settings: { ...get().settings, outlineOpen: !get().settings.outlineOpen } }),
      setWrapEditor: (wrap) => set({ settings: { ...get().settings, wrapEditor: wrap } }),
      setFontScale: (scale) => set({ settings: { ...get().settings, fontScale: Math.max(0.8, Math.min(1.4, scale)) } }),
    }),
    {
      name: "folio-workspace",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        docs: s.docs,
        docOrder: s.docOrder,
        panes: s.panes,
        activePaneId: s.activePaneId,
        settings: s.settings,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<WorkspaceState>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    },
  ),
);

/** Convenience selector: the document shown in the active pane. */
export function useActiveDoc(): MdDocument | null {
  return useWorkspace((s) => {
    const pane = s.panes.find((p) => p.id === s.activePaneId);
    return pane?.docId ? s.docs[pane.docId] ?? null : null;
  });
}
