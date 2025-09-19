"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

const upsertSchema = z.object({ key: z.string().min(1), content: z.string().min(1), id: z.string().optional() });
const toggleSchema = z.object({ id: z.string().uuid(), deleted: z.boolean() });
const deleteSchema = z.object({ id: z.string().uuid() });

export async function upsertMdxDocument(formData: FormData) {
  await requireAdminUser();
  const payload = upsertSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    key: formData.get("key")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
  });
  const admin = createSupabaseAdminClient();
  if (payload.id) {
    const { error } = await admin.from("mdx_documents").update({ key: payload.key, content: payload.content, deleted: false }).eq("id", payload.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("mdx_documents").insert({ key: payload.key, content: payload.content });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/mdx-documents");
}

export async function toggleDeleted(formData: FormData) {
  await requireAdminUser();
  const payload = toggleSchema.parse({ id: formData.get("id")?.toString(), deleted: formData.get("deleted")?.toString() === "true" });
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("mdx_documents").update({ deleted: payload.deleted }).eq("id", payload.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mdx-documents");
}

export async function deleteDocument(formData: FormData) {
  await requireAdminUser();
  const payload = deleteSchema.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("mdx_documents").delete().eq("id", payload.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mdx-documents");
}

