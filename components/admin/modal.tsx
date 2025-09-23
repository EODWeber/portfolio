"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
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
      <div className="bg-background/80 absolute inset-0 backdrop-blur" />
      <div className="bg-background relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border shadow-xl">
        {title ? <div className="border-b px-4 py-3 text-lg font-semibold">{title}</div> : null}
        <div className="scrollbar-thin grow overflow-auto p-4">{children}</div>
        <div className="bg-muted/30 text-muted-foreground border-t px-4 py-2 text-xs">
          Press Esc to close
        </div>
      </div>
    </div>
  );
}

export default Modal;
