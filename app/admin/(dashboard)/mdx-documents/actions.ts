"use server";

import { Buffer } from "node:buffer";

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
  const payloadBuffer = Buffer.from(payload.content, "utf8");
  const { data: existing } = payload.id
    ? await admin
        .from("mdx_documents")
        .select("id, key, storage_path")
        .eq("id", payload.id)
        .maybeSingle()
    : { data: null };

  const { error: uploadErr } = await admin.storage
    .from("content")
    .upload(payload.key, payloadBuffer, { upsert: true, contentType: "text/markdown" });
  if (uploadErr) throw new Error(uploadErr.message);

  if (existing?.id) {
    if (existing.storage_path && existing.storage_path !== payload.key) {
      await admin.storage.from("content").remove([existing.storage_path]);
    }
    const { error } = await admin
      .from("mdx_documents")
      .update({ key: payload.key, storage_path: payload.key, deleted: false })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("mdx_documents").insert({ key: payload.key, storage_path: payload.key });
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
  const { data, error: readErr } = await admin
    .from("mdx_documents")
    .select("storage_path")
    .eq("id", payload.id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (data?.storage_path) {
    const { error: storageErr } = await admin.storage.from("content").remove([data.storage_path]);
    if (storageErr) throw new Error(storageErr.message);
  }
  const { error } = await admin.from("mdx_documents").delete().eq("id", payload.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mdx-documents");
}

