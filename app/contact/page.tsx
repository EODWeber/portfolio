import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { IconCircle } from "@/components/ui/icon-circle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getContactLinks,
  getResumes,
  getSiteProfile,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { getHostFromUrl, getSimpleIconBySlug, guessSimpleIconSlug } from "@/lib/simple-icons";
import type { ContactLink, Vertical } from "@/lib/supabase/types";
import type { SimpleIcon } from "simple-icons";

import { ContactForm } from "./contact-form";

const verticalLabels: Record<Vertical, string> = {
  "ai-security": "AI Security",
  "secure-devops": "Secure DevOps",
  soc: "SOC",
};

type IconFallback = "globe" | "mail";

function formatCategory(value: string): string {
  const sanitized = value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!sanitized) return "Contact";
  return sanitized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveCategory(
  link: ContactLink,
  icon: SimpleIcon | null,
  fallback: IconFallback,
): string {
  if (link.category && link.category.trim()) {
    return formatCategory(link.category);
  }
  if (fallback === "mail") {
    return "Email";
  }
  if (icon?.title) {
    return icon.title;
  }
  const host = getHostFromUrl(link.url);
  if (host) {
    return formatCategory(host);
  }
  return "Contact";
}

function resolveContactIcon(link: ContactLink): {
  icon: SimpleIcon | null;
  fallback: IconFallback;
} {
  const url = link.url.trim();
  if (url.toLowerCase().startsWith("mailto:")) {
    return { icon: null, fallback: "mail" };
  }

  const slug = guessSimpleIconSlug({
    slug: link.icon,
    label: link.label,
    category: link.category,
    url: link.url,
  });

  const icon = slug ? getSimpleIconBySlug(slug) : null;
  return { icon, fallback: "globe" };
}

export default async function ContactPage() {
  const [profile, contacts, resumes, settings] = await Promise.all([
    getSiteProfile(),
    getContactLinks(),
    getResumes(),
    getSiteSettings(),
  ]);
  const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const primaryResumes = resumes.filter((resume) => resume.featured && !resume.archived);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Badge variant="outline">Let’s collaborate</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          {settings?.contact_heading ?? `Connect with ${profile?.full_name ?? "Jeff"}`}
        </h1>
        <p className="text-muted-foreground text-lg">
          {settings?.contact_subheading ?? profile?.summary ?? ""}
        </p>
      </header>

      {/* Send a message (top) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Send a message</h2>
        <Card>
          <CardHeader>
            <CardTitle>Contact form</CardTitle>
            <CardDescription>
              Send me a message using the form below, or reach out via any of the channels listed
              further down.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm siteKey={siteKey} />
          </CardContent>
        </Card>
      </section>

      {profile?.location ? (
        <Card className="border-primary/30 bg-primary/10">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>{profile.location}</CardDescription>
          </CardHeader>
          {profile.hiring_status ? (
            <CardContent className="text-muted-foreground text-sm">
              {profile.hiring_status}
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Resumes</h2>
        <p className="text-muted-foreground text-sm">
          Download tailored resumes or grab all primary variants in a single batch.
        </p>
        {primaryResumes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Upload resume PDFs to Supabase Storage and mark them as primary in the admin portal to
            expose download links here.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            <Card className="border-primary/40 bg-primary/10 relative py-1">
              <Link
                href="/resume/primary"
                className="absolute inset-0"
                aria-label="Batch download primary resumes"
              />
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Batch download</CardTitle>
                <CardDescription className="text-xs">
                  Opens each resume in a new tab for quick access.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-primary -mt-2 pt-0 text-xs">
                Download all primary resumes →
              </CardContent>
            </Card>
            {primaryResumes.map((resume) => (
              <Card key={resume.id} className="border-primary/30 bg-primary/5 relative py-1">
                <Link
                  href={`/resume/${resume.vertical}`}
                  className="absolute inset-0"
                  aria-label={resume.label}
                />
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">
                    <div className="text-muted-foreground flex items-center justify-between gap-2">
                      {resume.label}
                      <Badge variant="secondary" className="uppercase tracking-wide">
                        {verticalLabels[resume.vertical] ?? resume.vertical}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="-mt-2 mb-2 space-y-2 pt-0 text-xs">
                  <span className="text-primary block">Generate secure download →</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Existing channels & other sections remain below */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Channels</h2>
        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add contact links via the admin Contact Links page to populate this section.
          </p>
        ) : (
          <div className="grid auto-rows-fr gap-3 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
            {contacts.map((link) => {
              const { icon, fallback } = resolveContactIcon(link);
              const categoryLabel = resolveCategory(link, icon, fallback);
              const card = (
                <Card className="hover:border-primary/40 hover:bg-primary/5 h-full py-0 transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="gap-2 px-4 py-3">
                    <CardTitle className="text-foreground text-sm font-semibold leading-tight">
                      <div className="text-muted-foreground flex items-center justify-between gap-2">
                        {link.label}
                        <IconCircle icon={icon} fallback={fallback} />
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                        {categoryLabel}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              );

              const commonClasses =
                "group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

              if (link.url.startsWith("/")) {
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    className={commonClasses}
                    prefetch={false}
                    aria-label={link.label}
                  >
                    {card}
                  </Link>
                );
              }

              const isHttp = link.url.startsWith("http");
              return (
                <a
                  key={link.id}
                  href={link.url}
                  className={commonClasses}
                  target={isHttp ? "_blank" : undefined}
                  rel={isHttp ? "noreferrer noopener" : undefined}
                  aria-label={link.label}
                >
                  {card}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
