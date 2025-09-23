import { Buffer } from "node:buffer";
import type { Vertical } from "@/lib/supabase/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { logEvent } from "@/lib/analytics/log-event";

export async function readStorageText(
  blob: Blob | null,
): Promise<{ text: string | null; error: string | null }> {
  if (!blob) {
    return { text: null, error: "Storage object returned no data" };
  }

  try {
    if (typeof blob.text === "function") {
      const text = await blob.text();
      return { text, error: null };
    }

    if ("arrayBuffer" in blob && typeof blob.arrayBuffer === "function") {
      const buffer = Buffer.from(await blob.arrayBuffer());
      return { text: buffer.toString("utf8"), error: null };
    }
  } catch (err) {
    return {
      text: null,
      error: err instanceof Error ? err.message : "Failed to read storage object",
    };
  }

  return { text: null, error: "Unsupported storage response" };
}

// Generate a short-lived signed URL for a resume PDF stored in the 'resumes' bucket
export async function createSignedResumeUrl(
  filePath: string,
  expiresInSeconds = 120,
): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin credentials missing for signed URL generation");
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from("resumes")
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(error?.message || "Unable to create signed resume URL");
  }

  await logEvent("resume_signed_url_created", { filePath });
  return data.signedUrl;
}

// Convenience wrapper used by the resume download route
export async function getSignedResumeForVertical(
  vertical: Vertical,
  filePath: string,
): Promise<string> {
  const url = await createSignedResumeUrl(filePath, 120);
  await logEvent("resume_download_requested", { vertical, filePath });
  return url;
}
