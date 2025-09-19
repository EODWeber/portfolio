import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
