import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteProfile, getResumes } from "@/lib/supabase/queries";

export default async function ProfilePage() {
  const [profile, resumes] = await Promise.all([getSiteProfile(), getResumes()]);
  const avatarUrl = profile?.avatar_url ?? "/profile-placeholder.svg";
  const resumePref = profile?.resume_preference ?? "ai-security";
  const resumeLabel = resumes.find((r) => r.vertical === resumePref)?.label ?? "Resume";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border">
          <Image
            src={avatarUrl}
            alt={profile?.full_name ?? "Profile"}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {profile?.hiring_status ? (
              <Badge variant="outline" className="uppercase tracking-wide">
                {profile.hiring_status}
              </Badge>
            ) : null}
            {profile?.location ? (
              <span className="text-muted-foreground">{profile.location}</span>
            ) : null}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {profile?.full_name ?? "Profile"}
          </h1>
          {profile?.headline ? (
            <p className="text-muted-foreground text-lg">{profile.headline}</p>
          ) : null}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Overview for recruiters and interviewers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile?.summary ? (
              <p className="text-foreground text-base leading-relaxed">{profile.summary}</p>
            ) : (
              <p className="text-muted-foreground">Add a summary in Site Profile.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Default vertical preference</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <a href={`/resume/${resumePref}`} className="text-primary hover:underline">
              {resumeLabel} →
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hobbies</CardTitle>
            <CardDescription>Outside of work</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {profile?.hobbies && profile.hobbies.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {profile.hobbies.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : (
              <p>Add hobbies in Site Profile.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Special Interests</CardTitle>
            <CardDescription>What I’m exploring</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {profile?.interests && profile.interests.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {profile.interests.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : (
              <p>Add interests in Site Profile.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {(profile?.speaking && profile.speaking.length > 0) ||
      (profile?.certifications && profile.certifications.length > 0) ||
      (profile?.awards && profile.awards.length > 0) ? (
        <section className="grid gap-6 md:grid-cols-3">
          {profile?.speaking && profile.speaking.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Speaking</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <ul className="list-disc space-y-1 pl-5">
                  {profile.speaking.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {profile?.certifications && profile.certifications.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <ul className="list-disc space-y-1 pl-5">
                  {profile.certifications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {profile?.awards && profile.awards.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Awards</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <ul className="list-disc space-y-1 pl-5">
                  {profile.awards.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
