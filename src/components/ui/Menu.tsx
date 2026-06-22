"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Optional right-aligned hint, e.g. a shortcut. */
  hint?: string;
}

export type MenuEntry = MenuItem | "separator";

interface MenuProps {
  trigger: (args: { open: boolean; toggle: () => void }) => ReactNode;
  items: (MenuItem | "separator")[];
  align?: "left" | "right";
  width?: number;
  ariaLabel?: string;
}

export function Menu({ trigger, items, align = "right", width = 200, ariaLabel }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Focus the first item on open; return focus to the trigger on close.
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const first = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
      first?.focus();
    } else {
      openerRef.current?.focus?.();
    }
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const list = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    if (list.length === 0) return;
    const current = list.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % list.length;
    else if (e.key === "ArrowUp") next = current < 0 ? list.length - 1 : (current - 1 + list.length) % list.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = list.length - 1;
    if (next < 0) return;
    e.preventDefault();
    list[next].focus();
  };

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={onMenuKeyDown}
          style={{ width }}
          className={cn(
            "pop-shadow animate-pop-in absolute z-50 mt-1 origin-top overflow-hidden rounded-card border border-border bg-surface py-1",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) =>
            item === "separator" ? (
              <div key={`sep-${i}`} className="my-1 border-t border-border" />
            ) : (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors",
                  "disabled:opacity-40 disabled:pointer-events-none",
                  item.tone === "danger"
                    ? "text-danger hover:bg-surface-hover"
                    : "text-ink hover:bg-surface-hover",
                )}
              >
                {item.icon && <span className="text-faint">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint && <span className="font-mono text-[11px] text-faint">{item.hint}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
