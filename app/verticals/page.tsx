export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedCaseStudies, getPublishedProjects } from "@/lib/supabase/queries";
import { verticalList } from "@/lib/verticals";

export default async function VerticalsPage() {
  const [projects, caseStudies] = await Promise.all([
    getPublishedProjects(),
    getPublishedCaseStudies(),
  ]);

  const projectCounts = projects.reduce<Record<string, number>>((acc, project) => {
    acc[project.vertical] = (acc[project.vertical] ?? 0) + 1;
    return acc;
  }, {});

  const caseStudyCounts = caseStudies.reduce<Record<string, number>>((acc, study) => {
    acc[study.vertical] = (acc[study.vertical] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4 text-center">
        <Badge variant="outline">Vertical expertise</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          Focused capabilities across three critical domains.
        </h1>
        <p className="text-muted-foreground text-lg">
          Each vertical combines engineering leadership with measurable outcomes—backed by Supabase
          data and case studies detailed throughout the site.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {verticalList.map((vertical) => (
          <Card key={vertical.slug} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl">{vertical.title}</CardTitle>
              <CardDescription>{vertical.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">{vertical.description}</p>
              <div className="text-muted-foreground flex gap-4 text-sm">
                <div>
                  <span className="text-foreground font-semibold">
                    {projectCounts[vertical.slug] ?? 0}
                  </span>{" "}
                  projects
                </div>
                <div>
                  <span className="text-foreground font-semibold">
                    {caseStudyCounts[vertical.slug] ?? 0}
                  </span>{" "}
                  case studies
                </div>
              </div>
              <Button asChild variant="outline" className="w-fit">
                <Link href={`/verticals/${vertical.slug}`}>{vertical.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
