import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siGithub, siX, siLinkedin, siYoutube, siRss } from "simple-icons";
import { getFeaturedProjects, getFeaturedArticles, getFeaturedCaseStudies, getSiteProfile, getSiteSettings, getSocialPosts } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [settings, profile, projects, caseStudies, articles, posts] = await Promise.all([
    getSiteSettings(),
    getSiteProfile(),
    getFeaturedProjects(3),
    getFeaturedCaseStudies(2),
    getFeaturedArticles(3),
    getSocialPosts(3),
  ]);

  const headline = profile?.headline ?? settings?.site_tagline ?? "Secure outcomes for AI & cloud";
  const summary =
    profile?.summary ??
    "I help security and platform teams ship confidently—combining AI security, secure DevOps, and SOC automation to deliver measurable outcomes.";
  const hiringStatus = profile?.hiring_status ?? "Open to impactful security leadership roles";
  const primaryCtaLabel = settings?.primary_cta_label ?? "View portfolio";
  const primaryCtaUrl = settings?.primary_cta_url ?? "/portfolio";
  const secondaryCtaLabel = settings?.secondary_cta_label ?? "See case studies";
  const secondaryCtaUrl = settings?.secondary_cta_url ?? "/case-studies";
  const avatarUrl = profile?.avatar_url ?? "/profile-placeholder.svg";
  const location = profile?.location ?? "Remote-first";

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
              <div className="absolute inset-0 rounded-[28%_72%_64%_36%/37%_39%_61%_63%] bg-gradient-to-br from-primary/30 to-primary/10 blur"></div>
              <div className="relative mx-auto h-full w-full overflow-hidden rounded-[28%_72%_64%_36%/37%_39%_61%_63%] ring-2 ring-primary/30 shadow-xl">
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
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{headline}</h1>
                <p className="text-muted-foreground text-lg">{summary}</p>
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
              <CardDescription>Proof points surfaced from Supabase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile?.highlights && profile.highlights.length > 0 ? (
                profile.highlights.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="border-border/40 bg-muted/30 rounded-md border px-3 py-2"
                  >
                    <p className="text-foreground font-medium">{highlight.label}</p>
                    {highlight.value ? (
                      <p className="text-muted-foreground text-xs">{highlight.value}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Add highlights in the Site Profile admin page to showcase measurable outcomes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured projects</h2>
            <p className="text-muted-foreground">
              Supabase-backed casework demonstrating measurable outcomes.
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
                  <div className="h-36 w-full animate-pulse bg-muted" />
                  <CardHeader>
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="group relative flex flex-col overflow-hidden">
                <Link href={`/portfolio/${project.slug}`} className="absolute inset-0" aria-label={project.title} />
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
            <h2 className="text-2xl font-semibold">Recent case studies</h2>
            <p className="text-muted-foreground">
              Deep dives into secure delivery, AI governance, and SOC automation.
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
                  <div className="h-36 w-full animate-pulse bg-muted" />
                  <CardHeader>
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            caseStudies.slice(0, 2).map((study) => (
              <Card key={study.id} className="group relative overflow-hidden">
                <Link href={`/case-studies/${study.slug}`} className="absolute inset-0" aria-label={study.title} />
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
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Articles</h2>
            <p className="text-muted-foreground">
              Research, playbooks, and frameworks for security-first delivery.
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
                  <div className="h-36 w-full animate-pulse bg-muted" />
                  <CardHeader>
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            articles.slice(0, 3).map((article) => (
              <Card key={article.id} className="group relative overflow-hidden">
                <Link href={`/articles/${article.slug}`} className="absolute inset-0" aria-label={article.title} />
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
            <h2 className="text-2xl font-semibold">Social feed</h2>
            <p className="text-muted-foreground">Appearances, repos, and talks worth a follow.</p>
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
              const p = post.platform.toLowerCase();
              const icon = p.includes("github")
                ? siGithub
                : p.includes("x") || p.includes("twitter")
                ? siX
                : p.includes("linkedin")
                ? siLinkedin
                : p.includes("youtube")
                ? siYoutube
                : siRss;
              return (
                <Card key={post.id} className="group relative">
                  <Link href={post.url} target="_blank" rel="noreferrer" className="absolute inset-0" aria-label={post.title} />
                  <CardHeader>
                    <CardTitle className="text-base group-hover:underline">{post.title}</CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(post.posted_at).toLocaleDateString()}</span>
                      {post.featured ? (
                        <Badge variant="secondary" className="font-medium uppercase">
                          Featured
                        </Badge>
                      ) : null}
                      <span
                        aria-hidden
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: `#${icon.hex}` }}
                        title={post.platform}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d={icon.path} />
                        </svg>
                      </span>
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
