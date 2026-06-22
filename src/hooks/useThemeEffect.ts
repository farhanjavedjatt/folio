"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/lib/store";

/** Keeps the <html> `dark` class and reading font-scale in sync with settings. */
export function useThemeEffect() {
  const theme = useWorkspace((s) => s.settings.theme);
  const fontScale = useWorkspace((s) => s.settings.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [fontScale]);
}
