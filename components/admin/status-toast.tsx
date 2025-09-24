"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function StatusToast() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = sp.get("status");
    if (!status) return;
    const what = sp.get("what");
    const file = sp.get("file");
    const message = sp.get("message");
    const textFor = (action: string) =>
      what ? `${action} ${what}${file ? ` (file: ${file})` : ""}.` : `${action}.`;

    if (status === "deleted") toast.success(textFor("Deleted"));
    else if (status === "success") toast.success(textFor("Saved"));
    else if (status === "imported") toast.success("Imported records.");
    else if (status === "error") toast.error(message || "An error occurred.");

    // Clean up the query params silently
    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    url.searchParams.delete("what");
    url.searchParams.delete("file");
    url.searchParams.delete("message");
    router.replace(url.pathname + (url.search ? url.search : ""));
  }, [sp, router]);

  return null;
}
