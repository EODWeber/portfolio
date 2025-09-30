"use server";

import { Buffer } from "node:buffer";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { parseCsv } from "@/lib/admin/utils";
import { coerceCaseStudyMetrics } from "@/lib/case-studies/metrics";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { z } from "zod";

const caseStudySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  vertical: z.enum(["ai-security", "secure-devops", "soc"]),
  tags: z.string().optional(),
  body_path: z.string().optional(),
  hero_url: z.string().optional(),
  metrics: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  featured_metric: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.string().optional(),
});

const importSchema = z.object({
  payload: z.string().min(1),
});

export async function upsertCaseStudy(formData: FormData) {
  await requireAdminUser();

  const payload = caseStudySchema.parse({
    id: formData.get("id")?.toString() || undefined,
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    vertical: (formData.get("vertical")?.toString() ?? "ai-security") as
      | "ai-security"
      | "secure-devops"
      | "soc",
    tags: formData.get("tags")?.toString() ?? "",
    body_path: formData.get("body_path")?.toString() || undefined,
    hero_url: formData.get("hero_url")?.toString() ?? "",
    metrics: formData.get("metrics")?.toString() ?? "",
    featured_metric: formData.get("featured_metric")?.toString() ?? "",
    status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published",
    featured: formData.get("featured")?.toString(),
  });

  const admin = createSupabaseAdminClient();
  const heroFile = formData.get("hero_image") as File | null;
  let hero_url: string | undefined = undefined;

  // MDX content management
  const content = formData.get("mdx_content")?.toString() ?? "";
  const linkKey = formData.get("link_key")?.toString() ?? "";
  let body_path = payload.body_path;

  if (linkKey) {
    const { data: publicLink } = admin.storage.from("content").getPublicUrl(linkKey);
    const publicUrl = publicLink.publicUrl;
    if (!publicUrl) {
      throw new Error("Unable to resolve public URL for the selected MDX document.");
    }
    const [a, s] = await Promise.all([
      admin.from("articles").select("id").eq("body_path", publicUrl).limit(1),
      admin.from("case_studies").select("id").eq("body_path", publicUrl).limit(1),
    ]);
    const linkedElsewhere =
      (a.data && a.data.length > 0) || (s.data && s.data.length > 0 && s.data[0].id !== payload.id);
    if (linkedElsewhere) {
      throw new Error("Selected MDX file is already linked");
    }
    const { error: restoreErr } = await admin
      .from("mdx_documents")
      .update({ deleted: false })
      .eq("key", linkKey);
    if (restoreErr) throw new Error(restoreErr.message);
    body_path = publicUrl;
  } else if (content) {
    const key = `case-studies/${payload.slug}.mdx`;
    const { data: existing } = await admin
      .from("mdx_documents")
      .select("id, storage_path")
      .eq("key", key)
      .maybeSingle();

    const payloadBuffer = Buffer.from(content, "utf8");
    const { error: uploadErr } = await admin.storage
      .from("content")
      .upload(key, payloadBuffer, { upsert: true, contentType: "text/markdown" });
    if (uploadErr) throw new Error(uploadErr.message);

    const { data: publicUrlData } = admin.storage.from("content").getPublicUrl(key);
    const publicUrl = publicUrlData.publicUrl;
    if (!publicUrl) throw new Error("Unable to resolve public URL for uploaded MDX document.");

    if (existing?.id) {
      if (existing.storage_path && existing.storage_path !== key) {
        await admin.storage.from("content").remove([existing.storage_path]);
      }
      const { error: updateErr } = await admin
        .from("mdx_documents")
        .update({ key, storage_path: key, deleted: false })
        .eq("id", existing.id);
      if (updateErr) throw new Error(updateErr.message);
    } else {
      const { error: insertErr } = await admin
        .from("mdx_documents")
        .insert({ key, storage_path: key });
      if (insertErr) throw new Error(insertErr.message);
    }
    body_path = publicUrl;
  } else if (!content) {
    // Ensure a body exists by creating a placeholder MDX if neither link nor content provided
    const key = `case-studies/${payload.slug}.mdx`;
    const { data: publicUrlData } = admin.storage.from("content").getPublicUrl(key);
    const publicUrl = publicUrlData.publicUrl;
    if (publicUrl) {
      body_path = publicUrl;
      await admin.from("mdx_documents").upsert({ key, storage_path: key });
      const placeholder = "---\n---\n";
      await admin.storage.from("content").upload(key, Buffer.from(placeholder, "utf8"), {
        upsert: true,
        contentType: "text/markdown",
      });
    }
  }

  const wantsFeatured = payload.featured === "on" || payload.featured === "true";

  const metrics = coerceCaseStudyMetrics(payload.metrics, { strict: true });

  if (wantsFeatured) {
    const fm = (payload.featured_metric || "").trim();
    if (!fm) throw new Error("Featured metric is required when marking a case study as featured.");
    if (!metrics[fm]) throw new Error("Featured metric key must match one of the metrics above.");
  }

  // Upload cover image if provided
  if (heroFile && typeof heroFile.arrayBuffer === "function" && heroFile.size > 0) {
    const ext = heroFile.name.split(".").pop() || "jpg";
    const key = `case-studies/${payload.slug}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("images")
      .upload(key, await heroFile.arrayBuffer(), {
        upsert: false,
        contentType: heroFile.type || "image/*",
      });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data } = admin.storage.from("images").getPublicUrl(key);
    hero_url = data.publicUrl;
  }

  if (wantsFeatured) {
    const { data: f } = await admin.from("case_studies").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 3 && !payload.id)
      throw new Error("Max 3 featured case studies. Unfeature one first.");
  }

  const { error: upsertErr } = await admin.from("case_studies").upsert({
    id: payload.id,
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary,
    vertical: payload.vertical,
    tags: parseCsv(payload.tags),
    body_path: body_path ?? payload.body_path ?? "",
    hero_url: (hero_url ?? payload.hero_url) || null,
    metrics,
    status: payload.status,
    featured: wantsFeatured,
    featured_metric: payload.featured_metric || null,
  });

  if (upsertErr) {
    throw new Error(upsertErr.message);
  }

  // Update related projects mapping
  const relatedIds = formData.getAll("related_project_ids").map(String).filter(Boolean);
  const relatedArticleIds = formData.getAll("related_article_ids").map(String).filter(Boolean);
  if (relatedIds.length > 0 || relatedArticleIds.length > 0 || payload.id) {
    // look up id by slug if necessary
    let caseStudyId = payload.id;
    if (!caseStudyId) {
      const { data } = await admin
        .from("case_studies")
        .select("id")
        .eq("slug", payload.slug)
        .maybeSingle();
      caseStudyId = (data as { id: string } | null)?.id;
    }
    if (caseStudyId) {
      // clear existing
      await admin.from("project_related_case_studies").delete().eq("case_study_id", caseStudyId);
      if (relatedIds.length > 0) {
        const rows = relatedIds.map((pid) => ({ project_id: pid, case_study_id: caseStudyId! }));
        const { error: relErr } = await admin.from("project_related_case_studies").insert(rows);
        if (relErr) throw new Error(relErr.message);
      }
      // Articles ←→ Case studies (link from case study to selected articles)
      await admin.from("article_related_case_studies").delete().eq("case_study_id", caseStudyId);
      if (relatedArticleIds.length > 0) {
        const rowsA = relatedArticleIds.map((aid) => ({
          article_id: aid,
          case_study_id: caseStudyId!,
        }));
        const { error: relAErr } = await admin.from("article_related_case_studies").insert(rowsA);
        if (relAErr) throw new Error(relAErr.message);
      }
    }
  }

  revalidatePath("/case-studies");
  revalidatePath("/portfolio");
  revalidatePath("/admin/case-studies");
  redirect("/admin/case-studies?status=success");
}

export async function deleteCaseStudy(formData: FormData) {
  await requireAdminUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing case study id");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("case_studies").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/case-studies");
  revalidatePath("/portfolio");
  revalidatePath("/admin/case-studies");
  const title = formData.get("label")?.toString();
  const body_path = formData.get("body_path")?.toString();
  const params = new URLSearchParams({ status: "deleted" });
  if (title) params.set("what", `Case Study: ${title}`);
  if (body_path) params.set("file", body_path);
  redirect(`/admin/case-studies?${params.toString()}`);
}

export async function importCaseStudies(formData: FormData): Promise<void> {
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
    const candidate = caseStudySchema.partial({ id: true, status: true }).parse({
      id: r.id,
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      vertical: r.vertical,
      tags: Array.isArray(r.tags)
        ? (r.tags as unknown[]).join(",")
        : (r.tags as string | undefined),
      body_path: r.body_path,
      hero_url: r.hero_url,
      metrics: r.metrics,
      status: (r as { status?: string }).status ?? "draft",
    });

    const metrics = coerceCaseStudyMetrics(candidate.metrics, { strict: false });

    return {
      id: candidate.id,
      title: candidate.title ?? "",
      slug: candidate.slug ?? "",
      summary: candidate.summary ?? "",
      vertical: (candidate.vertical ?? "ai-security") as "ai-security" | "secure-devops" | "soc",
      tags: parseCsv(candidate.tags ?? ""),
      body_path: candidate.body_path ?? "",
      hero_url: candidate.hero_url ?? null,
      metrics,
      status: (candidate.status ?? "draft") as "draft" | "published",
    };
  });

  const { error } = await admin.from("case_studies").upsert(payloads);
  if (error) throw new Error(error.message);

  revalidatePath("/case-studies");
  revalidatePath("/portfolio");
  revalidatePath("/admin/case-studies");
  redirect("/admin/case-studies?status=imported");
}

const idOnly = z.object({ id: z.string().uuid() });

export async function toggleCaseStudyFeatured(formData: FormData) {
  await requireAdminUser();
  const parsed = idOnly.parse({ id: formData.get("id")?.toString() });
  const admin = createSupabaseAdminClient();
  const { data: row, error: readErr } = await admin
    .from("case_studies")
    .select("featured")
    .eq("id", parsed.id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Case study not found");
  const next = !row.featured;
  if (next) {
    const { data: f } = await admin.from("case_studies").select("id").eq("featured", true);
    if ((f?.length ?? 0) >= 6) throw new Error("Max 6 featured case studies. Unfeature one first.");
  }
  const { error } = await admin.from("case_studies").update({ featured: next }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/case-studies");
}
