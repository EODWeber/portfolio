"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const linkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  url: z.string().min(1),
  category: z.string().optional(),
  icon: z.string().optional(),
  order_index: z.coerce.number().int().optional(),
});

export async function upsertContactLink(formData: FormData) {
  await requireAdminUser();

  const payload = linkSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    label: formData.get("label")?.toString() ?? "",
    url: formData.get("url")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
    icon: formData.get("icon")?.toString() ?? "",
    order_index: formData.get("order_index")?.toString() ?? "0",
  });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_links").upsert({
    id: payload.id,
    label: payload.label,
    url: payload.url,
    category: payload.category,
    icon: payload.icon,
    order_index: payload.order_index ?? 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contact");
  revalidatePath("/admin/contact-links");
  redirect("/admin/contact-links?status=success");
}

export async function deleteContactLink(formData: FormData) {
  await requireAdminUser();

  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Missing contact link id");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_links").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contact");
  revalidatePath("/admin/contact-links");
  redirect("/admin/contact-links?status=deleted");
}
