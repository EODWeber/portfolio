export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase/queries";
import { VerticalFilter } from "@/components/portfolio/vertical-filter";
import { VERTICALS } from "@/lib/verticals";
import type { Vertical } from "@/lib/supabase/types";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const selectedVerticals =
    typeof sp.verticals === "string" ? sp.verticals.split(",").filter(Boolean) : [];

  const [projects, settings] = await Promise.all([getPublishedProjects(), getSiteSettings()]);

  // Filter by search query
  const searchFiltered = q
    ? projects.filter((p) =>
        [p.title, p.summary, p.slug]
          .concat(p.tags ?? [])
          .concat(p.tech_stack ?? [])
          .some((v) => v?.toLowerCase().includes(q)),
      )
    : projects;

  // Filter by selected verticals
  const filtered =
    selectedVerticals.length > 0
      ? searchFiltered.filter((p) => selectedVerticals.includes(p.vertical))
      : searchFiltered;

  // Group by vertical
  const grouped = filtered.reduce<Record<string, typeof projects>>((acc, project) => {
    if (!acc[project.vertical]) acc[project.vertical] = [];
    acc[project.vertical].push(project);
    return acc;
  }, {});

  // Sort verticals to match the order in VERTICALS
  const verticalOrder = Object.keys(VERTICALS);
  const sortedKeys = Object.keys(grouped).sort(
    (a, b) => verticalOrder.indexOf(a) - verticalOrder.indexOf(b),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {settings?.portfolio_heading ?? "Portfolio"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {settings?.portfolio_subheading ??
            "A selection of recent initiatives across AI security, secure DevOps, and SOC automation."}
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <form className="flex-1">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Filter by title, tag, or stack..."
              className="border-input bg-background focus:ring-ring w-full max-w-md rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Filter projects"
            />
          </form>
          <VerticalFilter />
        </div>
      </header>

      {/* Projects by vertical */}
      {sortedKeys.length === 0 ? (
        <p className="text-muted-foreground text-sm">No portfolio entries match your filter.</p>
      ) : (
        sortedKeys.map((vertical) => {
          const meta = VERTICALS[vertical as Vertical];
          return (
            <section key={vertical} className="space-y-6">
              <div className="space-y-2 border-b pb-4">
                <div className="flex items-center gap-3">
                  {/* <Badge variant="outline" className="uppercase tracking-wide">
                    {vertical}
                  </Badge> */}
                  <h2 className="text-3xl font-semibold">{meta?.title ?? vertical}</h2>
                </div>
                {meta && (
                  <p className="text-muted-foreground max-w-3xl text-base">{meta.description}</p>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {grouped[vertical].map((project) => (
                  <Card
                    key={project.id}
                    className="group relative flex h-full flex-col overflow-hidden"
                  >
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="absolute inset-0"
                      aria-label={project.title}
                    />
                    <div className="relative h-40 w-full">
                      <Image
                        src={project.hero_url || "/default-card.svg"}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:underline">
                        {project.title}
                      </CardTitle>
                      <CardDescription>{project.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {project.featured ? (
                          <Badge variant="secondary" className="font-medium uppercase">
                            Featured
                          </Badge>
                        ) : null}
                        {project.tech_stack.map((tool) => (
                          <Badge key={tool} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-primary">Read more →</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
