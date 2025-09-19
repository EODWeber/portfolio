"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const siteSettingsSchema = z.object({
  id: z.string().optional(),
  site_title: z.string().min(1),
  site_tagline: z.string().optional(),
  meta_description: z.string().optional(),
  primary_cta_label: z.string().optional(),
  primary_cta_url: z.string().optional(),
  secondary_cta_label: z.string().optional(),
  secondary_cta_url: z.string().optional(),
});

export async function upsertSiteSettings(formData: FormData) {
  await requireAdminUser();

  const payload = siteSettingsSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    site_title: formData.get("site_title")?.toString() ?? "",
    site_tagline: formData.get("site_tagline")?.toString() ?? "",
    meta_description: formData.get("meta_description")?.toString() ?? "",
    primary_cta_label: formData.get("primary_cta_label")?.toString() ?? "",
    primary_cta_url: formData.get("primary_cta_url")?.toString() ?? "",
    secondary_cta_label: formData.get("secondary_cta_label")?.toString() ?? "",
    secondary_cta_url: formData.get("secondary_cta_url")?.toString() ?? "",
  });

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("site_settings").upsert({
    id: payload.id,
    site_title: payload.site_title,
    site_tagline: payload.site_tagline,
    meta_description: payload.meta_description,
    primary_cta_label: payload.primary_cta_label,
    primary_cta_url: payload.primary_cta_url,
    secondary_cta_label: payload.secondary_cta_label,
    secondary_cta_url: payload.secondary_cta_url,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/site-settings");

  redirect("/admin/site-settings?status=success");
}
