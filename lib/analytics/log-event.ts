import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export async function logEvent(type: string, metadata: Record<string, unknown> = {}) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return;
    }
    const admin = createSupabaseAdminClient();
    await admin.from("events").insert({ type, metadata });
  } catch (error) {
    console.error("Failed to log event", error);
  }
}
