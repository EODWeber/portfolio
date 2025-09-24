import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import type { CaseStudyDoc } from "contentlayer/generated";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MDXServer } from "@/components/mdx/mdx-server";
import { findCaseStudyDoc, getMdxSourceOrNull } from "@/lib/content/resolve";
import {
  getCaseStudyBySlug,
  getVerticalProjects,
  getRelatedProjectsForCaseStudy,
} from "@/lib/supabase/queries";
import type { Vertical } from "@/lib/supabase/types";
import { formatMetricKey } from "@/lib/utils";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const caseStudy = await getCaseStudyBySlug(p.slug);

  if (!caseStudy) {
    notFound();
  }

  const [explicitRelated, verticalRelated] = await Promise.all([
    getRelatedProjectsForCaseStudy(caseStudy.id),
    getVerticalProjects(caseStudy.vertical as Vertical),
  ]);
  const relatedProjects = explicitRelated.length > 0 ? explicitRelated : verticalRelated;
  const doc = findCaseStudyDoc(caseStudy.body_path ?? "");
  const supabaseMdx = doc ? null : await getMdxSourceOrNull(caseStudy.body_path ?? "");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <Badge variant="outline" className="uppercase tracking-wide">
          {caseStudy.vertical}
        </Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{caseStudy.title}</h1>
          <p className="text-muted-foreground text-lg">{caseStudy.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {caseStudy.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Results</h2>
        {caseStudy.metrics ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(caseStudy.metrics).map(([metric, value]) => (
              <Card key={metric}>
                <CardHeader>
                  <CardTitle className="text-base">{formatMetricKey(metric)}</CardTitle>
                  <CardDescription>{value}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Add structured metrics in Supabase to display results.
          </p>
        )}
      </section>

      {doc ? (
        <MDXServer source={(doc as CaseStudyDoc).body.raw ?? ""} />
      ) : supabaseMdx ? (
        <MDXServer source={supabaseMdx} />
      ) : (
        <section className="text-muted-foreground space-y-3">
          <h2 className="text-foreground text-2xl font-semibold">Execution highlights</h2>
          <p>
            Provide a case study narrative at <code>{caseStudy.body_path}</code> to render the full
            story. Metrics and related projects still surface the essentials in the meantime.
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related projects</h2>
        {relatedProjects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Related projects will appear here when published.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {relatedProjects.map((project) => (
              <Card key={project.id} className="group relative">
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="absolute inset-0"
                  aria-label={project.title}
                />
                <CardHeader>
                  <CardTitle className="text-lg group-hover:underline">{project.title}</CardTitle>
                  <CardDescription>{project.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
