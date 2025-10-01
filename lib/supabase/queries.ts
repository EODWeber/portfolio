import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  Article,
  CaseStudy,
  ContactLink,
  MdxDocument,
  ProfileCareerHighlight,
  ProfilePersonalEntry,
  ProfilePillar,
  ProfileRecognition,
  ProfileSpeakingEngagement,
  ProfileTestimonial,
  Project,
  Resume,
  SiteProfile,
  SiteSettings,
  SocialPost,
  Vertical,
} from "./types";
import { readStorageText } from "./storage";

async function getClient() {
  return createSupabaseServerClient();
}

function unwrap<T>(data: T | null, error: { message: string } | null, fallbackMessage: string): T {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
  if (!data) {
    throw new Error(fallbackMessage);
  }
  return data;
}

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return unwrap<Project[]>(data, error, "Unable to load projects");
});

export const getFeaturedProjects = cache(async (limit = 3): Promise<Project[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return unwrap<Project[]>(data, error, "Unable to load featured projects");
});

export const getFeaturedCaseStudies = cache(async (limit = 2): Promise<CaseStudy[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return unwrap<CaseStudy[]>(data, error, "Unable to load featured case studies");
});

export const getFeaturedArticles = cache(async (limit = 3): Promise<Article[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return unwrap<Article[]>(data, error, "Unable to load featured articles");
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load project");
  }

  return data as Project | null;
});

export const getPublishedCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return unwrap<CaseStudy[]>(data, error, "Unable to load case studies");
});

export const getCaseStudyBySlug = cache(async (slug: string): Promise<CaseStudy | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load case study");
  }

  return data as CaseStudy | null;
});

export const getPublishedArticles = cache(async (): Promise<Article[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .not("slug", "ilike", "legal-%")
    .order("created_at", { ascending: false });

  return unwrap<Article[]>(data, error, "Unable to load articles");
});

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load article");
  }

  return data as Article | null;
});

export const getResumes = cache(async (): Promise<Resume[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("archived", false)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  return unwrap<Resume[]>(data, error, "Unable to load resumes");
});

export const getResumeByVertical = cache(async (vertical: Vertical): Promise<Resume | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("vertical", vertical)
    .eq("archived", false)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message || "Unable to load resume");
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as Resume;
});

export const getSocialPosts = cache(async (limit?: number): Promise<SocialPost[]> => {
  const supabase = await getClient();
  const query = supabase.from("social_posts").select("*").order("posted_at", { ascending: false });
  const { data, error } = await (limit ? query.limit(limit) : query);

  return unwrap<SocialPost[]>(data, error, "Unable to load social posts");
});

export const getRelatedProjectsForArticle = cache(async (articleId: string): Promise<Project[]> => {
  const supabase = await getClient();
  const { data: links, error: linkErr } = await supabase
    .from("article_related_projects")
    .select("project_id")
    .eq("article_id", articleId);

  if (linkErr) {
    throw new Error(linkErr.message || "Unable to load related projects");
  }

  const ids = (links ?? []).map((link) => link.project_id);
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });

  return unwrap<Project[]>(data, error, "Unable to load related projects");
});

export const getRelatedCaseStudiesForArticle = cache(
  async (articleId: string): Promise<CaseStudy[]> => {
    const supabase = await getClient();
    const { data: links, error: linkErr } = await supabase
      .from("article_related_case_studies")
      .select("case_study_id")
      .eq("article_id", articleId);

    if (linkErr) {
      throw new Error(linkErr.message || "Unable to load related case studies");
    }

    const ids = (links ?? []).map((link) => link.case_study_id);
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });

    return unwrap<CaseStudy[]>(data, error, "Unable to load related case studies");
  },
);

export const getRelatedProjectsForCaseStudy = cache(
  async (caseStudyId: string): Promise<Project[]> => {
    const supabase = await getClient();
    const { data: links, error: linkErr } = await supabase
      .from("project_related_case_studies")
      .select("project_id")
      .eq("case_study_id", caseStudyId);

    if (linkErr) {
      throw new Error(linkErr.message || "Unable to load related projects");
    }

    const ids = (links ?? []).map((link) => link.project_id);
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });

    return unwrap<Project[]>(data, error, "Unable to load related projects");
  },
);

export const getRelatedCaseStudiesForProject = cache(
  async (projectId: string): Promise<CaseStudy[]> => {
    const supabase = await getClient();
    const { data: links, error: linkErr } = await supabase
      .from("project_related_case_studies")
      .select("case_study_id")
      .eq("project_id", projectId);

    if (linkErr) {
      throw new Error(linkErr.message || "Unable to load related case studies");
    }

    const ids = (links ?? []).map((link) => link.case_study_id);
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });

    return unwrap<CaseStudy[]>(data, error, "Unable to load related case studies");
  },
);

export const getVerticalProjects = cache(async (vertical: Vertical): Promise<Project[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .eq("vertical", vertical)
    .order("created_at", { ascending: false });

  return unwrap<Project[]>(data, error, "Unable to load vertical projects");
});

export const getVerticalCaseStudies = cache(async (vertical: Vertical): Promise<CaseStudy[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("status", "published")
    .eq("vertical", vertical)
    .order("created_at", { ascending: false });

  return unwrap<CaseStudy[]>(data, error, "Unable to load vertical case studies");
});

export const getVerticalArticles = cache(async (vertical: Vertical): Promise<Article[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .contains("tags", [vertical])
    .not("slug", "ilike", "legal-%")
    .order("created_at", { ascending: false });

  return unwrap<Article[]>(data, error, "Unable to load vertical articles");
});

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load site settings");
  }

  return data as SiteSettings | null;
});

export const getSiteProfile = cache(async (): Promise<SiteProfile | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("site_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load site profile");
  }

  return data as SiteProfile | null;
});

export const getProfilePillars = cache(async (): Promise<ProfilePillar[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_pillars")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfilePillar[]>(data, error, "Unable to load profile pillars");
});

export const getProfileCareerHighlights = cache(async (): Promise<ProfileCareerHighlight[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_career_highlights")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfileCareerHighlight[]>(data, error, "Unable to load career highlights");
});

export const getProfileSpeaking = cache(async (): Promise<ProfileSpeakingEngagement[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_speaking_engagements")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfileSpeakingEngagement[]>(data, error, "Unable to load speaking engagements");
});

export const getProfileRecognitions = cache(async (): Promise<ProfileRecognition[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_recognitions")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfileRecognition[]>(data, error, "Unable to load recognitions");
});

export const getProfileTestimonials = cache(async (): Promise<ProfileTestimonial[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_testimonials")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfileTestimonial[]>(data, error, "Unable to load testimonials");
});

export const getProfilePersonalEntries = cache(async (): Promise<ProfilePersonalEntry[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profile_personal_entries")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrap<ProfilePersonalEntry[]>(data, error, "Unable to load personal entries");
});

export const getContactLinks = cache(async (): Promise<ContactLink[]> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("contact_links")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  return unwrap<ContactLink[]>(data, error, "Unable to load contact links");
});

export const getMdxByKey = cache(async (key: string): Promise<MdxDocument | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("mdx_documents")
    .select("id, key, storage_path, deleted, created_at, updated_at")
    .eq("key", key)
    .eq("deleted", false)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load MDX document");
  if (!data) return null;

  const baseDoc = data as Omit<MdxDocument, "content" | "download_error" | "public_url">;
  const { data: publicData } = supabase.storage.from("content").getPublicUrl(baseDoc.storage_path);
  const publicUrl = publicData.publicUrl ?? null;
  const { data: file, error: storageError } = await supabase.storage
    .from("content")
    .download(baseDoc.storage_path);

  if (storageError) {
    return {
      ...baseDoc,
      content: null,
      download_error: storageError.message,
      public_url: publicUrl,
    };
  }

  const { text, error: readError } = await readStorageText(file);
  if (readError) {
    return { ...baseDoc, content: null, download_error: readError, public_url: publicUrl };
  }

  return { ...baseDoc, content: text ?? "", download_error: null, public_url: publicUrl };
});
