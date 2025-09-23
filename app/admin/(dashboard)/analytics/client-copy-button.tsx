"use client";

import { useState } from "react";

export function ClientCopyButton({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy to clipboard", error);
    }
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {copied ? "Copied!" : (children ?? "Copy")}
    </button>
  );
}
