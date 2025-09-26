export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { caseStudyMetricsEntries } from "@/lib/case-studies/metrics";
import {
  getPublishedCaseStudies,
  getPublishedProjects,
  getSiteSettings,
} from "@/lib/supabase/queries";

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const tagFilter = typeof sp.tag === "string" ? sp.tag.toLowerCase() : "";
  const [caseStudies, projects, settings] = await Promise.all([
    getPublishedCaseStudies(),
    getPublishedProjects(),
    getSiteSettings(),
  ]);
  const filtered = tagFilter
    ? caseStudies.filter((s) => (s.tags || []).some((t) => t.toLowerCase() === tagFilter))
    : caseStudies;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {settings?.studies_heading ?? "Case studies"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {settings?.studies_subheading ??
            "Detailed stories describing how security-led engineering accelerated delivery while improving trust."}
        </p>
      </header>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No case studies found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((study) => {
            const metrics = caseStudyMetricsEntries(study.metrics).slice(0, 3);
            return (
              <Card key={study.id} className="group relative flex flex-col overflow-hidden">
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
                  <CardTitle className="text-xl">
                    <span className="group-hover:underline">{study.title}</span>
                  </CardTitle>
                  <CardDescription>{study.summary}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 text-sm">
                  {metrics.length ? (
                    <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                      {metrics.map((metric) => (
                        <li key={metric.key}>
                          <span className="text-foreground font-medium">{metric.title}:</span>{" "}
                          {metric.description}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {study.featured ? (
                      <Badge variant="secondary" className="font-medium uppercase">
                        Featured
                      </Badge>
                    ) : null}
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {projects.length ? (
                    <div className="text-xs">
                      <span className="text-muted-foreground mr-2">Related:</span>
                      {projects
                        .filter((p) => p.tags.some((t) => study.tags.includes(t)))
                        .slice(0, 2)
                        .map((p) => (
                          <Link
                            key={p.id}
                            href={`/portfolio/${p.slug}`}
                            className="text-primary mr-2 hover:underline"
                          >
                            {p.title}
                          </Link>
                        ))}
                    </div>
                  ) : null}
                  <div className="text-muted-foreground text-xs">
                    {study.vertical.replace("-", " ")}
                  </div>
                  <span className="text-primary">Read case study →</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
