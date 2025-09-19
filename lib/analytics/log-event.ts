import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export async function logEvent(type: string, metadata: Record<string, unknown> = {}) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("events").insert({ type, metadata });
  } catch (error) {
    console.error("Failed to log event", error);
  }
}
