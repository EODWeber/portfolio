import type {
  Article,
  CaseStudy,
  ContactRequest,
  Project,
  Resume,
  SiteProfile,
  SiteSettings,
  SocialPost,
} from "@/lib/supabase/types";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export async function fetchAllProjects(): Promise<Project[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Project[]) ?? [];
}

export async function fetchAllCaseStudies(): Promise<CaseStudy[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("case_studies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as CaseStudy[]) ?? [];
}

export async function fetchAllArticles(): Promise<Article[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Article[]) ?? [];
}

export async function fetchAllResumes(): Promise<Resume[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("resumes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Resume[]) ?? [];
}

// Relations ---------------------------------------------------------
export async function fetchProjectIdsByCaseStudy(): Promise<Record<string, string[]>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("project_related_case_studies")
    .select("project_id, case_study_id");
  if (error) throw new Error(error.message);
  const map: Record<string, string[]> = {};
  for (const row of (data as Array<{ project_id: string; case_study_id: string }> | null) ?? []) {
    map[row.case_study_id] = map[row.case_study_id] || [];
    map[row.case_study_id].push(row.project_id);
  }
  return map;
}

export async function fetchCaseStudyIdsByProject(): Promise<Record<string, string[]>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("project_related_case_studies")
    .select("project_id, case_study_id");
  if (error) throw new Error(error.message);
  const map: Record<string, string[]> = {};
  for (const row of (data as Array<{ project_id: string; case_study_id: string }> | null) ?? []) {
    map[row.project_id] = map[row.project_id] || [];
    map[row.project_id].push(row.case_study_id);
  }
  return map;
}

export async function fetchArticleIdsByCaseStudy(): Promise<Record<string, string[]>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("article_related_case_studies")
    .select("article_id, case_study_id");
  if (error) throw new Error(error.message);
  const map: Record<string, string[]> = {};
  for (const row of (data as Array<{ article_id: string; case_study_id: string }> | null) ?? []) {
    map[row.case_study_id] = map[row.case_study_id] || [];
    map[row.case_study_id].push(row.article_id);
  }
  return map;
}

export async function fetchArticleIdsByProject(): Promise<Record<string, string[]>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("article_related_projects")
    .select("article_id, project_id");
  if (error) throw new Error(error.message);
  const map: Record<string, string[]> = {};
  for (const row of (data as Array<{ article_id: string; project_id: string }> | null) ?? []) {
    map[row.project_id] = map[row.project_id] || [];
    map[row.project_id].push(row.article_id);
  }
  return map;
}

export async function fetchRelationsForArticles(): Promise<
  Record<string, { projectIds: string[]; caseStudyIds: string[] }>
> {
  const admin = createSupabaseAdminClient();
  const [ap, ac] = await Promise.all([
    admin.from("article_related_projects").select("article_id, project_id"),
    admin.from("article_related_case_studies").select("article_id, case_study_id"),
  ]);
  if (ap.error) throw new Error(ap.error.message);
  if (ac.error) throw new Error(ac.error.message);
  const map: Record<string, { projectIds: string[]; caseStudyIds: string[] }> = {};
  for (const row of (ap.data as Array<{ article_id: string; project_id: string }> | null) ?? []) {
    const entry = (map[row.article_id] = map[row.article_id] || {
      projectIds: [],
      caseStudyIds: [],
    });
    entry.projectIds.push(row.project_id);
  }
  for (const row of (ac.data as Array<{ article_id: string; case_study_id: string }> | null) ??
    []) {
    const entry = (map[row.article_id] = map[row.article_id] || {
      projectIds: [],
      caseStudyIds: [],
    });
    entry.caseStudyIds.push(row.case_study_id);
  }
  return map;
}

export async function fetchAllSocialPosts(): Promise<SocialPost[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("social_posts")
    .select("*")
    .order("posted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SocialPost[]) ?? [];
}

export async function fetchAllContactRequests(): Promise<ContactRequest[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ContactRequest[]) ?? [];
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SiteSettings | null) ?? null;
}

export async function fetchSiteProfile(): Promise<SiteProfile | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("site_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SiteProfile | null) ?? null;
}

export async function fetchEventSummary(): Promise<Array<{ type: string; count: number }>> {
  const admin = createSupabaseAdminClient();
  // Fetch a recent window of events and aggregate client-side.
  // This avoids using SQL GROUP BY since PostgREST client doesn't expose a group() helper.
  const { data, error } = await admin
    .from("events")
    .select("type")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  const counts: Record<string, number> = {};
  for (const row of (data as Array<{ type: string }> | null) ?? []) {
    counts[row.type] = (counts[row.type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export type RecentEvent = {
  id: string;
  type: string;
  metadata: unknown | null;
  created_at: string;
};

export async function fetchRecentEvents(limit = 20): Promise<RecentEvent[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("events")
    .select("id, type, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as RecentEvent[]) ?? [];
}

import type { NotificationSettings } from "@/lib/supabase/types";

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("notification_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as NotificationSettings | null) ?? null;
}

import type { MdxDocument, NotificationLog } from "@/lib/supabase/types";
import { readStorageText } from "@/lib/supabase/storage";
import { toContentKey } from "@/lib/content/resolve";

export async function getNotificationsLog(limit = 20): Promise<NotificationLog[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("notifications_log")
    .select("id, channel, status, detail, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as NotificationLog[]) ?? [];
}

// MDX documents ------------------------------------------------------
type BaseMdxDocument = Omit<
  import("@/lib/supabase/types").MdxDocument,
  "content" | "download_error" | "public_url"
>;

export async function fetchAllMdxDocuments(): Promise<MdxDocument[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("mdx_documents")
    .select("id, key, storage_path, deleted, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const docs = (data as BaseMdxDocument[]) ?? [];
  const mapped = await Promise.all(
    docs.map(async (doc) => {
      const { data: file, error: downloadError } = await admin.storage
        .from("content")
        .download(doc.storage_path);
      if (downloadError) {
        const { data: publicData } = admin.storage.from("content").getPublicUrl(doc.storage_path);
        return {
          ...doc,
          content: null,
          download_error: downloadError.message,
          public_url: publicData.publicUrl ?? null,
        } satisfies MdxDocument;
      }

      const { text, error: readError } = await readStorageText(file);
      const { data: publicData } = admin.storage.from("content").getPublicUrl(doc.storage_path);
      return {
        ...doc,
        content: readError ? null : (text ?? ""),
        download_error: readError,
        public_url: publicData.publicUrl ?? null,
      } satisfies MdxDocument;
    }),
  );

  return mapped;
}

export async function fetchAvailableMdxDocuments(): Promise<MdxDocument[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("mdx_documents")
    .select("id, key, storage_path, deleted, created_at, updated_at")
    .eq("deleted", false);
  if (error) throw new Error(error.message);

  const docs = (data as BaseMdxDocument[]) ?? [];
  const [articles, studies] = await Promise.all([fetchAllArticles(), fetchAllCaseStudies()]);
  const used = new Set<string>([
    ...articles.map((article) => toContentKey(article.body_path ?? "")),
    ...studies.map((study) => toContentKey(study.body_path ?? "")),
  ]);

  return docs
    .filter((doc) => !used.has(doc.key))
    .map((doc) => {
      const { data: publicData } = admin.storage.from("content").getPublicUrl(doc.storage_path);
      return {
        ...doc,
        content: null,
        download_error: null,
        public_url: publicData.publicUrl ?? null,
      } satisfies MdxDocument;
    });
}
