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
  avatar_url: z.string().optional(),
  location: z.string().optional(),
  hiring_status: z.string().optional(),
  resume_preference: z.enum(["ai-security", "secure-devops", "soc"]),
  hobbies: z.string().optional(),
  interests: z.string().optional(),
  speaking: z.string().optional(),
  certifications: z.string().optional(),
  awards: z.string().optional(),
  pronouns: z.string().optional(),
  phonetic_name: z.string().optional(),
  languages: z.string().optional(),
  access_notes: z.string().optional(),
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
    hobbies: formData.get("hobbies")?.toString() ?? "",
    interests: formData.get("interests")?.toString() ?? "",
    speaking: formData.get("speaking")?.toString() ?? "",
    certifications: formData.get("certifications")?.toString() ?? "",
    awards: formData.get("awards")?.toString() ?? "",
    pronouns: formData.get("pronouns")?.toString() ?? "",
    phonetic_name: formData.get("phonetic_name")?.toString() ?? "",
    languages: formData.get("languages")?.toString() ?? "",
    access_notes: formData.get("access_notes")?.toString() ?? "",
  });

  const admin = createSupabaseAdminClient();

  const toLines = (s: string) =>
    s
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

  const cleanText = (value: string | undefined) => {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
  };

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
    hobbies: toLines(payload.hobbies ?? ""),
    interests: toLines(payload.interests ?? ""),
    speaking: toLines(payload.speaking ?? ""),
    certifications: toLines(payload.certifications ?? ""),
    awards: toLines(payload.awards ?? ""),
    pronouns: cleanText(payload.pronouns),
    phonetic_name: cleanText(payload.phonetic_name),
    languages: toLines(payload.languages ?? ""),
    access_notes: cleanText(payload.access_notes),
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
