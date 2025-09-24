import { fetchAllArticles, fetchAllCaseStudies, fetchAllMdxDocuments } from "@/lib/admin/queries";
import { toContentKey } from "@/lib/content/resolve";

import { CaseStudyManager } from "./case-study-manager";

export default async function CaseStudiesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [caseStudies, articles, availableDocs] = await Promise.all([
    fetchAllCaseStudies(),
    fetchAllArticles(),
    fetchAllMdxDocuments(),
  ]);
  const status = typeof sp?.status === "string" ? sp.status : undefined;
  const used = new Set<string>([
    ...caseStudies.map((s) => toContentKey(s.body_path ?? "")),
    ...articles.map((a) => toContentKey(a.body_path ?? "")),
  ]);
  return (
    <CaseStudyManager
      caseStudies={caseStudies}
      availableDocs={availableDocs}
      usedKeys={[...used]}
      status={status}
    />
  );
}
