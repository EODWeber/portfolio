export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { IconCircle } from "@/components/ui/icon-circle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { caseStudyMetricsEntries } from "@/lib/case-studies/metrics";
import { getSimpleIconBySlug, guessSimpleIconSlug } from "@/lib/simple-icons";
import { caseStudyMetricsEntries } from "@/lib/case-studies/metrics";
import { getSimpleIconBySlug, guessSimpleIconSlug } from "@/lib/simple-icons";
import {
  getFeaturedProjects,
  getFeaturedArticles,
  getFeaturedCaseStudies,
  getSiteProfile,
  getSiteSettings,
  getSocialPosts,
} from "@/lib/supabase/queries";

export default async function HomePage() {
  const [settings, profile, projects, caseStudies, articles, posts] = await Promise.all([
    getSiteSettings(),
    getSiteProfile(),
    getFeaturedProjects(3),
    getFeaturedCaseStudies(2),
    getFeaturedCaseStudies(2),
    getFeaturedArticles(3),
    getSocialPosts(3),
  ]);

  const heroHeading =
    settings?.hero_heading ??
    profile?.headline ??
    settings?.site_tagline ??
    "Security-led engineering for AI & cloud";
  const heroSubheading =
    settings?.hero_subheading ??
    profile?.summary ??
    "Partnering with product, platform, and security teams to accelerate delivery while improving trust—AI security, secure DevOps, and SOC automation.";
  const hiringStatus =
    settings?.hiring_status ??
    profile?.hiring_status ??
    "Open to high‑impact security leadership roles";
  const primaryCtaLabel = settings?.primary_cta_label ?? "View portfolio";
  const primaryCtaUrl = settings?.primary_cta_url ?? "/portfolio";
  const secondaryCtaLabel = settings?.secondary_cta_label ?? "Explore case studies";
  const secondaryCtaUrl = settings?.secondary_cta_url ?? "/case-studies";
  const avatarUrl = profile?.avatar_url ?? "/profile-placeholder.svg";
  const location = settings?.location ?? profile?.location ?? "Remote-first";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <section className="from-primary/10 via-background to-background relative overflow-hidden rounded-3xl border bg-gradient-to-br">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-10 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-32 w-32 flex-shrink-0 sm:h-40 sm:w-40">
              <div className="from-primary/30 to-primary/10 absolute inset-0 rounded-[28%_72%_64%_36%/37%_39%_61%_63%] bg-gradient-to-br blur"></div>
              <div className="ring-primary/30 relative mx-auto h-full w-full overflow-hidden rounded-[28%_72%_64%_36%/37%_39%_61%_63%] shadow-xl ring-2">
                <Image
                  src={avatarUrl}
                  alt={profile?.full_name ?? "Profile avatar"}
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="outline" className="text-xs uppercase tracking-wide">
                  {hiringStatus}
                </Badge>
                <span className="text-muted-foreground">{location}</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{heroHeading}</h1>
                <p className="text-muted-foreground text-lg">{heroSubheading}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={primaryCtaUrl}>{primaryCtaLabel}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={secondaryCtaUrl}>{secondaryCtaLabel}</Link>
                </Button>
              </div>
            </div>
          </div>
          <Card className="border-border/50 bg-background/80 w-full max-w-sm shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle>Recent highlights</CardTitle>
              <CardTitle>Recent highlights</CardTitle>
              <CardDescription>Measurable outcomes tied to case studies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile?.highlights && profile.highlights.length > 0 ? (
                profile.highlights.map((highlight) => {
                  const tag = encodeURIComponent(highlight.label);
                  return (
                    <Link
                      key={highlight.label}
                      href={`/case-studies?tag=${tag}`}
                      className="border-border/40 bg-muted/30 hover:bg-muted/50 focus-visible:ring-ring block rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      <p className="text-foreground font-medium">{highlight.label}</p>
                      {highlight.value ? (
                        <p className="text-muted-foreground text-xs">{highlight.value}</p>
                      ) : null}
                    </Link>
                  );
                })
              ) : (
                <p className="text-muted-foreground">
                  Add highlights in the Site Profile to showcase measurable outcomes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {settings?.home_projects_heading ?? "Featured projects"}
            </h2>
            <p className="text-muted-foreground">
              {settings?.home_projects_subheading ??
                "Supabase-backed casework demonstrating measurable outcomes."}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/portfolio">Browse all projects →</Link>
          </Button>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <>
              {[0, 1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="bg-muted h-36 w-full animate-pulse" />
                  <CardHeader>
                    <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="group relative flex flex-col overflow-hidden">
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="absolute inset-0"
                  aria-label={project.title}
                />
                <div className="relative h-36 w-full">
                  <Image
                    src={project.hero_url || "/default-card.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">{project.title}</CardTitle>
                  <CardDescription>{project.summary}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-primary">Read the build →</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {settings?.home_studies_heading ?? "Recent case studies"}
            </h2>
            <p className="text-muted-foreground">
              {settings?.home_studies_subheading ??
                "Deep dives into secure delivery, AI governance, and SOC automation."}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/case-studies">View all case studies →</Link>
          </Button>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {caseStudies.length === 0 ? (
            <>
              {[0, 1].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="bg-muted h-36 w-full animate-pulse" />
                  <CardHeader>
                    <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            caseStudies.slice(0, 2).map((study) => {
              const metrics = caseStudyMetricsEntries(study.metrics);
              const metrics = caseStudyMetricsEntries(study.metrics);
              return (
                <Card key={study.id} className="group relative overflow-hidden">
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="absolute inset-0"
                    aria-label={study.title}
                  />
                  <div className="relative h-36 w-full">
                    <Image
                      src={study.hero_url || "/default-card.svg"}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:underline">{study.title}</CardTitle>
                    <CardDescription>{study.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-foreground font-medium">Key metrics</p>
                    {metrics.length === 0 ? (
                      <p className="text-muted-foreground mt-2">
                        Add metric details to highlight outcomes.
                      </p>
                    ) : (
                      <ul className="text-muted-foreground mt-2 space-y-1">
                        {metrics.map(({ key, title, description }) => (
                          <li key={key}>
                            <span className="text-foreground font-medium">{title}:</span>{" "}
                            {description}
                          </li>
                        ))}
                      </ul>
                    )}
                    {metrics.length === 0 ? (
                      <p className="text-muted-foreground mt-2">
                        Add metric details to highlight outcomes.
                      </p>
                    ) : (
                      <ul className="text-muted-foreground mt-2 space-y-1">
                        {metrics.map(({ key, title, description }) => (
                          <li key={key}>
                            <span className="text-foreground font-medium">{title}:</span>{" "}
                            {description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {settings?.home_articles_heading ?? "Articles"}
            </h2>
            <p className="text-muted-foreground">
              {settings?.home_articles_subheading ??
                "Research, playbooks, and frameworks for security-first delivery."}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/articles">Browse all articles →</Link>
          </Button>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.length === 0 ? (
            <>
              {[0, 1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="bg-muted h-36 w-full animate-pulse" />
                  <CardHeader>
                    <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            articles.slice(0, 3).map((article) => (
              <Card key={article.id} className="group relative overflow-hidden">
                <Link
                  href={`/articles/${article.slug}`}
                  className="absolute inset-0"
                  aria-label={article.title}
                />
                <div className="relative h-36 w-full">
                  <Image
                    src={article.hero_url || "/default-card.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">{article.title}</CardTitle>
                  {article.summary ? <CardDescription>{article.summary}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  <span className="text-primary text-sm">Read article →</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {settings?.home_social_heading ?? "Social feed"}
            </h2>
            <p className="text-muted-foreground">
              {settings?.home_social_subheading ?? "Appearances, repos, and talks worth a follow."}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/social-feed">Open feed →</Link>
          </Button>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-10 text-sm">
                Publish social signals to populate the feed.
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const slug = guessSimpleIconSlug({ platform: post.platform, url: post.url });
              const icon = slug ? getSimpleIconBySlug(slug) : null;
              const postedAt = new Date(post.posted_at).toLocaleDateString();
              const slug = guessSimpleIconSlug({ platform: post.platform, url: post.url });
              const icon = slug ? getSimpleIconBySlug(slug) : null;
              const postedAt = new Date(post.posted_at).toLocaleDateString();
              return (
                <Card key={post.id} className="group relative">
                  <Link
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0"
                    aria-label={post.title}
                  />
                  <CardHeader>
                    <CardTitle className="text-base group-hover:underline">{post.title}</CardTitle>
                    <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <IconCircle icon={icon} fallback="globe" />
                      <span className="text-foreground font-semibold uppercase tracking-wide">
                        {post.platform}
                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <IconCircle icon={icon} fallback="globe" />
                          <span className="text-foreground font-semibold uppercase tracking-wide">
                            {post.platform}
                          </span>
                          <span>{postedAt}</span>
                          {post.featured ? (
                            <Badge variant="secondary" className="font-medium uppercase">
                              Featured
                            </Badge>
                          ) : null}
                          <span>{postedAt}</span>
                          {post.featured ? (
                            <Badge variant="secondary" className="font-medium uppercase">
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {post.summary ? <p className="text-muted-foreground">{post.summary}</p> : null}
                        <span className="text-primary">View post →</span>
                      </CardContent>
                    </Card>
                    );
            })
          )}
                  </div>
                </section>
    </div>
        );
}
