"use client";

import type { TocItem } from "@/lib/types";
import { cn } from "@/lib/cn";

interface OutlineProps {
  items: TocItem[];
  activeId: string | null;
  onJump: (id: string) => void;
}

export function Outline({ items, activeId, onJump }: OutlineProps) {
  return (
    <nav
      aria-label="Document outline"
      className="hidden w-56 shrink-0 overflow-y-auto border-l border-border px-2 py-4 lg:block"
    >
      <p className="label-caps mb-2 px-2 text-[13px]">Outline</p>
      {items.length === 0 ? (
        <p className="px-2 text-xs text-faint">No headings yet.</p>
      ) : (
        <ul className="space-y-px">
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => onJump(it.id)}
                  style={{ paddingLeft: `${(it.level - 1) * 12 + 8}px` }}
                  className={cn(
                    "block w-full truncate border-l-2 py-1 pr-2 text-left text-[13px] leading-snug transition-colors",
                    active
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted hover:text-ink",
                  )}
                  title={it.text}
                >
                  {it.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
