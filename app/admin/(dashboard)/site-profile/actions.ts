"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const profileSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  summary: z.string().optional(),
  philosophy: z.string().optional(),
  avatar_url: z.string().optional(),
  location: z.string().optional(),
  hiring_status: z.string().optional(),
  resume_preference: z.enum(["ai-security", "secure-devops", "soc"]),
  pronouns: z.string().optional(),
  phonetic_name: z.string().optional(),
  cta_primary_label: z.string().optional(),
  cta_primary_url: z.string().optional(),
  cta_secondary_label: z.string().optional(),
  cta_secondary_url: z.string().optional(),
  career_cta_label: z.string().optional(),
  career_cta_url: z.string().optional(),
  tech_skills_title: z.string().optional(),
  tech_skills_subtitle: z.string().optional(),
});

const orderField = z.coerce.number().int().min(0).optional();

const pillarSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon_slug: z.string().optional(),
  link_label: z.string().optional(),
  link_url: z.string().optional(),
  order_index: orderField,
});

const careerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  link_label: z.string().optional(),
  link_url: z.string().optional(),
  order_index: orderField,
});

const speakingSchema = z.object({
  id: z.string().optional(),
  event: z.string().min(1),
  title: z.string().optional(),
  year: z.string().optional(),
  link_url: z.string().optional(),
  order_index: orderField,
});

const recognitionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  issuer: z.string().optional(),
  year: z.string().optional(),
  link_url: z.string().optional(),
  order_index: orderField,
});

const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1),
  attribution: z.string().min(1),
  role: z.string().optional(),
  link_url: z.string().optional(),
  order_index: orderField,
});

const personalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon_slug: z.string().optional(),
  order_index: orderField,
});

const technicalSkillSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  skills: z.string().min(1), // comma-separated string that will be parsed to array
  order_index: orderField,
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function cleanText(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function orderValue(value: number | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function revalidateProfile() {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin/site-profile");
}

export async function upsertSiteProfile(formData: FormData) {
  await requireAdminUser();

  const payload = profileSchema.parse({
    id: getString(formData, "id"),
    full_name: getString(formData, "full_name") ?? "",
    headline: getString(formData, "headline") ?? "",
    subheadline: getString(formData, "subheadline"),
    summary: getString(formData, "summary"),
    philosophy: getString(formData, "philosophy"),
    avatar_url: getString(formData, "avatar_url"),
    location: getString(formData, "location"),
    hiring_status: getString(formData, "hiring_status"),
    resume_preference: (getString(formData, "resume_preference") ?? "ai-security") as
      | "ai-security"
      | "secure-devops"
      | "soc",
    pronouns: getString(formData, "pronouns"),
    phonetic_name: getString(formData, "phonetic_name"),
    cta_primary_label: getString(formData, "cta_primary_label"),
    cta_primary_url: getString(formData, "cta_primary_url"),
    cta_secondary_label: getString(formData, "cta_secondary_label"),
    cta_secondary_url: getString(formData, "cta_secondary_url"),
    career_cta_label: getString(formData, "career_cta_label"),
    career_cta_url: getString(formData, "career_cta_url"),
    tech_skills_title: getString(formData, "tech_skills_title"),
    tech_skills_subtitle: getString(formData, "tech_skills_subtitle"),
  });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_profile").upsert({
    id: payload.id,
    full_name: payload.full_name,
    headline: payload.headline,
    subheadline: cleanText(payload.subheadline),
    summary: cleanText(payload.summary),
    philosophy: cleanText(payload.philosophy),
    avatar_url: cleanText(payload.avatar_url),
    location: cleanText(payload.location),
    hiring_status: cleanText(payload.hiring_status),
    resume_preference: payload.resume_preference,
    pronouns: cleanText(payload.pronouns),
    phonetic_name: cleanText(payload.phonetic_name),
    cta_primary_label: cleanText(payload.cta_primary_label),
    cta_primary_url: cleanText(payload.cta_primary_url),
    cta_secondary_label: cleanText(payload.cta_secondary_label),
    cta_secondary_url: cleanText(payload.cta_secondary_url),
    career_cta_label: cleanText(payload.career_cta_label),
    career_cta_url: cleanText(payload.career_cta_url),
    tech_skills_title: cleanText(payload.tech_skills_title),
    tech_skills_subtitle: cleanText(payload.tech_skills_subtitle),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateProfile();
  redirect("/admin/site-profile?status=profile-saved");
}

async function upsertRow<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
  table: string,
  status: string,
  mapper: (payload: z.infer<T>) => Record<string, unknown>,
) {
  await requireAdminUser();
  const rawInput: Record<string, unknown> = {
    id: getString(formData, "id"),
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    icon_slug: getString(formData, "icon_slug"),
    link_label: getString(formData, "link_label"),
    link_url: getString(formData, "link_url"),
    event: getString(formData, "event"),
    year: getString(formData, "year"),
    quote: getString(formData, "quote"),
    attribution: getString(formData, "attribution"),
    role: getString(formData, "role"),
    issuer: getString(formData, "issuer"),
    order_index: getString(formData, "order_index") ?? "0",
  };
  const payload = schema.parse(rawInput);

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from(table).upsert(mapper(payload));

  if (error) {
    throw new Error(error.message);
  }

  revalidateProfile();
  redirect(`/admin/site-profile?status=${status}`);
}

async function deleteRow(formData: FormData, table: string, status: string, labelKey = "title") {
  await requireAdminUser();
  const id = getString(formData, "id");
  if (!id) {
    throw new Error("Missing id");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from(table).delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidateProfile();
  const params = new URLSearchParams({ status });
  const label = getString(formData, labelKey);
  if (label) params.set("what", label);
  redirect(`/admin/site-profile?${params.toString()}`);
}

export async function upsertProfilePillar(formData: FormData) {
  return upsertRow(formData, pillarSchema, "profile_pillars", "pillar-saved", (payload) => ({
    id: payload.id,
    title: payload.title,
    description: payload.description,
    icon_slug: cleanText(payload.icon_slug),
    link_label: cleanText(payload.link_label),
    link_url: cleanText(payload.link_url),
    order_index: orderValue(payload.order_index, 0),
  }));
}

export async function deleteProfilePillar(formData: FormData) {
  return deleteRow(formData, "profile_pillars", "pillar-deleted");
}

export async function upsertProfileCareerHighlight(formData: FormData) {
  return upsertRow(
    formData,
    careerSchema,
    "profile_career_highlights",
    "career-saved",
    (payload) => ({
      id: payload.id,
      title: payload.title,
      description: payload.description,
      link_label: cleanText(payload.link_label),
      link_url: cleanText(payload.link_url),
      order_index: orderValue(payload.order_index, 0),
    }),
  );
}

export async function deleteProfileCareerHighlight(formData: FormData) {
  return deleteRow(formData, "profile_career_highlights", "career-deleted");
}

export async function upsertProfileSpeaking(formData: FormData) {
  return upsertRow(
    formData,
    speakingSchema,
    "profile_speaking_engagements",
    "speaking-saved",
    (payload) => ({
      id: payload.id,
      event: payload.event,
      title: cleanText(payload.title),
      year: cleanText(payload.year),
      link_url: cleanText(payload.link_url),
      order_index: orderValue(payload.order_index, 0),
    }),
  );
}

export async function deleteProfileSpeaking(formData: FormData) {
  return deleteRow(formData, "profile_speaking_engagements", "speaking-deleted", "event");
}

export async function upsertProfileRecognition(formData: FormData) {
  return upsertRow(
    formData,
    recognitionSchema,
    "profile_recognitions",
    "recognition-saved",
    (payload) => ({
      id: payload.id,
      title: payload.title,
      issuer: cleanText(payload.issuer),
      year: cleanText(payload.year),
      link_url: cleanText(payload.link_url),
      order_index: orderValue(payload.order_index, 0),
    }),
  );
}

export async function deleteProfileRecognition(formData: FormData) {
  return deleteRow(formData, "profile_recognitions", "recognition-deleted");
}

export async function upsertProfileTestimonial(formData: FormData) {
  return upsertRow(
    formData,
    testimonialSchema,
    "profile_testimonials",
    "testimonial-saved",
    (payload) => ({
      id: payload.id,
      quote: payload.quote,
      attribution: payload.attribution,
      role: cleanText(payload.role),
      link_url: cleanText(payload.link_url),
      order_index: orderValue(payload.order_index, 0),
    }),
  );
}

export async function deleteProfileTestimonial(formData: FormData) {
  return deleteRow(formData, "profile_testimonials", "testimonial-deleted", "attribution");
}

export async function upsertProfilePersonalEntry(formData: FormData) {
  return upsertRow(
    formData,
    personalSchema,
    "profile_personal_entries",
    "personal-saved",
    (payload) => ({
      id: payload.id,
      title: payload.title,
      description: payload.description,
      icon_slug: cleanText(payload.icon_slug),
      order_index: orderValue(payload.order_index, 0),
    }),
  );
}

export async function deleteProfilePersonalEntry(formData: FormData) {
  return deleteRow(formData, "profile_personal_entries", "personal-deleted");
}

export async function upsertProfileTechnicalSkill(formData: FormData) {
  await requireAdminUser();

  const payload = technicalSkillSchema.parse({
    id: getString(formData, "id"),
    category: getString(formData, "category") ?? "",
    skills: getString(formData, "skills") ?? "",
    order_index: parseInt(getString(formData, "order_index") ?? "0"),
  });

  // Parse comma-separated skills into array
  const skillsArray = payload.skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profile_technical_skills").upsert({
    id: payload.id || undefined,
    category: payload.category,
    skills: skillsArray,
    order_index: orderValue(payload.order_index, 0),
  });

  if (error) throw new Error(error.message);

  revalidateProfile();
  redirect("/admin/site-profile?status=tech-skill-saved");
}

export async function deleteProfileTechnicalSkill(formData: FormData) {
  return deleteRow(formData, "profile_technical_skills", "tech-skill-deleted", "category");
}
