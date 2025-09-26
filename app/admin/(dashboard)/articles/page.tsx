import {
  fetchAllArticles,
  fetchAllProjects,
  fetchAllCaseStudies,
  fetchAllMdxDocuments,
  fetchRelationsForArticles,
} from "@/lib/admin/queries";
import { toContentKey } from "@/lib/content/resolve";

import { ArticleManager } from "./article-manager";

export default async function ArticlesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [articles, projects, caseStudies, availableDocs, rel] = await Promise.all([
    fetchAllArticles(),
    fetchAllProjects(),
    fetchAllCaseStudies(),
    fetchAllMdxDocuments(),
    fetchRelationsForArticles(),
  ]);
  const used = new Set<string>([
    ...articles.map((a) => toContentKey(a.body_path ?? "")),
    ...caseStudies.map((s) => toContentKey(s.body_path ?? "")),
  ]);
  const status = typeof sp?.status === "string" ? sp.status : undefined;
  const message = typeof sp?.message === "string" ? sp.message : undefined;

  return (
    <ArticleManager
      articles={articles}
      availableDocs={availableDocs}
      projects={projects}
      caseStudies={caseStudies}
      relationsByArticle={rel}
      usedKeys={[...used]}
      status={status}
      errorMessage={message}
    />
  );
}
