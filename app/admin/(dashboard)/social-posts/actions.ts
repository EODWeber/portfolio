"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const socialPostSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
  summary: z.string().optional(),
  posted_at: z.string().min(1),
  featured: z.string().optional(),
});

function parseFeatured(value: string | undefined) {
  if (!value) return false;
  return value === "on" || value === "true";
}

export async function upsertSocialPost(formData: FormData) {
  await requireAdminUser();

  const payload = socialPostSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    platform: formData.get("platform")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    url: formData.get("url")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    posted_at: formData.get("posted_at")?.toString() ?? "",
    featured: formData.get("featured")?.toString(),
  });

  const parsedDate = new Date(payload.posted_at);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid posted_at value. Use a valid date-time string.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("social_posts").upsert({
    id: payload.id,
    platform: payload.platform,
    title: payload.title,
    url: payload.url,
    summary: payload.summary || null,
    posted_at: parsedDate.toISOString(),
    featured: parseFeatured(payload.featured ?? undefined),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/feed");
  revalidatePath("/", "page");
  revalidatePath("/admin/social-posts");
  redirect("/admin/social-posts?status=success");
}

export async function deleteSocialPost(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing social post id");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("social_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/feed");
  revalidatePath("/", "page");
  revalidatePath("/admin/social-posts");
  redirect("/admin/social-posts?status=deleted");
}

const idOnly = z.object({ id: z.string().uuid() });

export async function toggleSocialPostFeatured(formData: FormData) {
  await requireAdminUser();
  const parsed = idOnly.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  const { data: row, error: readErr } = await admin
    .from("social_posts")
    .select("featured")
    .eq("id", parsed.id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Post not found");
  const next = !row.featured;
  if (next) {
    const { data: f } = await admin.from("social_posts").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 6) throw new Error("Max 6 featured posts. Unfeature one first.");
  }
  const { error } = await admin.from("social_posts").update({ featured: next }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social-posts");
}
