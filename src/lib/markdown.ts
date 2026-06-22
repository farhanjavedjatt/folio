import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";
import remarkStringify from "remark-stringify";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { load as yamlLoad } from "js-yaml";
import type { PluggableList } from "unified";

/** Minimal hast-ish node shape used by the local callout transform. */
interface HNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HNode[];
}

const ALERT_RE = /^\s*\[!(note|tip|important|warning|caution)\]\s*/i;

/**
 * Turn GitHub-style alert blockquotes (`> [!NOTE]`) into styled callouts by
 * tagging the blockquote with a class and stripping the marker token. Runs on
 * already-sanitized hast, so it only ever sees trusted structure.
 */
function rehypeCallouts() {
  return (tree: HNode) => {
    const walk = (node: HNode) => {
      if (!node.children) return;
      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "blockquote") {
          applyCallout(child);
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

function applyCallout(blockquote: HNode) {
  const firstPara = blockquote.children?.find(
    (c) => c.type === "element" && c.tagName === "p",
  );
  const firstText = firstPara?.children?.[0];
  if (!firstText || firstText.type !== "text" || typeof firstText.value !== "string") return;
  const match = firstText.value.match(ALERT_RE);
  if (!match) return;

  const kind = match[1].toLowerCase();
  blockquote.properties = {
    ...(blockquote.properties ?? {}),
    className: ["callout", `callout-${kind}`],
    "data-callout": kind,
  };
  // Drop the "[!NOTE]" token and a following newline so only the body remains.
  firstText.value = firstText.value.slice(match[0].length).replace(/^\r?\n/, "");
}

/** Extended sanitize schema: keep classes/ids so math, highlight, slugs work. */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "details", "summary", "section", "span", "div",
    "kbd", "mark", "sub", "sup", "abbr", "figure", "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className", "id", "align",
    ],
    abbr: ["title"],
    input: ["type", "checked", "disabled"],
  },
};

export const remarkPlugins: PluggableList = [remarkGfm, remarkMath, remarkGemoji];

export const rehypePlugins: PluggableList = [
  // 1. Parse raw HTML the user typed into real nodes.
  rehypeRaw,
  // 2. Sanitize ALL user-authored structure before any trusted transform.
  [rehypeSanitize, sanitizeSchema],
  // 3. Trusted transforms below run on clean, library-generated markup.
  rehypeCallouts,
  [rehypeKatex, { throwOnError: false, errorColor: "var(--danger)" }],
  [rehypeHighlight, { detect: false, ignoreMissing: true, plainText: ["mermaid", "text", "txt"] }],
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Permalink to this section", tabIndex: -1 },
      content: { type: "element", tagName: "span", properties: { className: ["heading-anchor-icon"], "aria-hidden": "true" }, children: [{ type: "text", value: "#" }] },
    },
  ],
];

export interface FrontMatter {
  data: Record<string, unknown>;
  body: string;
  /** The raw `---\n…\n---` block, or "" when absent. */
  raw: string;
}

const FM_RE = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;

/** Split YAML front matter from the markdown body. Tolerant of malformed YAML. */
export function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(FM_RE);
  if (!match) return { data: {}, body: content, raw: "" };
  let data: Record<string, unknown> = {};
  try {
    const parsed = yamlLoad(match[1]);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    // Malformed front matter is treated as having no parseable data.
  }
  return { data, body: content.slice(match[0].length), raw: match[0] };
}

/**
 * Normalize ("prettify") markdown source: consistent bullets, fences, spacing.
 * Front matter is preserved verbatim and re-attached.
 */
export async function formatMarkdown(content: string): Promise<string> {
  const { raw, body } = parseFrontMatter(content);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "_",
      strong: "*",
      fence: "`",
      fences: true,
      listItemIndent: "one",
      rule: "-",
      ruleRepetition: 3,
      tightDefinitions: true,
      resourceLink: false,
    })
    .process(body);

  const formattedBody = String(file).replace(/\n+$/, "") + "\n";
  return raw ? `${raw.trimEnd()}\n\n${formattedBody}` : formattedBody;
}

/** First H1 / front-matter title, used as a sidebar subtitle. */
export function deriveTitle(content: string): string | null {
  const { data, body } = parseFrontMatter(content);
  if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
  const h1 = body.match(/^#\s+(.+?)\s*#*\s*$/m);
  return h1 ? h1[1].trim() : null;
}
