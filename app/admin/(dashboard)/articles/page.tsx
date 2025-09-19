import { fetchAllArticles, fetchAvailableMdxDocuments } from "@/lib/admin/queries";

import { ArticleManager } from "./article-manager";

type ArticlesPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ArticlesAdminPage({ searchParams }: ArticlesPageProps) {
  const [articles, availableDocs] = await Promise.all([
    fetchAllArticles(),
    fetchAvailableMdxDocuments(),
  ]);
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;

  return <ArticleManager articles={articles} availableDocs={availableDocs} status={status} />;
}
