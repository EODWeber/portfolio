"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const resumeSchema = z.object({
  id: z.string().optional(),
  vertical: z.enum(["ai-security", "secure-devops", "soc"]),
  label: z.string().min(1),
  // file_path is determined by upload if provided; optional here
  file_path: z.string().optional(),
  published_at: z.string().optional(),
});

const importSchema = z.object({
  payload: z.string().min(1),
});

export async function upsertResume(formData: FormData) {
  await requireAdminUser();

  const id = formData.get("id")?.toString() || undefined;
  const vertical = (formData.get("vertical")?.toString() ?? "ai-security") as
    | "ai-security"
    | "secure-devops"
    | "soc";
  const label = formData.get("label")?.toString() ?? "";
  const file = formData.get("file") as File | null;
  const publishedAtRaw = formData.get("published_at")?.toString() ?? "";

  const admin = createSupabaseAdminClient();

  // If a file is uploaded, push to Supabase Storage and derive file_path
  let file_path: string | undefined = undefined;
  if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
    const ext = file.name.split(".").pop() || "pdf";
    const key = `resumes/${vertical}-${Date.now()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("resumes")
      .upload(key, await file.arrayBuffer(), {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
    file_path = key;
  } else {
    // Keep existing file_path on update
    const existing = id
      ? await admin.from("resumes").select("file_path").eq("id", id).maybeSingle()
      : null;
    if (existing && existing.data?.file_path) file_path = existing.data.file_path;
  }

  const parsed = resumeSchema.parse({
    id,
    vertical,
    label,
    file_path,
    published_at: publishedAtRaw,
  });

  if (!parsed.id && !parsed.file_path) {
    throw new Error("Resume file is required for new entries.");
  }

  const published_at = parsed.published_at
    ? (() => {
        const date = new Date(parsed.published_at);
        if (Number.isNaN(date.getTime())) {
          throw new Error("Invalid published date");
        }
        return date.toISOString();
      })()
    : null;

  const payload: Record<string, unknown> = {
    vertical: parsed.vertical,
    label: parsed.label,
    file_path: parsed.file_path,
    published_at,
  };

  if (parsed.id) {
    payload.id = parsed.id;
  } else {
    payload.archived = false;
  }

  const { error: upsertErr } = await admin.from("resumes").upsert(payload);

  if (upsertErr) throw new Error(upsertErr.message);

  revalidatePath("/resume");
  revalidatePath("/portfolio");
  revalidatePath("/contact");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes?status=success");
}

export async function deleteResume(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing resume id");

  const admin = createSupabaseAdminClient();
  const { data: existing, error: readErr } = await admin
    .from("resumes")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);

  const { error } = await admin.from("resumes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.file_path) {
    const { error: removeErr } = await admin.storage.from("resumes").remove([existing.file_path]);
    if (removeErr) throw new Error(removeErr.message);
  }

  revalidatePath("/resume");
  revalidatePath("/portfolio");
  revalidatePath("/contact");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes?status=deleted");
}

export async function importResumes(formData: FormData): Promise<void> {
  await requireAdminUser();

  const parsed = importSchema.safeParse({ payload: formData.get("payload")?.toString() ?? "" });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("\n"));
  }

  let records: unknown[] = [];
  try {
    records = JSON.parse(parsed.data.payload);
  } catch {
    throw new Error("Invalid JSON payload");
  }

  if (!Array.isArray(records)) {
    throw new Error("Import payload must be an array");
  }

  const admin = createSupabaseAdminClient();
  const payloads = records.map((record) => {
    if (!record || typeof record !== "object") {
      throw new Error("Invalid record in import payload");
    }
    const r = record as Record<string, unknown>;
    const candidate = resumeSchema.partial({ id: true }).parse({
      id: r.id,
      vertical: r.vertical,
      label: r.label,
      file_path: r.file_path,
      published_at: r.published_at,
    });

    const iso = candidate.published_at
      ? (() => {
          const date = new Date(candidate.published_at as string);
          if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid published_at in import payload");
          }
          return date.toISOString();
        })()
      : null;

    return {
      id: candidate.id,
      vertical: (candidate.vertical ?? "ai-security") as "ai-security" | "secure-devops" | "soc",
      label: candidate.label ?? "",
      file_path: candidate.file_path ?? "",
      published_at: iso,
    };
  });

  const { error: importErr } = await admin.from("resumes").upsert(payloads);
  if (importErr) throw new Error(importErr.message);

  revalidatePath("/resume");
  revalidatePath("/portfolio");
  revalidatePath("/contact");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes?status=imported");
}

const idSchema = z.object({ id: z.string().uuid() });

export async function setPrimaryResume(formData: FormData) {
  await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  // Find target resume
  const { data: target } = await admin
    .from("resumes")
    .select("id, vertical, featured")
    .eq("id", parsed.id)
    .maybeSingle();
  if (!target) throw new Error("Resume not found");
  if (target.featured) {
    const { error: unsetErr } = await admin
      .from("resumes")
      .update({ featured: false })
      .eq("id", target.id);
    if (unsetErr) throw new Error(unsetErr.message);
  } else {
    const { error: clearErr } = await admin
      .from("resumes")
      .update({ featured: false })
      .eq("vertical", target.vertical);
    if (clearErr) throw new Error(clearErr.message);
    const { error: setErr } = await admin
      .from("resumes")
      .update({ featured: true })
      .eq("id", parsed.id);
    if (setErr) throw new Error(setErr.message);
  }
  revalidatePath("/resume");
  revalidatePath("/portfolio");
  revalidatePath("/contact");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes");
}

export async function toggleArchiveResume(formData: FormData) {
  await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  // Read current state
  const { data: row } = await admin
    .from("resumes")
    .select("archived")
    .eq("id", parsed.id)
    .maybeSingle();
  if (!row) throw new Error("Resume not found");
  const update: Record<string, unknown> = { archived: !row.archived };
  if (!row.archived) {
    update.featured = false;
  }
  const { error } = await admin.from("resumes").update(update).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/resume");
  revalidatePath("/portfolio");
  revalidatePath("/contact");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes");
}
