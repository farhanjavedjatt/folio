"use client";

import {
  Columns2,
  Columns3,
  Monitor,
  Moon,
  PanelLeft,
  PanelRight,
  Search,
  Square,
  Sun,
} from "lucide-react";
import { useWorkspace } from "@/lib/store";
import type { ThemeSetting } from "@/lib/types";
import { IconButton } from "@/components/ui/IconButton";
import { Segmented } from "@/components/ui/Segmented";

const THEME_CYCLE: Record<ThemeSetting, ThemeSetting> = {
  system: "light",
  light: "dark",
  dark: "system",
};

interface TopBarProps {
  onOpenPalette: () => void;
}

export function TopBar({ onOpenPalette }: TopBarProps) {
  const sidebarOpen = useWorkspace((s) => s.settings.sidebarOpen);
  const outlineOpen = useWorkspace((s) => s.settings.outlineOpen);
  const theme = useWorkspace((s) => s.settings.theme);
  const paneCount = useWorkspace((s) => s.panes.length);
  const toggleSidebar = useWorkspace((s) => s.toggleSidebar);
  const toggleOutline = useWorkspace((s) => s.toggleOutline);
  const setTheme = useWorkspace((s) => s.setTheme);
  const setLayout = useWorkspace((s) => s.setLayout);

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border-strong bg-surface-alt px-2 sm:px-3">
      <IconButton label={sidebarOpen ? "Hide library" : "Show library"} active={sidebarOpen} onClick={toggleSidebar}>
        <PanelLeft size={17} />
      </IconButton>

      <span className="select-none px-1 font-serif text-lg tracking-tight text-ink" style={{ fontVariant: "small-caps" }}>
        Folio
      </span>

      {/* Command trigger */}
      <button
        type="button"
        onClick={onOpenPalette}
        className="mx-auto hidden h-8 w-full max-w-md items-center gap-2 rounded-pill border border-border bg-surface px-3 text-sm text-faint transition-colors hover:border-border-strong hover:text-muted sm:flex"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search documents, run command…</span>
        <kbd className="rounded-[4px] border border-border bg-surface-alt px-1.5 font-mono text-[11px]">⌘K</kbd>
      </button>

      {/* Mobile command trigger */}
      <IconButton label="Search & commands" onClick={onOpenPalette} className="ml-auto sm:hidden">
        <Search size={17} />
      </IconButton>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
        <Segmented
          ariaLabel="Layout — number of panes"
          value={String(Math.min(3, paneCount))}
          onChange={(v) => setLayout(Number(v))}
          options={[
            { value: "1", label: "Single pane", icon: <Square size={14} /> },
            { value: "2", label: "Two panes", icon: <Columns2 size={14} /> },
            { value: "3", label: "Three panes", icon: <Columns3 size={14} /> },
          ]}
        />
        <IconButton label={outlineOpen ? "Hide outline" : "Show outline"} active={outlineOpen} onClick={toggleOutline}>
          <PanelRight size={17} />
        </IconButton>
        <IconButton
          label={`Theme: ${theme} (click to change)`}
          onClick={() => setTheme(THEME_CYCLE[theme])}
        >
          <ThemeIcon size={17} />
        </IconButton>
      </div>
    </header>
  );
}
