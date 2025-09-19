"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { parseHighlights } from "@/lib/admin/utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const profileSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  summary: z.string().optional(),
  avatar_url: z.string().optional(),
  location: z.string().optional(),
  hiring_status: z.string().optional(),
  resume_preference: z.enum(["ai-security", "secure-devops", "soc"]),
  highlights: z.string().optional(),
});

export async function upsertSiteProfile(formData: FormData) {
  await requireAdminUser();

  const payload = profileSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    full_name: formData.get("full_name")?.toString() ?? "",
    headline: formData.get("headline")?.toString() ?? "",
    subheadline: formData.get("subheadline")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    avatar_url: formData.get("avatar_url")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    hiring_status: formData.get("hiring_status")?.toString() ?? "",
    resume_preference: (formData.get("resume_preference")?.toString() ?? "ai-security") as
      | "ai-security"
      | "secure-devops"
      | "soc",
    highlights: formData.get("highlights")?.toString() ?? "",
  });

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("site_profile").upsert({
    id: payload.id,
    full_name: payload.full_name,
    headline: payload.headline,
    subheadline: payload.subheadline,
    summary: payload.summary,
    avatar_url: payload.avatar_url,
    location: payload.location,
    hiring_status: payload.hiring_status,
    resume_preference: payload.resume_preference,
    highlights: parseHighlights(payload.highlights ?? ""),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/resume");
  revalidatePath("/admin/site-profile");

  redirect("/admin/site-profile?status=success");
}
