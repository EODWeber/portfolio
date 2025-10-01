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
  hero_heading: z.string().optional(),
  hero_subheading: z.string().optional(),
  hiring_status: z.string().optional(),
  location: z.string().optional(),
  resume_preference: z.enum(["ai-security", "secure-devops", "soc"]).optional(),
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

  const getOptionalString = (key: string): string | undefined => {
    if (!formData.has(key)) {
      return undefined;
    }

    const value = formData.get(key);

    if (value == null) {
      return undefined;
    }

    if (typeof value === "string") {
      return value;
    }

    return value.toString();
  };

  const formId = getOptionalString("id");
  const resumePreference = getOptionalString("resume_preference");

  const payload = siteSettingsSchema.parse({
    id: formId && formId.trim() !== "" ? formId : undefined,
    site_title: getOptionalString("site_title"),
    site_tagline: getOptionalString("site_tagline"),
    meta_description: getOptionalString("meta_description"),
    // Home hero & availability + CTAs (Home tab)
    hero_heading: getOptionalString("hero_heading"),
    hero_subheading: getOptionalString("hero_subheading"),
    hiring_status: getOptionalString("hiring_status"),
    location: getOptionalString("location"),
    resume_preference: resumePreference as
      | "ai-security"
      | "secure-devops"
      | "soc"
      | undefined,
    primary_cta_label: getOptionalString("primary_cta_label"),
    primary_cta_url: getOptionalString("primary_cta_url"),
    secondary_cta_label: getOptionalString("secondary_cta_label"),
    secondary_cta_url: getOptionalString("secondary_cta_url"),
    // Headings/subheadings across sections
    home_heading: getOptionalString("home_heading"),
    home_subheading: getOptionalString("home_subheading"),
    home_projects_heading: getOptionalString("home_projects_heading"),
    home_projects_subheading: getOptionalString("home_projects_subheading"),
    home_studies_heading: getOptionalString("home_studies_heading"),
    home_studies_subheading: getOptionalString("home_studies_subheading"),
    home_articles_heading: getOptionalString("home_articles_heading"),
    home_articles_subheading: getOptionalString("home_articles_subheading"),
    home_social_heading: getOptionalString("home_social_heading"),
    home_social_subheading: getOptionalString("home_social_subheading"),
    portfolio_heading: getOptionalString("portfolio_heading"),
    portfolio_subheading: getOptionalString("portfolio_subheading"),
    studies_heading: getOptionalString("studies_heading"),
    studies_subheading: getOptionalString("studies_subheading"),
    articles_heading: getOptionalString("articles_heading"),
    articles_subheading: getOptionalString("articles_subheading"),
    social_heading: getOptionalString("social_heading"),
    social_subheading: getOptionalString("social_subheading"),
    contact_heading: getOptionalString("contact_heading"),
    contact_subheading: getOptionalString("contact_subheading"),
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
    hero_heading: payload.hero_heading ?? existing?.hero_heading ?? null,
    hero_subheading: payload.hero_subheading ?? existing?.hero_subheading ?? null,
    hiring_status: payload.hiring_status ?? existing?.hiring_status ?? null,
    location: payload.location ?? existing?.location ?? null,
    resume_preference:
      payload.resume_preference ??
      (existing?.resume_preference as unknown as typeof payload.resume_preference) ??
      null,
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
