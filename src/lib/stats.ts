// Pure, framework-agnostic document statistics.

export interface DocStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  /** Rounded-up reading time in minutes (min 1 when there is any prose). */
  readingTimeMinutes: number;
  headings: number;
}

const WORDS_PER_MINUTE = 225;

/**
 * Remove fenced code blocks and inline code so reading-time and word counts
 * reflect prose rather than source listings.
 */
function stripCode(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ");
}

function countWords(text: string): number {
  const matches = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

export function computeStats(markdown: string): DocStats {
  const characters = markdown.length;
  const charactersNoSpaces = markdown.replace(/\s/g, "").length;
  const lines = markdown.length === 0 ? 0 : markdown.split(/\r\n|\r|\n/).length;
  const headings = (markdown.match(/^#{1,6}\s+\S/gm) ?? []).length;

  const prose = stripCode(markdown);
  const words = countWords(prose);
  const readingTimeMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return { words, characters, charactersNoSpaces, lines, readingTimeMinutes, headings };
}

/** "3 min read" / "< 1 min read" style label. */
export function readingTimeLabel(stats: DocStats): string {
  if (stats.words === 0) return "Empty";
  return `${stats.readingTimeMinutes} min read`;
}
