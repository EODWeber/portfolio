import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import {
  getProfileCareerHighlights,
  getProfilePersonalEntries,
  getProfilePillars,
  getProfileRecognitions,
  getProfileSpeaking,
  getProfileTestimonials,
  getResumes,
  getSiteProfile,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { getSimpleIconBySlug } from "@/lib/simple-icons";

function buildCta(label?: string | null, url?: string | null) {
  if (!label || !url) return null;
  return { label, url };
}

export default async function ProfilePage() {
  const [
    profile,
    settings,
    resumes,
    pillars,
    careerHighlights,
    speaking,
    recognitions,
    testimonials,
    personalEntries,
  ] = await Promise.all([
    getSiteProfile(),
    getSiteSettings(),
    getResumes(),
    getProfilePillars(),
    getProfileCareerHighlights(),
    getProfileSpeaking(),
    getProfileRecognitions(),
    getProfileTestimonials(),
    getProfilePersonalEntries(),
  ]);

  if (!profile) {
    return null;
  }

  const avatarUrl = profile?.avatar_url || "/profile-placeholder.svg";
  const resumePref = profile.resume_preference ?? "ai-security";
  const resumeLabel = resumes.find((r) => r.vertical === resumePref)?.label ?? "Download resume";
  const primaryCta = buildCta(profile.cta_primary_label, profile.cta_primary_url);
  const secondaryCta = buildCta(profile.cta_secondary_label, profile.cta_secondary_url) ?? {
    label: "View resume",
    url: `/resume/${resumePref}`,
  };
  const careerCta = buildCta(profile.career_cta_label, profile.career_cta_url);

  // Social icons
  const githubIcon = getSimpleIconBySlug("github");
  const linkedinIcon = getSimpleIconBySlug("linkedin");
  const hasSocialLinks = settings?.github_url || settings?.linkedin_url;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-slate-50 shadow-lg lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-8">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {profile.full_name}
                </h1>
                {hasSocialLinks ? (
                  <div className="flex items-center gap-3 pt-1">
                    {settings?.github_url ? (
                      <Link
                        href={settings.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 transition-colors hover:text-slate-100"
                        aria-label="GitHub"
                      >
                        <svg
                          role="img"
                          viewBox="0 0 24 24"
                          className="h-8 w-8 fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>GitHub</title>
                          <path d={githubIcon?.path ?? ""} />
                        </svg>
                      </Link>
                    ) : null}
                    {settings?.linkedin_url ? (
                      <Link
                        href={settings.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 transition-colors hover:text-slate-100"
                        aria-label="LinkedIn"
                      >
                        <svg
                          role="img"
                          viewBox="0 0 24 24"
                          className="h-8 w-8 fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>LinkedIn</title>
                          <path d={linkedinIcon?.path ?? ""} />
                        </svg>
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {profile.phonetic_name || profile.pronouns ? (
                <p className="text-slate-300">
                  {profile.phonetic_name ? (
                    <>
                      {profile.phonetic_name}
                      {profile.pronouns ? " · " : ""}
                    </>
                  ) : null}
                  {profile.pronouns ?? null}
                </p>
              ) : null}

              <p className="mt-5 text-xl font-medium text-slate-200 sm:text-2xl">
                {profile.headline}
              </p>
              {profile.subheadline ? (
                <p className="-mt-3 text-slate-300">{profile.subheadline}</p>
              ) : null}
            </div>
            <p className="text-foreground text-med sm:text-med mt-3 leading-relaxed">
              {profile.summary}
            </p>
          </div>
          <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-full border border-white/20 bg-white/10 sm:h-52 sm:w-52">
            <Image
              src={avatarUrl}
              alt={profile.full_name}
              fill
              sizes="208px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {profile.philosophy ? (
        <section className="bg-muted/30 rounded-3xl border p-6 sm:p-8">
          <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            My philosophy
          </h2>
          <p className="text-foreground mt-3 text-lg leading-relaxed sm:text-xl">
            {profile.philosophy}
          </p>
        </section>
      ) : null}

      {pillars.length > 0 ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Core expertise pillars</h2>
            <p className="text-muted-foreground text-sm">
              Each pillar links to deeper proof—case studies, projects, or articles.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => {
              const icon = pillar.icon_slug ? getSimpleIconBySlug(pillar.icon_slug) : null;
              const content = (
                <Card className="border-muted-foreground/20 h-full shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <IconCircle
                      icon={icon}
                      className="border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                    />
                    <div className="space-y-2">
                      <h3 className="text-foreground text-lg font-semibold">{pillar.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                    {pillar.link_label && pillar.link_url ? (
                      <span className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium">
                        {pillar.link_label} →
                      </span>
                    ) : null}
                  </CardContent>
                </Card>
              );

              return pillar.link_label && pillar.link_url ? (
                <Link key={pillar.id} href={pillar.link_url} className="block h-full">
                  {content}
                </Link>
              ) : (
                <div key={pillar.id}>{content}</div>
              );
            })}
          </div>
        </section>
      ) : null}

      {careerHighlights.length > 0 ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Career highlights</h2>
            <p className="text-muted-foreground text-sm">
              A condensed timeline of engagements where measurable impact was delivered.
            </p>
          </div>
          <div className="relative pl-6">
            <span
              className="from-primary/60 via-primary/20 absolute left-2 top-1 h-full w-0.5 bg-gradient-to-b to-transparent"
              aria-hidden
            />
            <ol className="space-y-6">
              {careerHighlights.map((highlight) => (
                <li key={highlight.id} className="bg-muted/20 relative rounded-lg p-4 shadow-sm">
                  <span
                    className="border-primary bg-background absolute left-[-1.15rem] top-4 h-3 w-3 rounded-full border"
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-foreground text-lg font-semibold">{highlight.title}</h3>
                    {highlight.link_label && highlight.link_url ? (
                      <Link href={highlight.link_url} className="text-primary text-sm font-medium">
                        {highlight.link_label} →
                      </Link>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </li>
              ))}
            </ol>
            {careerCta ? (
              <div className="text-primary mt-6 text-sm font-medium">
                <Link href={careerCta.url}>{careerCta.label}</Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {speaking.length > 0 || recognitions.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {speaking.length > 0 ? (
            <div className="bg-card rounded-3xl border p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Speaking</h2>
              <p className="text-muted-foreground text-sm">Conferences, workshops, and talks.</p>
              <ul className="mt-4 space-y-3 text-sm">
                {speaking.map((entry) => (
                  <li key={entry.id} className="border-muted-foreground/20 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-foreground font-semibold">{entry.event}</span>
                      {entry.year ? (
                        <span className="text-muted-foreground text-xs">{entry.year}</span>
                      ) : null}
                    </div>
                    {entry.title ? <p className="text-muted-foreground">{entry.title}</p> : null}
                    {entry.link_url ? (
                      <Link href={entry.link_url} className="text-primary text-xs font-medium">
                        View details →
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {recognitions.length > 0 ? (
            <div className="bg-card rounded-3xl border p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Recognition</h2>
              <p className="text-muted-foreground text-sm">Certifications, awards, and features.</p>
              <ul className="mt-4 space-y-3 text-sm">
                {recognitions.map((item) => (
                  <li key={item.id} className="border-muted-foreground/20 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-foreground font-semibold">{item.title}</span>
                      {item.year ? (
                        <span className="text-muted-foreground text-xs">{item.year}</span>
                      ) : null}
                    </div>
                    {item.issuer ? <p className="text-muted-foreground">{item.issuer}</p> : null}
                    {item.link_url ? (
                      <Link href={item.link_url} className="text-primary text-xs font-medium">
                        Verify credential →
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Testimonials</h2>
            <p className="text-muted-foreground text-sm">
              What partners and leaders say about working together.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="border-muted-foreground/20 bg-background shadow-sm"
              >
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <p className="text-foreground text-lg font-medium leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div className="text-muted-foreground mt-auto text-sm">
                    <p className="text-foreground font-semibold">{testimonial.attribution}</p>
                    {testimonial.role ? <p>{testimonial.role}</p> : null}
                    {testimonial.link_url ? (
                      <Link
                        href={testimonial.link_url}
                        className="text-primary text-xs font-medium"
                      >
                        View source →
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {personalEntries.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Beyond work life</h2>
            <p className="text-muted-foreground text-sm">
              Human details that shape how collaboration feels.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {personalEntries.map((entry) => {
              const icon = entry.icon_slug ? getSimpleIconBySlug(entry.icon_slug) : null;
              return (
                <Card key={entry.id} className="border-muted-foreground/20 bg-muted/20">
                  <CardContent className="flex items-start gap-4 p-5">
                    <IconCircle icon={icon} className="border-muted-foreground/30 bg-background" />
                    <div className="space-y-1">
                      <h3 className="text-foreground text-lg font-semibold">{entry.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {(primaryCta || secondaryCta) && (
        <section className="border-primary/30 bg-primary/5 rounded-3xl border p-8 text-center">
          <h2 className="text-foreground text-2xl font-semibold">Ready to go deeper?</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Explore detailed proof points and tailor engagements that accelerate your security
            roadmap.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {primaryCta ? (
              <Button asChild size="lg">
                <Link href={primaryCta.url}>{primaryCta.label}</Link>
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryCta.url}>{secondaryCta.label ?? resumeLabel}</Link>
              </Button>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
