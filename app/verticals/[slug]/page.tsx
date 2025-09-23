import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  getVerticalArticles,
  getVerticalCaseStudies,
  getVerticalProjects,
} from "@/lib/supabase/queries";
import type { Vertical } from "@/lib/supabase/types";
import { getVerticalMeta } from "@/lib/verticals";

export default async function VerticalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getVerticalMeta(slug);

  if (!meta) {
    notFound();
  }

  const verticalSlug = meta.slug as Vertical;

  const [projects, caseStudies, articles] = await Promise.all([
    getVerticalProjects(verticalSlug),
    getVerticalCaseStudies(verticalSlug),
    getVerticalArticles(verticalSlug),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Badge variant="outline">{meta.title}</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">{meta.subtitle}</h1>
        <p className="text-muted-foreground text-lg">{meta.description}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Publish a project in this vertical to populate the list.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="group relative overflow-hidden">
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="absolute inset-0"
                  aria-label={project.title}
                />
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={project.hero_url || "/default-card.svg"}
                    alt=""
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </AspectRatio>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">{project.title}</CardTitle>
                  <CardDescription>{project.summary}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-foreground font-medium">Outcomes</p>
                  <ul className="text-muted-foreground mt-2 space-y-1">
                    {project.outcomes?.map((outcome) => (
                      <li key={outcome.metric}>
                        <span className="text-foreground font-medium">{outcome.metric}:</span>{" "}
                        {outcome.value}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Case studies</h2>
        {caseStudies.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Case studies in this vertical will appear here when published.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {caseStudies.map((study) => (
              <Card key={study.id} className="group relative overflow-hidden">
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="absolute inset-0"
                  aria-label={study.title}
                />
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={study.hero_url || "/default-card.svg"}
                    alt=""
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </AspectRatio>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">{study.title}</CardTitle>
                  <CardDescription>{study.summary}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-foreground font-medium">Metrics</p>
                  <ul className="text-muted-foreground mt-2 space-y-1">
                    {study.metrics
                      ? Object.entries(study.metrics).map(([metric, value]) => (
                        <li key={metric}>
                          <span className="text-foreground font-medium">{metric}:</span> {value}
                        </li>
                      ))
                      : null}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Articles</h2>
        {articles.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tag an article with this vertical to feature it here.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.id} className="group relative">
                <Link
                  href={`/articles/${article.slug}`}
                  className="absolute inset-0"
                  aria-label={article.title}
                />
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">{article.title}</CardTitle>
                  {article.summary ? <CardDescription>{article.summary}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  <span className="text-primary text-sm">Read article →</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
