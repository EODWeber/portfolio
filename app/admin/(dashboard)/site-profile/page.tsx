import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchProfileCareerHighlights,
  fetchProfilePersonalEntries,
  fetchProfilePillars,
  fetchProfileRecognitions,
  fetchProfileSpeaking,
  fetchProfileTestimonials,
  fetchSiteProfile,
} from "@/lib/admin/queries";

import { upsertSiteProfile } from "./actions";
import { CareerHighlightsManager } from "./career-highlights-manager";
import { PersonalEntriesManager } from "./personal-entries-manager";
import { PillarsManager } from "./pillars-manager";
import { RecognitionManager } from "./recognition-manager";
import { SpeakingManager } from "./speaking-manager";
import { TestimonialsManager } from "./testimonials-manager";

function matchStatus(status: string | undefined, prefix: string) {
  return status && status.startsWith(prefix) ? status : undefined;
}

export default async function SiteProfileAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp?.status === "string" ? sp.status : undefined;
  const detail = typeof sp?.what === "string" ? sp.what : undefined;

  const [
    profile,
    pillars,
    highlights,
    speaking,
    recognitions,
    testimonials,
    personalEntries,
  ] = await Promise.all([
    fetchSiteProfile(),
    fetchProfilePillars(),
    fetchProfileCareerHighlights(),
    fetchProfileSpeaking(),
    fetchProfileRecognitions(),
    fetchProfileTestimonials(),
    fetchProfilePersonalEntries(),
  ]);

  const avatarUrl = profile?.avatar_url || "/profile-placeholder.svg";
  const profileSaved = status === "profile-saved";
  const pillarStatus = matchStatus(status, "pillar-");
  const careerStatus = matchStatus(status, "career-");
  const speakingStatus = matchStatus(status, "speaking-");
  const recognitionStatus = matchStatus(status, "recognition-");
  const testimonialStatus = matchStatus(status, "testimonial-");
  const personalStatus = matchStatus(status, "personal-");

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Site profile</h1>
        <p className="text-muted-foreground text-sm">
          Design the public profile experience. Update the hero, philosophy, CTAs, and supporting credibility blocks.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile preview</CardTitle>
            <CardDescription>Approximation of the hero area rendered on the public /profile page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-slate-50 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                    {profile?.hiring_status ? (
                      <Badge variant="secondary" className="border-white/10 bg-white/10 font-medium text-white">
                        {profile.hiring_status}
                      </Badge>
                    ) : null}
                    {profile?.pronouns ? (
                      <Badge variant="outline" className="border-white/20 bg-white/5 text-white">
                        {profile.pronouns}
                      </Badge>
                    ) : null}
                    {profile?.phonetic_name ? (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[0.7rem] text-slate-200">
                        Pronounced {profile.phonetic_name}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300">{profile?.location ?? "Add location or availability"}</p>
                    <h2 className="text-3xl font-semibold tracking-tight">
                      {profile?.full_name ?? "Your name"}
                    </h2>
                    <p className="text-xl font-medium text-slate-200">
                      {profile?.headline ?? "Security-first engineering leader."}
                    </p>
                    {profile?.subheadline ? (
                      <p className="text-slate-300">{profile.subheadline}</p>
                    ) : null}
                  </div>
                  {profile?.summary ? (
                    <p className="text-sm leading-relaxed text-slate-300">{profile.summary}</p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      Use the summary to anchor why your perspective matters.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {profile?.cta_primary_label && profile.cta_primary_url ? (
                      <Button size="sm" variant="secondary" className="bg-white text-slate-900 hover:bg-white/90">
                        {profile.cta_primary_label}
                      </Button>
                    ) : null}
                    {profile?.cta_secondary_label && profile.cta_secondary_url ? (
                      <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        {profile.cta_secondary_label}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border border-white/20 bg-white/10 sm:h-40 sm:w-40">
                  <Image src={avatarUrl} alt={profile?.full_name ?? "Profile"} fill sizes="160px" className="object-cover" />
                </div>
              </div>
            </div>
            {profile?.philosophy ? (
              <div className="rounded-2xl border bg-muted/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My philosophy</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.philosophy}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>
              Craft the hero narrative. Keep full name and headline concise; use the philosophy to add voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertSiteProfile} className="space-y-5">
              <input type="hidden" name="id" defaultValue={profile?.id ?? ""} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="full_name">
                  Full name
                </label>
                <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="pronouns">
                    Pronouns
                  </label>
                  <Input id="pronouns" name="pronouns" defaultValue={profile?.pronouns ?? ""} placeholder="they/them" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="phonetic_name">
                    Name pronunciation
                  </label>
                  <Input
                    id="phonetic_name"
                    name="phonetic_name"
                    defaultValue={profile?.phonetic_name ?? ""}
                    placeholder="JEFF WEE-bur"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="headline">
                  Headline
                </label>
                <Input id="headline" name="headline" defaultValue={profile?.headline ?? ""} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subheadline">
                  Subheadline
                </label>
                <Input id="subheadline" name="subheadline" defaultValue={profile?.subheadline ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="summary">
                  Summary
                </label>
                <Textarea id="summary" name="summary" rows={3} defaultValue={profile?.summary ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="philosophy">
                  Philosophy
                </label>
                <Textarea
                  id="philosophy"
                  name="philosophy"
                  rows={3}
                  placeholder="Share a concise POV that frames your mission."
                  defaultValue={profile?.philosophy ?? ""}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="avatar_url">
                    Avatar URL
                  </label>
                  <Input id="avatar_url" name="avatar_url" defaultValue={profile?.avatar_url ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="location">
                    Location / availability
                  </label>
                  <Input id="location" name="location" defaultValue={profile?.location ?? ""} placeholder="Remote-first" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hiring_status">
                    Hiring status
                  </label>
                  <Input
                    id="hiring_status"
                    name="hiring_status"
                    defaultValue={profile?.hiring_status ?? ""}
                    placeholder="Open to Director-level security roles"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="resume_preference">
                    Default resume vertical
                  </label>
                  <select
                    id="resume_preference"
                    name="resume_preference"
                    defaultValue={profile?.resume_preference ?? "ai-security"}
                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <option value="ai-security">AI Security</option>
                    <option value="secure-devops">Secure DevOps</option>
                    <option value="soc">SOC</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cta_primary_label">
                    Primary CTA label
                  </label>
                  <Input
                    id="cta_primary_label"
                    name="cta_primary_label"
                    defaultValue={profile?.cta_primary_label ?? ""}
                    placeholder="Explore my work"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cta_primary_url">
                    Primary CTA URL
                  </label>
                  <Input id="cta_primary_url" name="cta_primary_url" defaultValue={profile?.cta_primary_url ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cta_secondary_label">
                    Secondary CTA label
                  </label>
                  <Input
                    id="cta_secondary_label"
                    name="cta_secondary_label"
                    defaultValue={profile?.cta_secondary_label ?? ""}
                    placeholder="Contact me"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cta_secondary_url">
                    Secondary CTA URL
                  </label>
                  <Input id="cta_secondary_url" name="cta_secondary_url" defaultValue={profile?.cta_secondary_url ?? ""} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="career_cta_label">
                    Career highlights CTA label
                  </label>
                  <Input
                    id="career_cta_label"
                    name="career_cta_label"
                    defaultValue={profile?.career_cta_label ?? ""}
                    placeholder="Read full case studies →"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="career_cta_url">
                    Career highlights CTA URL
                  </label>
                  <Input id="career_cta_url" name="career_cta_url" defaultValue={profile?.career_cta_url ?? ""} />
                </div>
              </div>
              {profileSaved ? <p className="text-sm text-emerald-600">Profile saved.</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-muted-foreground text-xs">
                  Tip: keep updates cohesive—adjust CTAs after adding new case studies.
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/profile">View profile</Link>
                  </Button>
                  <Button type="submit">Save profile</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <PillarsManager pillars={pillars} status={pillarStatus} detail={pillarStatus ? detail : undefined} />
        <CareerHighlightsManager
          highlights={highlights}
          status={careerStatus}
          detail={careerStatus ? detail : undefined}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <SpeakingManager
            speaking={speaking}
            status={speakingStatus}
            detail={speakingStatus ? detail : undefined}
          />
          <RecognitionManager
            recognitions={recognitions}
            status={recognitionStatus}
            detail={recognitionStatus ? detail : undefined}
          />
        </div>
        <TestimonialsManager
          testimonials={testimonials}
          status={testimonialStatus}
          detail={testimonialStatus ? detail : undefined}
        />
        <PersonalEntriesManager
          entries={personalEntries}
          status={personalStatus}
          detail={personalStatus ? detail : undefined}
        />
      </div>
    </div>
  );
}
