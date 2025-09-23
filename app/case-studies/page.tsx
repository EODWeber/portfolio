import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getPublishedCaseStudies } from "@/lib/supabase/queries";

export default async function CaseStudiesPage() {
  const caseStudies = await getPublishedCaseStudies();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Case studies</h1>
        <p className="text-muted-foreground text-lg">
          Detailed stories describing how security-led engineering accelerated delivery while
          improving trust.
        </p>
      </header>

      {caseStudies.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No case studies are published yet. Seed the database or add a new entry from Supabase to
          view them here.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {caseStudies.map((study) => (
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
                <span className="text-primary">Read case study →</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
