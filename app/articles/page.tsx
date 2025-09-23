export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getPublishedArticles } from "@/lib/supabase/queries";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Articles</h1>
        <p className="text-muted-foreground text-lg">
          Essays, research notes, and hands-on guides for building secure AI and cloud platforms.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No articles published yet. Seed Supabase or author new MDX content to populate this index.
        </p>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <article key={article.id} className="first:pt-0">
              <Link href={`/articles/${article.slug}`} className="group block">
                <div className="flex gap-4">
                  <div className="w-40 flex-shrink-0">
                    <AspectRatio ratio={16 / 9}>
                      <Image
                        src={article.hero_url || "/default-card.svg"}
                        alt=""
                        fill
                        sizes="160px"
                        className="rounded-md object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
                      {article.title}
                    </h2>
                    {article.summary ? (
                      <p className="text-muted-foreground mt-2 line-clamp-3 text-base">
                        {article.summary}
                      </p>
                    ) : null}
                    {article.featured || (article.tags?.length ?? 0) > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.featured ? (
                          <Badge variant="secondary" className="font-medium uppercase">
                            Featured
                          </Badge>
                        ) : null}
                        {article.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-primary mt-3 text-sm">Read article →</p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
