"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { useWorkspace } from "@/lib/store";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-code-bg" aria-hidden />,
});

// Colors reference CSS variables, so the editor adapts to light/dark for free.
const folioTheme = EditorView.theme({
  "&": { color: "var(--ink)", backgroundColor: "var(--code-bg)", height: "100%" },
  ".cm-content": { fontFamily: "var(--font-mono)", caretColor: "var(--primary)", padding: "12px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--primary)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":
    { backgroundColor: "var(--selection)" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--surface-hover) 45%, transparent)" },
  ".cm-gutters": { backgroundColor: "var(--code-bg)", color: "var(--faint)", border: "none" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--muted)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 14px", minWidth: "2.5ch" },
  ".cm-scroller": { lineHeight: "1.6" },
});

const folioHighlight = HighlightStyle.define([
  { tag: t.heading, color: "var(--primary)", fontWeight: "600" },
  { tag: t.strong, fontWeight: "700", color: "var(--ink)" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.link, color: "var(--primary)" },
  { tag: t.url, color: "var(--code-str)" },
  { tag: t.monospace, color: "var(--code-num)" },
  { tag: t.quote, color: "var(--muted)", fontStyle: "italic" },
  { tag: t.list, color: "var(--code-num)" },
  { tag: t.comment, color: "var(--code-com)", fontStyle: "italic" },
  { tag: t.meta, color: "var(--code-com)" },
  { tag: t.keyword, color: "var(--code-kw)" },
  { tag: t.string, color: "var(--code-str)" },
  { tag: t.number, color: "var(--code-num)" },
  { tag: t.processingInstruction, color: "var(--faint)" },
]);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const wrap = useWorkspace((s) => s.settings.wrapEditor);

  const extensions = useMemo(() => {
    const exts = [
      markdown({ base: markdownLanguage, codeLanguages: [] }),
      folioTheme,
      Prec.highest(syntaxHighlighting(folioHighlight)),
    ];
    if (wrap) exts.push(EditorView.lineWrapping);
    return exts;
  }, [wrap]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme="none"
      height="100%"
      style={{ height: "100%", fontSize: "13.5px" }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: false,
        bracketMatching: false,
        closeBrackets: false,
        autocompletion: false,
        highlightSelectionMatches: false,
        syntaxHighlighting: false,
        searchKeymap: true,
        tabSize: 2,
      }}
    />
  );
}
