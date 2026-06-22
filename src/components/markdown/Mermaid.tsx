"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useWorkspace } from "@/lib/store";

/** Renders a Mermaid diagram from fenced ```mermaid source. Lazy-loads mermaid. */
export function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = "mmd-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const themeSetting = useWorkspace((s) => s.settings.theme);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "neutral",
          fontFamily: "var(--font-sans), sans-serif",
        });
        const { svg } = await mermaid.render(rawId, code.trim());
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not render diagram");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, rawId, themeSetting]);

  if (error) {
    return (
      <div className="my-4 rounded-card border border-danger/40 bg-surface-alt p-3 text-sm">
        <p className="mb-2 font-sans font-medium text-danger">Diagram error</p>
        <pre className="overflow-x-auto font-mono text-xs text-muted">{code}</pre>
      </div>
    );
  }

  return <div className="mermaid-block" ref={ref} role="img" aria-label="Mermaid diagram" />;
}
