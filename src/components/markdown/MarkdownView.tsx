"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown";
import { Pre } from "./CodeBlock";

const components: Components = {
  pre: Pre,
  // GFM task-list checkboxes: always controlled + read-only so reusing the
  // element across documents never flips uncontrolled→controlled.
  input: ({ node: _node, type, checked, ...rest }) =>
    type === "checkbox" ? (
      <input type="checkbox" {...rest} checked={!!checked} readOnly disabled />
    ) : (
      <input type={type} {...rest} />
    ),
  // Wrap tables so wide ones scroll inside their own container.
  table: ({ node: _node, children, ...rest }) => (
    <div className="table-scroll">
      <table {...rest}>{children}</table>
    </div>
  ),
  // External links open in a new tab, safely.
  a: ({ node: _node, href, children, ...rest }) => {
    const external = !!href && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
};

interface MarkdownViewProps {
  content: string;
  className?: string;
}

function MarkdownViewImpl({ content, className }: MarkdownViewProps) {
  return (
    <div className={`folio-prose ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const MarkdownView = memo(MarkdownViewImpl);
