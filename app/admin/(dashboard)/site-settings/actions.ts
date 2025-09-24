"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const siteSettingsSchema = z.object({
  id: z.string().optional(),
  site_title: z.string().optional(),
  site_tagline: z.string().optional(),
  meta_description: z.string().optional(),
  primary_cta_label: z.string().optional(),
  primary_cta_url: z.string().optional(),
  secondary_cta_label: z.string().optional(),
  secondary_cta_url: z.string().optional(),
  home_heading: z.string().optional(),
  home_subheading: z.string().optional(),
  home_projects_heading: z.string().optional(),
  home_projects_subheading: z.string().optional(),
  home_studies_heading: z.string().optional(),
  home_studies_subheading: z.string().optional(),
  home_articles_heading: z.string().optional(),
  home_articles_subheading: z.string().optional(),
  home_social_heading: z.string().optional(),
  home_social_subheading: z.string().optional(),
  portfolio_heading: z.string().optional(),
  portfolio_subheading: z.string().optional(),
  studies_heading: z.string().optional(),
  studies_subheading: z.string().optional(),
  articles_heading: z.string().optional(),
  articles_subheading: z.string().optional(),
  social_heading: z.string().optional(),
  social_subheading: z.string().optional(),
  contact_heading: z.string().optional(),
  contact_subheading: z.string().optional(),
});

export async function upsertSiteSettings(formData: FormData) {
  await requireAdminUser();

  const payload = siteSettingsSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    site_title: formData.get("site_title")?.toString() || undefined,
    site_tagline: formData.get("site_tagline")?.toString() || undefined,
    meta_description: formData.get("meta_description")?.toString() || undefined,
    primary_cta_label: formData.get("primary_cta_label")?.toString() || undefined,
    primary_cta_url: formData.get("primary_cta_url")?.toString() || undefined,
    secondary_cta_label: formData.get("secondary_cta_label")?.toString() || undefined,
    secondary_cta_url: formData.get("secondary_cta_url")?.toString() || undefined,
    home_heading: formData.get("home_heading")?.toString() ?? undefined,
    home_subheading: formData.get("home_subheading")?.toString() ?? undefined,
    home_projects_heading: formData.get("home_projects_heading")?.toString() ?? undefined,
    home_projects_subheading: formData.get("home_projects_subheading")?.toString() ?? undefined,
    home_studies_heading: formData.get("home_studies_heading")?.toString() ?? undefined,
    home_studies_subheading: formData.get("home_studies_subheading")?.toString() ?? undefined,
    home_articles_heading: formData.get("home_articles_heading")?.toString() ?? undefined,
    home_articles_subheading: formData.get("home_articles_subheading")?.toString() ?? undefined,
    home_social_heading: formData.get("home_social_heading")?.toString() ?? undefined,
    home_social_subheading: formData.get("home_social_subheading")?.toString() ?? undefined,
    portfolio_heading: formData.get("portfolio_heading")?.toString() ?? undefined,
    portfolio_subheading: formData.get("portfolio_subheading")?.toString() ?? undefined,
    studies_heading: formData.get("studies_heading")?.toString() ?? undefined,
    studies_subheading: formData.get("studies_subheading")?.toString() ?? undefined,
    articles_heading: formData.get("articles_heading")?.toString() ?? undefined,
    articles_subheading: formData.get("articles_subheading")?.toString() ?? undefined,
    social_heading: formData.get("social_heading")?.toString() ?? undefined,
    social_subheading: formData.get("social_subheading")?.toString() ?? undefined,
    contact_heading: formData.get("contact_heading")?.toString() ?? undefined,
    contact_subheading: formData.get("contact_subheading")?.toString() ?? undefined,
  });

  const admin = createSupabaseAdminClient();

  // Load existing row to avoid wiping fields not present in this submission
  const { data: existing } = await admin
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();

  const merged = {
    id: payload.id ?? existing?.id,
    site_title: payload.site_title || existing?.site_title || "",
    site_tagline: payload.site_tagline ?? existing?.site_tagline ?? null,
    meta_description: payload.meta_description ?? existing?.meta_description ?? null,
    primary_cta_label: payload.primary_cta_label ?? existing?.primary_cta_label ?? null,
    primary_cta_url: payload.primary_cta_url ?? existing?.primary_cta_url ?? null,
    secondary_cta_label: payload.secondary_cta_label ?? existing?.secondary_cta_label ?? null,
    secondary_cta_url: payload.secondary_cta_url ?? existing?.secondary_cta_url ?? null,
    home_heading: payload.home_heading ?? existing?.home_heading ?? null,
    home_subheading: payload.home_subheading ?? existing?.home_subheading ?? null,
    home_projects_heading: payload.home_projects_heading ?? existing?.home_projects_heading ?? null,
    home_projects_subheading:
      payload.home_projects_subheading ?? existing?.home_projects_subheading ?? null,
    home_studies_heading: payload.home_studies_heading ?? existing?.home_studies_heading ?? null,
    home_studies_subheading:
      payload.home_studies_subheading ?? existing?.home_studies_subheading ?? null,
    home_articles_heading: payload.home_articles_heading ?? existing?.home_articles_heading ?? null,
    home_articles_subheading:
      payload.home_articles_subheading ?? existing?.home_articles_subheading ?? null,
    home_social_heading: payload.home_social_heading ?? existing?.home_social_heading ?? null,
    home_social_subheading:
      payload.home_social_subheading ?? existing?.home_social_subheading ?? null,
    portfolio_heading: payload.portfolio_heading ?? existing?.portfolio_heading ?? null,
    portfolio_subheading: payload.portfolio_subheading ?? existing?.portfolio_subheading ?? null,
    studies_heading: payload.studies_heading ?? existing?.studies_heading ?? null,
    studies_subheading: payload.studies_subheading ?? existing?.studies_subheading ?? null,
    articles_heading: payload.articles_heading ?? existing?.articles_heading ?? null,
    articles_subheading: payload.articles_subheading ?? existing?.articles_subheading ?? null,
    social_heading: payload.social_heading ?? existing?.social_heading ?? null,
    social_subheading: payload.social_subheading ?? existing?.social_subheading ?? null,
    contact_heading: payload.contact_heading ?? existing?.contact_heading ?? null,
    contact_subheading: payload.contact_subheading ?? existing?.contact_subheading ?? null,
  };

  const { error } = await admin.from("site_settings").upsert(merged);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/site-settings");

  redirect("/admin/site-settings?status=success");
}
