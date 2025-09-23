import { fetchAllArticles, fetchAvailableMdxDocuments } from "@/lib/admin/queries";

import { ArticleManager } from "./article-manager";

export default async function ArticlesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [articles, availableDocs] = await Promise.all([
    fetchAllArticles(),
    fetchAvailableMdxDocuments(),
  ]);
  const status = typeof sp?.status === "string" ? sp.status : undefined;

  return <ArticleManager articles={articles} availableDocs={availableDocs} status={status} />;
}
