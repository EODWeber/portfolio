"use client";

import { useEffect } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
        {title ? <div className="border-b px-4 py-3 text-lg font-semibold">{title}</div> : null}
        <div className="scrollbar-thin grow overflow-auto p-4">{children}</div>
        <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">Press Esc to close</div>
      </div>
    </div>
  );
}
