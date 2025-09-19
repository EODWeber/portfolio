import type { ArticleDoc, CaseStudyDoc, LegalDoc } from "@/.contentlayer/generated";
import { allArticleDocs, allCaseStudyDocs, allLegalDocs } from "@/.contentlayer/generated";
import { getMdxByKey } from "@/lib/supabase/queries";

const toContentKey = (bodyPath: string) => bodyPath.replace(/^\//, "");

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
