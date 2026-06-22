"use client";

import { type ReactNode, isValidElement } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Mermaid } from "./Mermaid";

/** Recursively extract plain text from a React node tree (for copying). */
export function nodeToString(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join("");
  if (isValidElement(node)) {
    return nodeToString((node.props as { children?: ReactNode }).children);
  }
  return "";
}

interface PreProps {
  children?: ReactNode;
}

/**
 * Replacement for the `<pre>` element produced by react-markdown. Adds a header
 * with the language label and a copy button, and routes ```mermaid blocks to
 * the diagram renderer.
 */
export function Pre({ children }: PreProps) {
  const codeEl = Array.isArray(children) ? children[0] : children;
  const className = isValidElement(codeEl)
    ? ((codeEl.props as { className?: string }).className ?? "")
    : "";
  const language = /language-([\w-]+)/.exec(className)?.[1];
  const raw = nodeToString(
    isValidElement(codeEl) ? (codeEl.props as { children?: ReactNode }).children : children,
  ).replace(/\n$/, "");

  if (language === "mermaid") {
    return <Mermaid code={raw} />;
  }

  return (
    <div className="my-4 overflow-hidden rounded-card border border-border bg-code-bg">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1 select-none">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
          {language || "text"}
        </span>
        <CopyButton text={raw} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-ink">{children}</pre>
    </div>
  );
}
