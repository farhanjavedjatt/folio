"use client";

import {
  ChevronDown,
  Columns2,
  Copy,
  Download,
  Eye,
  FileCode2,
  MoreHorizontal,
  PenLine,
  Printer,
  Sparkles,
  X,
} from "lucide-react";
import type { MdDocument, Pane, ViewMode } from "@/lib/types";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";
import { Segmented } from "@/components/ui/Segmented";
import { Menu, type MenuEntry, type MenuItem } from "@/components/ui/Menu";

const ROMAN = ["I", "II", "III", "IV"];

export interface PaneActions {
  copyMarkdown: () => void;
  downloadMd: () => void;
  copyHtml: () => void;
  downloadHtml: () => void;
  print: () => void;
  format: () => void;
}

interface PaneHeaderProps {
  pane: Pane;
  doc: MdDocument | null;
  index: number;
  isActive: boolean;
  totalPanes: number;
  actions: PaneActions;
}

export function PaneHeader({ pane, doc, index, isActive, totalPanes, actions }: PaneHeaderProps) {
  const docs = useWorkspace((s) => s.docs);
  const docOrder = useWorkspace((s) => s.docOrder);
  const setPaneMode = useWorkspace((s) => s.setPaneMode);
  const openDocInPane = useWorkspace((s) => s.openDocInPane);
  const closePane = useWorkspace((s) => s.closePane);

  const editing = pane.mode !== "preview";

  const modeOptions = [
    { value: "preview" as ViewMode, label: "Read", icon: <Eye size={14} /> },
    { value: "split" as ViewMode, label: "Split", icon: <Columns2 size={14} /> },
    { value: "edit" as ViewMode, label: "Edit", icon: <PenLine size={14} /> },
  ];

  const docItems: MenuItem[] = docOrder
    .map((id) => docs[id])
    .filter(Boolean)
    .map((d) => ({
      label: d.name,
      onSelect: () => openDocInPane(pane.id, d.id),
      icon: d.id === pane.docId ? <span className="text-primary">•</span> : <span className="opacity-0">•</span>,
    }));

  // HTML export reads the rendered preview DOM, which isn't present in Edit mode.
  const noPreview = pane.mode === "edit";
  const moreItems: MenuEntry[] = [
    { label: "Copy markdown", icon: <Copy size={14} />, onSelect: actions.copyMarkdown },
    { label: "Copy as HTML", icon: <FileCode2 size={14} />, onSelect: actions.copyHtml, disabled: noPreview },
    "separator",
    { label: "Format / tidy source", icon: <Sparkles size={14} />, onSelect: actions.format },
    "separator",
    { label: "Download .md", icon: <Download size={14} />, onSelect: actions.downloadMd },
    { label: "Download .html", icon: <Download size={14} />, onSelect: actions.downloadHtml, disabled: noPreview },
    { label: "Print / PDF", icon: <Printer size={14} />, onSelect: actions.print, disabled: noPreview },
  ];

  return (
    <header
      className={cn(
        "flex h-10 shrink-0 items-center gap-1.5 border-b px-2",
        isActive ? "border-border-strong bg-surface" : "border-border bg-surface-alt",
      )}
    >
      {/* Folio marker + editing/focus tick */}
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[11px] font-medium",
          editing ? "text-accent" : isActive ? "text-primary" : "text-faint",
        )}
        title={`Pane ${ROMAN[index] ?? index + 1}`}
      >
        {ROMAN[index] ?? index + 1}
      </span>

      {/* Document switcher */}
      <Menu
        ariaLabel="Switch document in this pane"
        align="left"
        width={240}
        items={docItems}
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex min-w-0 items-center gap-1 rounded-control px-1.5 py-1 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            title={doc?.name ?? "Choose a document"}
          >
            <span
              className={cn(
                "truncate font-serif text-sm",
                doc ? "text-ink" : "text-faint italic",
              )}
            >
              {doc?.name ?? "Empty pane"}
            </span>
            <ChevronDown size={13} className="shrink-0 text-faint" />
          </button>
        )}
      />

      <div className="ml-auto flex items-center gap-1">
        <Segmented
          ariaLabel="View mode"
          value={pane.mode}
          onChange={(m) => setPaneMode(pane.id, m)}
          options={modeOptions}
        />
        <Menu
          ariaLabel="Document actions"
          items={moreItems}
          width={210}
          trigger={({ toggle, open }) => (
            <IconButton label="Document actions" size="sm" active={open} onClick={toggle}>
              <MoreHorizontal size={16} />
            </IconButton>
          )}
        />
        {totalPanes > 1 && (
          <IconButton label="Close pane" size="sm" onClick={() => closePane(pane.id)}>
            <X size={15} />
          </IconButton>
        )}
      </div>
    </header>
  );
}
