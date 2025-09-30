"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { loginSchema } from "./schema";

export type LoginState = {
  error?: string;
};

export async function signInAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createSupabaseServerClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues
      .map((issue) => issue.message)
      .filter(Boolean)
      .join("\n");

    return { error: errorMessage || "Invalid credentials." };
  }

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/login");

  redirect("/admin");
}
