import { createClient } from "@supabase/supabase-js";

import { logEvent } from "@/lib/analytics/log-event";
import type { Vertical } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must be set for Supabase Storage operations.");
}

const SUPABASE_URL: string = supabaseUrl;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function createSignedResumeUrl(filePath: string, expiresInSeconds = 120) {
  if (!SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to create signed resume URLs.");
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(error?.message || "Unable to create signed resume URL");
  }

  await logEvent("resume_signed_url_created", { filePath });

  return data.signedUrl;
}

export async function getSignedResumeForVertical(vertical: Vertical, filePath: string) {
  const url = await createSignedResumeUrl(filePath, 120);
  await logEvent("resume_download_requested", { vertical, filePath });
  return url;
}
