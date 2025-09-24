import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MDXServer } from "@/components/mdx/mdx-server";
import type { ArticleDoc } from "contentlayer/generated";
import { findArticleDoc, getMdxSourceOrNull } from "@/lib/content/resolve";
import {
  getArticleBySlug,
  getPublishedArticles,
  getPublishedCaseStudies,
  getPublishedProjects,
} from "@/lib/supabase/queries";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
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
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">TL;DR</CardTitle>
                <CardDescription className="text-foreground text-sm">
                  {article.summary}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </div>
      </header>
      {doc ? (
        <MDXServer source={(doc as ArticleDoc).body.raw ?? ""} />
      ) : (
        <MDXServer source={supabaseMdx ?? ""} />
      )}
      {/* Related content */}
      <RelatedContent currentSlug={article.slug} currentTags={article.tags} />
    </div>
  );
}

async function RelatedContent({
  currentSlug,
  currentTags,
}: {
  currentSlug: string;
  currentTags: string[];
}) {
  const [projects, studies, articles] = await Promise.all([
    getPublishedProjects(),
    getPublishedCaseStudies(),
    getPublishedArticles(),
  ]);
  const hasOverlap = (tags: string[]) => tags.some((t) => currentTags.includes(t));
  const relatedProjects = projects.filter((p) => hasOverlap(p.tags)).slice(0, 3);
  const relatedStudies = studies.filter((s) => hasOverlap(s.tags)).slice(0, 3);
  const relatedArticles = articles
    .filter((a) => a.slug !== currentSlug && hasOverlap(a.tags))
    .slice(0, 3);

  if (relatedProjects.length + relatedStudies.length + relatedArticles.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Related</h2>
      <div className="grid gap-4">
        {relatedProjects.length ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-medium uppercase">Projects</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedProjects.map((project) => (
                <Card key={project.id} className="group relative">
                  <a
                    href={`/portfolio/${project.slug}`}
                    className="absolute inset-0"
                    aria-label={project.title}
                  />
                  <CardHeader>
                    <CardTitle className="text-base group-hover:underline">
                      {project.title}
                    </CardTitle>
                    <CardDescription>{project.summary}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
        {relatedStudies.length ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-medium uppercase">
              Case studies
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedStudies.map((study) => (
                <Card key={study.id} className="group relative">
                  <a
                    href={`/case-studies/${study.slug}`}
                    className="absolute inset-0"
                    aria-label={study.title}
                  />
                  <CardHeader>
                    <CardTitle className="text-base group-hover:underline">{study.title}</CardTitle>
                    <CardDescription>{study.summary}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
        {relatedArticles.length ? (
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-medium uppercase">Articles</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedArticles.map((a) => (
                <Card key={a.id} className="group relative">
                  <a
                    href={`/articles/${a.slug}`}
                    className="absolute inset-0"
                    aria-label={a.title}
                  />
                  <CardHeader>
                    <CardTitle className="text-base group-hover:underline">{a.title}</CardTitle>
                    {a.summary ? <CardDescription>{a.summary}</CardDescription> : null}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
