import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MDXServer } from "@/components/mdx/mdx-server";
import type { ArticleDoc } from "contentlayer/generated";
import { findArticleDoc, getMdxSourceOrNull } from "@/lib/content/resolve";
import { getArticleBySlug } from "@/lib/supabase/queries";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const article = await getArticleBySlug(p.slug);

  if (!article) {
    notFound();
  }

  const doc = findArticleDoc(article.body_path ?? "");
  const supabaseMdx = doc ? null : await getMdxSourceOrNull(article.body_path ?? "");

  if (!doc && !supabaseMdx) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">{article.title}</h1>
            {article.summary ? (
              <p className="text-muted-foreground text-lg">{article.summary}</p>
            ) : null}
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Content missing</CardTitle>
            <CardDescription>
              Provide an MDX document at <code>{article.body_path}</code> to render the full
              article.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            The metadata already lives in Supabase—add the MDX file to `content/` and redeploy.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={article.hero_url || "/default-card.svg"}
            alt=""
            fill
            sizes="100vw"
            className="rounded-md object-cover"
          />
        </AspectRatio>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{article.title}</h1>
          {article.summary ? (
            <p className="text-muted-foreground text-lg">{article.summary}</p>
          ) : null}
        </div>
      </header>
      {doc ? (
        <MDXServer source={(doc as ArticleDoc).body.raw ?? ""} />
      ) : (
        <MDXServer source={supabaseMdx ?? ""} />
      )}
    </div>
  );
}
