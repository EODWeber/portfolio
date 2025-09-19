"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { parseCsv } from "@/lib/admin/utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional(),
  body_path: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.string().optional(),
});

const importSchema = z.object({
  payload: z.string().min(1),
});

export async function upsertArticle(formData: FormData) {
  await requireAdminUser();

  const payload = articleSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    body_path: formData.get("body_path")?.toString() || undefined,
    tags: formData.get("tags")?.toString() ?? "",
    status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published",
    featured: formData.get("featured")?.toString(),
  });

  const admin = createSupabaseAdminClient();

  // MDX content management
  const content = formData.get("mdx_content")?.toString() ?? "";
  const linkKey = formData.get("link_key")?.toString() ?? "";
  const heroFile = formData.get("hero_image") as File | null;
  let body_path = payload.body_path;
  let hero_url: string | undefined = undefined;

  if (linkKey) {
    const [a, s] = await Promise.all([
      admin.from("articles").select("id").eq("body_path", linkKey).limit(1),
      admin.from("case_studies").select("id").eq("body_path", linkKey).limit(1),
    ]);
    if ((a.data && a.data.length > 0) || (s.data && s.data.length > 0)) {
      throw new Error("Selected MDX file is already linked");
    }
    body_path = linkKey;
  } else if (content) {
    const key = `articles/${payload.slug}.mdx`;
    const { data: existing } = await admin
      .from("mdx_documents")
      .select("id")
      .eq("key", key)
      .maybeSingle();
    if (existing?.id) {
      const { error: updateErr } = await admin
        .from("mdx_documents")
        .update({ content, deleted: false })
        .eq("id", existing.id);
      if (updateErr) throw new Error(updateErr.message);
    } else {
      const { error: insertErr } = await admin.from("mdx_documents").insert({ key, content });
      if (insertErr) throw new Error(insertErr.message);
    }
    body_path = key;
  }

  // Upload cover image if provided
  if (heroFile && typeof heroFile.arrayBuffer === "function" && heroFile.size > 0) {
    const ext = heroFile.name.split(".").pop() || "jpg";
    const key = `articles/${payload.slug}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("images")
      .upload(key, await heroFile.arrayBuffer(), { upsert: false, contentType: heroFile.type || "image/*" });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data } = admin.storage.from("images").getPublicUrl(key);
    hero_url = data.publicUrl;
  }

  // Enforce max 6 featured
  if ((payload.featured === "on" || payload.featured === "true") && !payload.id) {
    const { data: f } = await admin.from("articles").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 6) throw new Error("Max 6 featured articles. Unfeature one first.");
  }

  const { error: upsertErr } = await admin.from("articles").upsert({
    id: payload.id,
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary || null,
    body_path: body_path ?? payload.body_path ?? "",
    hero_url: hero_url ?? undefined,
    tags: parseCsv(payload.tags),
    status: payload.status,
    featured: payload.featured === "on" || payload.featured === "true",
  });

  if (upsertErr) {
    throw new Error(upsertErr.message);
  }

  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?status=success");
}

export async function deleteArticle(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing article id");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?status=deleted");
}

export async function importArticles(formData: FormData): Promise<void> {
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
    const candidate = articleSchema.partial({ id: true, status: true }).parse({
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      body_path: r.body_path,
      tags: Array.isArray(r.tags) ? (r.tags as unknown[]).join(",") : (r.tags as string | undefined),
      status: (r as { status?: string }).status ?? "draft",
    });

    return {
      id: candidate.id,
      title: candidate.title ?? "",
      slug: candidate.slug ?? "",
      summary: candidate.summary ?? null,
      body_path: candidate.body_path ?? "",
      tags: parseCsv(candidate.tags ?? ""),
      status: (candidate.status ?? "draft") as "draft" | "published",
    };
  });

  const { error } = await admin.from("articles").upsert(payloads);
  if (error) throw new Error(error.message);

  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?status=imported");
}
