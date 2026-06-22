import type { TocItem } from "./types";

/**
 * Build a table of contents from rendered markdown by reading the heading
 * elements (which carry ids from rehype-slug). DOM-based so it always matches
 * exactly what the reader sees.
 */
export function buildTocFromElement(root: HTMLElement | null): TocItem[] {
  if (!root) return [];
  const headings = root.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4, h5, h6");
  const items: TocItem[] = [];
  headings.forEach((h) => {
    const id = h.id;
    const text = headingText(h);
    if (!id || !text) return;
    items.push({ id, text, level: Number(h.tagName.slice(1)) });
  });
  return normalizeLevels(items);
}

/** Heading text excluding the appended permalink anchor (e.g. its trailing "#"). */
function headingText(h: HTMLHeadingElement): string {
  let text = "";
  h.childNodes.forEach((node) => {
    if (
      node.nodeType === 1 &&
      (node as HTMLElement).classList?.contains("heading-anchor")
    ) {
      return;
    }
    text += node.textContent ?? "";
  });
  return text.trim();
}

/**
 * Collapse heading levels so the outline never jumps (e.g. an H1 followed by an
 * H4 renders as two adjacent tiers, not a four-deep indent).
 */
function normalizeLevels(items: TocItem[]): TocItem[] {
  if (items.length === 0) return items;
  const present = Array.from(new Set(items.map((i) => i.level))).sort((a, b) => a - b);
  const rank = new Map(present.map((lvl, i) => [lvl, i + 1]));
  return items.map((i) => ({ ...i, level: rank.get(i.level) ?? i.level }));
}
