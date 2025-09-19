import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getContactLinks, getResumes, getSiteProfile } from "@/lib/supabase/queries";

import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const [profile, contacts, resumes] = await Promise.all([
    getSiteProfile(),
    getContactLinks(),
    getResumes(),
  ]);
  const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Badge variant="outline">Let’s collaborate</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          Connect with {profile?.full_name ?? "Jeff"}
        </h1>
        {profile?.summary ? (
          <p className="text-muted-foreground text-lg">{profile.summary}</p>
        ) : null}
      </header>

      {/* Send a message (top) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Send a message</h2>
        <Card>
          <CardHeader>
            <CardTitle>Contact form</CardTitle>
            <CardDescription>
              This message routes directly to Jeff. All submissions are stored securely in Supabase
              for follow-up.
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
        {resumes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Upload resume PDFs to Supabase Storage and manage entries in the admin portal to expose
            download links here.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {resumes.map((resume) => (
              <Card key={resume.id} className="border-primary/30 bg-primary/5 py-1">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">{resume.label}</CardTitle>
                  <CardDescription className="text-xs">
                    Updated {new Date(resume.updated_at).toLocaleDateString()} ·{" "}
                    {resume.vertical.replace("-", " ")}
                    focus.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 -mt-3">
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

      {/* Existing channels & other sections remain below */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Channels</h2>
        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add contact links in Supabase (or via the admin Contact Links page) to populate this
            section.
          </p>
        ) : (
          <div className="grid gap-4">
            {contacts.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{link.label}</CardTitle>
                  {link.category ? <CardDescription>{link.category}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  <Link
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    {link.url}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
