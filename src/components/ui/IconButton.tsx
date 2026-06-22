"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label + tooltip text. */
  label: string;
  active?: boolean;
  size?: "sm" | "md";
  tone?: "default" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, active = false, size = "md", tone = "default", className, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center justify-center rounded-control transition-colors",
          "text-muted hover:text-ink hover:bg-surface-hover",
          "focus-visible:text-ink disabled:opacity-40 disabled:pointer-events-none",
          size === "md" ? "h-8 w-8" : "h-7 w-7",
          active && "bg-surface-hover text-primary",
          tone === "danger" && "hover:text-danger",
          className,
        )}
        {...rest}
      />
    );
  },
);
