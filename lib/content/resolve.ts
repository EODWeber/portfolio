import type { ArticleDoc, CaseStudyDoc, LegalDoc } from "contentlayer/generated";
import { allArticleDocs, allCaseStudyDocs, allLegalDocs } from "contentlayer/generated";

import { getMdxByKey } from "@/lib/supabase/queries";

const STORAGE_PUBLIC_PREFIX = "storage/v1/object/public/content/";

export function toContentKey(bodyPath: string): string {
  const trimmed = (bodyPath ?? "").trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    const idx = pathname.indexOf(STORAGE_PUBLIC_PREFIX);
    if (idx >= 0) {
      return decodeURIComponent(pathname.slice(idx + STORAGE_PUBLIC_PREFIX.length));
    }
    return decodeURIComponent(pathname);
  } catch {
    let normalized = trimmed.replace(/^\/+/, "");
    if (normalized.startsWith(STORAGE_PUBLIC_PREFIX)) {
      normalized = normalized.slice(STORAGE_PUBLIC_PREFIX.length);
    }
    if (normalized.startsWith("content/")) {
      normalized = normalized.slice("content/".length);
    }
    return decodeURIComponent(normalized);
  }
}

export function findArticleDoc(bodyPath: string): ArticleDoc | LegalDoc | null {
  const key = toContentKey(bodyPath);
  return (
    allArticleDocs.find((doc: ArticleDoc) => doc.bodyPath === key) ||
    allLegalDocs.find((doc: LegalDoc) => doc.bodyPath === key) ||
    null
  );
}

export function findCaseStudyDoc(bodyPath: string): CaseStudyDoc | null {
  const key = toContentKey(bodyPath);
  return allCaseStudyDocs.find((doc: CaseStudyDoc) => doc.bodyPath === key) ?? null;
}

export async function getMdxSourceOrNull(bodyPath: string): Promise<string | null> {
  const key = toContentKey(bodyPath);
  const doc = await getMdxByKey(key);
  return doc?.content ?? null;
}
