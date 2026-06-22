"use client";

import { FilePlus2, FileText } from "lucide-react";
import { useWorkspace } from "@/lib/store";

export function EmptyPane() {
  const createDoc = useWorkspace((s) => s.createDoc);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <FileText size={28} className="text-faint" strokeWidth={1.5} />
      <p className="max-w-xs text-sm text-muted">
        This pane is empty. Choose a document from the library, or create a new one.
      </p>
      <button
        type="button"
        onClick={() => createDoc()}
        className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
      >
        <FilePlus2 size={15} />
        New document
      </button>
    </div>
  );
}
