import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectBySlug, getVerticalCaseStudies } from "@/lib/supabase/queries";
import type { Vertical } from "@/lib/supabase/types";

type ProjectPageProps = {
  params: { slug: string };
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const relatedCaseStudies = await getVerticalCaseStudies(project.vertical as Vertical);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <Badge variant="outline" className="uppercase tracking-wide">
          {project.vertical}
        </Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground text-lg">{project.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Outcomes</h2>
        {project.outcomes?.length ? (
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            {project.outcomes.map((outcome) => (
              <li key={outcome.metric}>
                <span className="text-foreground font-medium">{outcome.metric}:</span>{" "}
                {outcome.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Add outcomes in Supabase to highlight impact.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Tech stack</h2>
        <div className="flex flex-wrap gap-2">
          {project.tech_stack.map((tool) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
        </div>
      </section>

      {project.repo_url ? (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Repository</CardTitle>
              <CardDescription>
                Source code and infrastructure as code related to this engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                View GitHub repo →
              </Link>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related case studies</h2>
        {relatedCaseStudies.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Publish a case study with the same vertical to cross-link it here.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {relatedCaseStudies.map((study) => (
              <Card key={study.id} className="group relative">
                <Link href={`/case-studies/${study.slug}`} className="absolute inset-0" aria-label={study.title} />
                <CardHeader>
                  <CardTitle className="text-lg group-hover:underline">{study.title}</CardTitle>
                  <CardDescription>{study.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
