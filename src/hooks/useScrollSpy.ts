"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Track which heading is currently at the top of a scroll container, so the
 * outline can highlight the active section. Re-binds when `signal` changes
 * (e.g. document content or pane layout).
 */
export function useScrollSpy(
  containerRef: RefObject<HTMLElement | null>,
  signal: unknown,
): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const heads = Array.from(
        el.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
      ).filter((h) => h.id);
      if (heads.length === 0) {
        setActive(null);
        return;
      }
      const top = el.getBoundingClientRect().top;
      let current = heads[0].id;
      for (const h of heads) {
        if (h.getBoundingClientRect().top - top <= 88) current = h.id;
        else break;
      }
      setActive(current);
    };

    compute();
    el.addEventListener("scroll", compute, { passive: true });
    return () => el.removeEventListener("scroll", compute);
  }, [containerRef, signal]);

  return active;
}
