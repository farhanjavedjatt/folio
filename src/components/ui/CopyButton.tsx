"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  text: string;
  label?: string;
  /** Show the "Copy"/"Copied" word next to the icon. */
  withText?: boolean;
  className?: string;
}

export function CopyButton({ text, label = "Copy", withText = true, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without clipboard permissions.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control px-1.5 py-1 text-[11px] font-medium font-sans transition-colors",
        copied ? "text-success" : "text-faint hover:text-ink",
        className,
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {withText && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
