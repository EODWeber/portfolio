import type {
  Article,
  CaseStudy,
  ContactRequest,
  MdxDocument,
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

import type { NotificationLog } from "@/lib/supabase/types";

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
export async function fetchAllMdxDocuments(): Promise<MdxDocument[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("mdx_documents")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MdxDocument[]) ?? [];
}

export async function fetchAvailableMdxDocuments(): Promise<MdxDocument[]> {
  const admin = createSupabaseAdminClient();
  // Select docs not linked in articles or case_studies
  const { data, error } = await admin
    .from("mdx_documents")
    .select("*")
    .eq("deleted", false);
  if (error) throw new Error(error.message);

  const docs = (data as MdxDocument[]) ?? [];
  const [articles, studies] = await Promise.all([fetchAllArticles(), fetchAllCaseStudies()]);
  const used = new Set<string>([...articles.map((a) => a.body_path), ...studies.map((s) => s.body_path)]);
  return docs.filter((d) => !used.has(d.key));
}
