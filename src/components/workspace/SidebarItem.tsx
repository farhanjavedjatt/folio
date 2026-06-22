"use client";

import { useEffect, useRef, useState } from "react";
import {
  Columns2,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import type { MdDocument } from "@/lib/types";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/cn";
import { downloadText } from "@/lib/export";
import { IconButton } from "@/components/ui/IconButton";
import { Menu, type MenuEntry } from "@/components/ui/Menu";

interface SidebarItemProps {
  doc: MdDocument;
  subtitle: string | null;
  isActive: boolean;
  /** Roman numerals of panes currently showing this doc. */
  badges: string[];
  /** True when an open pane is editing this doc. */
  editing: boolean;
}

export function SidebarItem({ doc, subtitle, isActive, badges, editing }: SidebarItemProps) {
  const openDocInActivePane = useWorkspace((s) => s.openDocInActivePane);
  const openDocInNewPane = useWorkspace((s) => s.openDocInNewPane);
  const renameDoc = useWorkspace((s) => s.renameDoc);
  const duplicateDoc = useWorkspace((s) => s.duplicateDoc);
  const togglePin = useWorkspace((s) => s.togglePin);
  const deleteDoc = useWorkspace((s) => s.deleteDoc);

  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState(doc.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = () => {
    setDraft(doc.name);
    setRenaming(true);
  };

  useEffect(() => {
    if (!renaming) return;
    const raf = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const dot = doc.name.lastIndexOf(".");
      el.setSelectionRange(0, dot > 0 ? dot : doc.name.length);
    });
    return () => cancelAnimationFrame(raf);
  }, [renaming, doc.name]);

  const commitRename = () => {
    const v = draft.trim();
    if (v && v !== doc.name) renameDoc(doc.id, v);
    setRenaming(false);
  };

  const openInPaneBar = badges.length > 0;

  const menuItems: MenuEntry[] = [
    { label: "Open in new pane", icon: <Columns2 size={14} />, onSelect: () => openDocInNewPane(doc.id) },
    { label: "Rename", icon: <Pencil size={14} />, onSelect: startRename },
    { label: "Duplicate", icon: <Copy size={14} />, onSelect: () => duplicateDoc(doc.id) },
    {
      label: doc.pinned ? "Unpin" : "Pin to top",
      icon: doc.pinned ? <PinOff size={14} /> : <Pin size={14} />,
      onSelect: () => togglePin(doc.id),
    },
    {
      label: "Download .md",
      icon: <Download size={14} />,
      onSelect: () => downloadText(/\.md$/i.test(doc.name) ? doc.name : `${doc.name}.md`, doc.content, "text/markdown"),
    },
    "separator",
    { label: "Delete", icon: <Trash2 size={14} />, tone: "danger", onSelect: () => setConfirming(true) },
  ];

  if (confirming) {
    return (
      <div className="mx-1.5 my-0.5 rounded-control border border-danger/40 bg-surface-alt px-3 py-2 text-sm">
        <p className="mb-2 text-muted">
          Delete <span className="font-medium text-ink">{doc.name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-control px-2 py-1 text-xs text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteDoc(doc.id)}
            className="rounded-control bg-danger px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex items-center pr-1.5 transition-colors",
        isActive ? "bg-surface" : "hover:bg-surface-hover",
      )}
    >
      {/* Left edge bar — ink-blue for active/open, clay when editing */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          isActive ? "bg-primary" : editing ? "bg-accent" : openInPaneBar ? "bg-primary/40" : "bg-transparent",
        )}
      />

      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="m-1 min-w-0 flex-1 rounded-control border border-primary bg-surface px-2 py-1 text-sm text-ink outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => openDocInActivePane(doc.id)}
          onDoubleClick={startRename}
          className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5 pl-3 pr-1 text-left"
        >
          <span
            className={cn(
              "truncate text-sm leading-tight",
              isActive ? "font-semibold text-ink" : "font-medium text-ink",
            )}
          >
            {doc.name}
          </span>
          {subtitle && <span className="truncate text-xs leading-tight text-muted">{subtitle}</span>}
        </button>
      )}

      {!renaming && (
        <div className="flex shrink-0 items-center gap-1">
          {badges.map((b) => (
            <span
              key={b}
              title={`Open in pane ${b}`}
              aria-label={`Open in pane ${b}`}
              className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-[3px] px-1 font-mono text-[10px]",
                editing ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary",
              )}
            >
              {b}
            </span>
          ))}
          <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Menu
              ariaLabel={`Actions for ${doc.name}`}
              items={menuItems}
              width={190}
              trigger={({ toggle, open }) => (
                <IconButton label="Document actions" size="sm" active={open} onClick={toggle}>
                  <MoreHorizontal size={15} />
                </IconButton>
              )}
            />
          </span>
        </div>
      )}
    </div>
  );
}
