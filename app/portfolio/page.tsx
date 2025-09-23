export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedProjects, getResumes } from "@/lib/supabase/queries";

export default async function PortfolioPage() {
  const [projects, resumes] = await Promise.all([getPublishedProjects(), getResumes()]);

  const grouped = projects.reduce<Record<string, typeof projects>>((acc, project) => {
    if (!acc[project.vertical]) acc[project.vertical] = [];
    acc[project.vertical].push(project);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground text-lg">
          A selection of recent engineering initiatives across AI security, secure DevOps, and SOC
          automation. Each item pulls directly from Supabase for fast updates.
        </p>
      </header>

      {/* Resumes first */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Downloadable resumes</h2>
            <p className="text-muted-foreground text-sm">
              Tailored resumes hosted in Supabase Storage for quick recruiter access.
            </p>
          </div>
          <CardDescription className="hidden sm:block">
            Also listed on the Contact page.
          </CardDescription>
        </div>
        {resumes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Upload resume PDFs to the Supabase `resumes` bucket and manage entries in the admin
            portal to display them here.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="py-1">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">{resume.label}</CardTitle>
                  <CardDescription className="text-xs">
                    Optimized for {resume.vertical.replace("-", " ")} roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="-mt-3 pt-0">
                  <Link
                    href={`/resume/${resume.vertical}`}
                    className="text-primary text-xs hover:underline"
                  >
                    Generate secure download →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Projects by vertical */}
      {sortedKeys.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No portfolio entries are published. Run `.docs/SUPABASE_SEED.sql` or add content via
          Supabase to populate the list.
        </p>
      ) : (
        sortedKeys.map((vertical) => (
          <section key={vertical} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="uppercase tracking-wide">
                {vertical}
              </Badge>
              <h2 className="text-2xl font-semibold">{vertical.replace("-", " ")}</h2>
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
                    <CardTitle className="text-xl group-hover:underline">{project.title}</CardTitle>
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
        ))
      )}
    </div>
  );
}
