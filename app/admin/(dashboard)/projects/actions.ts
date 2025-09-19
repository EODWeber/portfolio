"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { parseCsv, parseKeyValueLines } from "@/lib/admin/utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  vertical: z.enum(["ai-security", "secure-devops", "soc"]),
  tags: z.string().optional(),
  tech_stack: z.string().optional(),
  repo_url: z.string().optional(),
  hero_url: z.string().optional(),
  outcomes: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.string().optional(),
});

const importSchema = z.object({
  payload: z.string().min(1),
});

export async function upsertProject(formData: FormData) {
  await requireAdminUser();

  const payload = projectSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    vertical: (formData.get("vertical")?.toString() ?? "ai-security") as
      | "ai-security"
      | "secure-devops"
      | "soc",
    tags: formData.get("tags")?.toString() ?? "",
    tech_stack: formData.get("tech_stack")?.toString() ?? "",
    repo_url: formData.get("repo_url")?.toString() ?? "",
    hero_url: formData.get("hero_url")?.toString() ?? "",
    outcomes: formData.get("outcomes")?.toString() ?? "",
    status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published",
    featured: formData.get("featured")?.toString(),
  });

  const admin = createSupabaseAdminClient();
  const heroFile = formData.get("hero_image") as File | null;
  let hero_url: string | undefined = undefined;

  const outcomes = parseKeyValueLines(payload.outcomes).map(({ key, value }) => ({
    metric: key,
    value,
  }));

  if (heroFile && typeof heroFile.arrayBuffer === "function" && heroFile.size > 0) {
    const ext = heroFile.name.split(".").pop() || "jpg";
    const key = `projects/${payload.slug}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("images")
      .upload(key, await heroFile.arrayBuffer(), { upsert: false, contentType: heroFile.type || "image/*" });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data } = admin.storage.from("images").getPublicUrl(key);
    hero_url = data.publicUrl;
  }

  if ((payload.featured === "on" || payload.featured === "true") && !payload.id) {
    const { data: f } = await admin.from("projects").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 6) throw new Error("Max 6 featured projects. Unfeature one first.");
  }

  const { error: upsertErr } = await admin.from("projects").upsert({
    id: payload.id,
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary,
    vertical: payload.vertical,
    tags: parseCsv(payload.tags),
    tech_stack: parseCsv(payload.tech_stack),
    repo_url: payload.repo_url || null,
    hero_url: (hero_url ?? payload.hero_url) || null,
    outcomes,
    status: payload.status,
    featured: payload.featured === "on" || payload.featured === "true",
  });

  if (upsertErr) {
    throw new Error(upsertErr.message);
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?status=success");
}

export async function deleteProject(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing project id");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?status=deleted");
}

export async function importProjects(formData: FormData): Promise<void> {
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
    const candidate = projectSchema.partial({ id: true, status: true }).parse({
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      vertical: r.vertical,
      tags: Array.isArray(r.tags) ? (r.tags as unknown[]).join(",") : (r.tags as string | undefined),
      tech_stack: Array.isArray(r.tech_stack)
        ? (r.tech_stack as unknown[]).join(",")
        : (r.tech_stack as string | undefined),
      repo_url: r.repo_url,
      hero_url: r.hero_url,
      outcomes: Array.isArray((r as { outcomes?: unknown }).outcomes)
        ? ((r as { outcomes?: Array<{ metric?: string; value?: string }> }).outcomes ?? [])
          .map((outcome) => `${outcome.metric ?? ""}|${outcome.value ?? ""}`)
          .join("\n")
        : ((r as { outcomes?: string }).outcomes as string | undefined),
      status: (r as { status?: string }).status ?? "draft",
    });

    const outcomes = parseKeyValueLines(candidate.outcomes ?? "").map(({ key, value }) => ({ metric: key, value }));

    return {
      id: candidate.id,
      title: candidate.title ?? "",
      slug: candidate.slug ?? "",
      summary: candidate.summary ?? "",
      vertical: (candidate.vertical ?? "ai-security") as "ai-security" | "secure-devops" | "soc",
      tags: parseCsv(candidate.tags ?? ""),
      tech_stack: parseCsv(candidate.tech_stack ?? ""),
      repo_url: candidate.repo_url ?? null,
      hero_url: candidate.hero_url ?? null,
      outcomes,
      status: (candidate.status ?? "draft") as "draft" | "published",
    };
  });

  const { error } = await admin.from("projects").upsert(payloads);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?status=imported");
}

const idOnly = z.object({ id: z.string().uuid() });

export async function toggleProjectFeatured(formData: FormData) {
  await requireAdminUser();
  const parsed = idOnly.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  const { data: row, error: readErr } = await admin.from("projects").select("featured").eq("id", parsed.id).maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Project not found");
  const next = !row.featured;
  if (next) {
    const { data: f } = await admin.from("projects").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 6) throw new Error("Max 6 featured projects. Unfeature one first.");
  }
  const { error } = await admin.from("projects").update({ featured: next }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projects");
}
