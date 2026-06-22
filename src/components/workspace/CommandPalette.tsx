"use client";

import { Command } from "cmdk";
import { useEffect } from "react";
import {
  Columns2,
  Columns3,
  Download,
  FilePlus2,
  FileText,
  Monitor,
  Moon,
  PanelLeft,
  PanelRight,
  Search,
  Sparkles,
  Square,
  Sun,
  TextCursorInput,
  Type,
  Upload,
  WrapText,
} from "lucide-react";
import { useActiveDoc, useWorkspace } from "@/lib/store";
import { openFileDialog } from "@/lib/files";
import { copyToClipboard, downloadText } from "@/lib/export";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Cmd {
  id: string;
  title: string;
  icon: ReactNode;
  keywords?: string;
  run: () => void;
}

const groupHeadingClasses =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint";

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const docs = useWorkspace((s) => s.docs);
  const docOrder = useWorkspace((s) => s.docOrder);
  const activeDoc = useActiveDoc();
  const settings = useWorkspace((s) => s.settings);

  const createDoc = useWorkspace((s) => s.createDoc);
  const importFiles = useWorkspace((s) => s.importFiles);
  const openDocInActivePane = useWorkspace((s) => s.openDocInActivePane);
  const openDocInNewPane = useWorkspace((s) => s.openDocInNewPane);
  const setTheme = useWorkspace((s) => s.setTheme);
  const setLayout = useWorkspace((s) => s.setLayout);
  const toggleSidebar = useWorkspace((s) => s.toggleSidebar);
  const toggleOutline = useWorkspace((s) => s.toggleOutline);
  const setWrapEditor = useWorkspace((s) => s.setWrapEditor);
  const setFontScale = useWorkspace((s) => s.setFontScale);
  const formatDoc = useWorkspace((s) => s.formatDoc);

  // Restore focus to whatever opened the palette when it closes.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    return () => opener?.focus?.();
  }, [open]);

  const close = () => onOpenChange(false);
  const withClose = (fn: () => void) => () => {
    fn();
    close();
  };

  const buildCommands = (): Cmd[] => {
    const list: Cmd[] = [
      { id: "new", title: "New document", icon: <FilePlus2 size={15} />, keywords: "create add", run: withClose(() => createDoc()) },
      {
        id: "import",
        title: "Import markdown files…",
        icon: <Upload size={15} />,
        keywords: "upload open file",
        run: withClose(async () => {
          const files = await openFileDialog();
          if (files.length) importFiles(files);
        }),
      },
      { id: "layout-1", title: "Layout: single pane", icon: <Square size={15} />, keywords: "one 1 view", run: withClose(() => setLayout(1)) },
      { id: "layout-2", title: "Layout: two panes", icon: <Columns2 size={15} />, keywords: "split 2 side", run: withClose(() => setLayout(2)) },
      { id: "layout-3", title: "Layout: three panes", icon: <Columns3 size={15} />, keywords: "3 triple", run: withClose(() => setLayout(3)) },
      { id: "theme-light", title: "Theme: light", icon: <Sun size={15} />, keywords: "appearance day", run: withClose(() => setTheme("light")) },
      { id: "theme-dark", title: "Theme: dark", icon: <Moon size={15} />, keywords: "appearance night", run: withClose(() => setTheme("dark")) },
      { id: "theme-system", title: "Theme: system", icon: <Monitor size={15} />, keywords: "appearance auto", run: withClose(() => setTheme("system")) },
      { id: "toggle-sidebar", title: "Toggle library sidebar", icon: <PanelLeft size={15} />, keywords: "files explorer", run: withClose(toggleSidebar) },
      { id: "toggle-outline", title: "Toggle outline", icon: <PanelRight size={15} />, keywords: "toc contents headings", run: withClose(toggleOutline) },
      { id: "toggle-wrap", title: `Editor word wrap: ${settings.wrapEditor ? "on" : "off"}`, icon: <WrapText size={15} />, keywords: "lines", run: withClose(() => setWrapEditor(!settings.wrapEditor)) },
      { id: "font-up", title: "Increase reading size", icon: <Type size={15} />, keywords: "bigger font zoom", run: () => setFontScale(settings.fontScale + 0.1) },
      { id: "font-down", title: "Decrease reading size", icon: <TextCursorInput size={15} />, keywords: "smaller font zoom", run: () => setFontScale(settings.fontScale - 0.1) },
    ];
    if (activeDoc) {
      list.push(
        { id: "format", title: `Format source — ${activeDoc.name}`, icon: <Sparkles size={15} />, keywords: "prettify tidy clean", run: withClose(() => formatDoc(activeDoc.id)) },
        { id: "copy-md", title: `Copy markdown — ${activeDoc.name}`, icon: <FileText size={15} />, keywords: "clipboard", run: withClose(() => copyToClipboard(activeDoc.content)) },
        { id: "download-md", title: `Download .md — ${activeDoc.name}`, icon: <Download size={15} />, keywords: "save export", run: withClose(() => downloadText(/\.md$/i.test(activeDoc.name) ? activeDoc.name : `${activeDoc.name}.md`, activeDoc.content, "text/markdown")) },
      );
    }
    return list;
  };

  const commands = buildCommands();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <div className="animate-fade-in absolute inset-0 bg-ink/25" onClick={close} aria-hidden />
      <Command
        label="Command palette"
        className="pop-shadow animate-pop-in absolute left-1/2 top-[12vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-card border border-border bg-surface"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={16} className="text-faint" />
          <Command.Input
            autoFocus
            placeholder="Search documents or run a command…"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <Command.List className="max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-faint">No results found.</Command.Empty>

          <Command.Group heading="Documents" className={groupHeadingClasses}>
            {docOrder
              .map((id) => docs[id])
              .filter(Boolean)
              .map((d) => (
                <Command.Item
                  key={d.id}
                  value={`doc ${d.name}`}
                  onSelect={withClose(() => openDocInActivePane(d.id))}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-ink",
                    "aria-selected:bg-surface-hover aria-selected:text-ink",
                  )}
                >
                  <FileText size={15} className="text-faint" />
                  <span className="flex-1 truncate">{d.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDocInNewPane(d.id);
                      close();
                    }}
                    className="rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] text-faint hover:bg-surface hover:text-primary"
                    title="Open in new pane"
                  >
                    +pane
                  </button>
                </Command.Item>
              ))}
          </Command.Group>

          <Command.Group heading="Commands" className={groupHeadingClasses}>
            {commands.map((c) => (
              <Command.Item
                key={c.id}
                value={`${c.title} ${c.keywords ?? ""}`}
                onSelect={c.run}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-ink",
                  "aria-selected:bg-surface-hover aria-selected:text-ink",
                )}
              >
                <span className="text-faint">{c.icon}</span>
                <span className="flex-1 truncate">{c.title}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
