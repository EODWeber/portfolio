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

  const parsed = resumeSchema.parse({ id, vertical, label, file_path });

  const { error: upsertErr } = await admin
    .from("resumes")
    .upsert(
      {
        id: parsed.id,
        vertical: parsed.vertical,
        label: parsed.label,
        file_path: parsed.file_path,
      },
      { onConflict: "vertical" }
    );

  if (upsertErr) throw new Error(upsertErr.message);

  revalidatePath("/resume");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes?status=success");
}

export async function deleteResume(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing resume id");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("resumes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/resume");
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
    });

    return {
      id: candidate.id,
      vertical: (candidate.vertical ?? "ai-security") as "ai-security" | "secure-devops" | "soc",
      label: candidate.label ?? "",
      file_path: candidate.file_path ?? "",
    };
  });

  const { error: importErr } = await admin.from("resumes").upsert(payloads, { onConflict: "vertical" });
  if (importErr) throw new Error(importErr.message);

  revalidatePath("/resume");
  revalidatePath("/admin/resumes");
  redirect("/admin/resumes?status=imported");
}

const idSchema = z.object({ id: z.string().uuid() });

export async function setPrimaryResume(formData: FormData) {
  await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  // Find target resume
  const { data: target } = await admin.from("resumes").select("id, vertical").eq("id", parsed.id).maybeSingle();
  if (!target) throw new Error("Resume not found");
  // Unset others in same vertical, set this one
  const { error: clearErr } = await admin.from("resumes").update({ featured: false }).eq("vertical", target.vertical);
  if (clearErr) throw new Error(clearErr.message);
  const { error: setErr } = await admin.from("resumes").update({ featured: true }).eq("id", parsed.id);
  if (setErr) throw new Error(setErr.message);
  revalidatePath("/resume");
  revalidatePath("/admin/resumes");
}

export async function toggleArchiveResume(formData: FormData) {
  await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  // Read current state
  const { data: row } = await admin.from("resumes").select("archived").eq("id", parsed.id).maybeSingle();
  if (!row) throw new Error("Resume not found");
  const { error } = await admin.from("resumes").update({ archived: !row.archived }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resumes");
}

const publishSchema = z.object({ id: z.string().uuid(), published_at: z.string().optional() });

export async function updateResumePublishedDate(formData: FormData) {
  await requireAdminUser();
  const parsed = publishSchema.parse({ id: formData.get("id")?.toString(), published_at: formData.get("published_at")?.toString() });
  const admin = createSupabaseAdminClient();
  const iso = parsed.published_at ? new Date(parsed.published_at).toISOString() : null;
  const { error } = await admin.from("resumes").update({ published_at: iso }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resumes");
}
