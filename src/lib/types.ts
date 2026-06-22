// Core domain types for the MD Formatter workspace.

/** How a single pane renders its document. */
export type ViewMode = "preview" | "edit" | "split";

/** Theme preference. "system" follows the OS setting. */
export type ThemeSetting = "light" | "dark" | "system";

/** A markdown document held in the workspace. */
export interface MdDocument {
  id: string;
  /** Display name, e.g. "README.md". */
  name: string;
  /** Raw markdown source. */
  content: string;
  createdAt: number;
  updatedAt: number;
  /** Pinned documents sort to the top of the explorer. */
  pinned?: boolean;
}

/** One viewport in the workspace grid. */
export interface Pane {
  id: string;
  /** The document shown in this pane, or null when empty. */
  docId: string | null;
  mode: ViewMode;
}

export interface Settings {
  theme: ThemeSetting;
  /** File-explorer sidebar visibility. */
  sidebarOpen: boolean;
  /** Table-of-contents outline visibility. */
  outlineOpen: boolean;
  /** Soft-wrap long lines in the editor. */
  wrapEditor: boolean;
  /** Reading font scale multiplier (1 = default). */
  fontScale: number;
}

/** A heading extracted from rendered markdown, used for the outline. */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}
