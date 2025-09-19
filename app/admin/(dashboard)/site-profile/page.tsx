import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { serializeHighlights } from "@/lib/admin/utils";
import { getSiteProfile } from "@/lib/supabase/queries";

import { upsertSiteProfile } from "./actions";

type SiteProfilePageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function SiteProfileAdminPage({ searchParams }: SiteProfilePageProps) {
  const profile = await getSiteProfile();
  const saved = searchParams?.status === "success";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Site Profile</h1>
        <p className="text-muted-foreground text-sm">
          Control hero messaging, hiring status, and highlighted outcomes rendered on the landing
          page.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Public preview</CardTitle>
            <CardDescription>Snapshot of what visitors see on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Badge variant="outline">{profile?.hiring_status ?? "Open to opportunities"}</Badge>
            <div>
              <p className="text-lg font-semibold">
                {profile?.headline ?? "Security-first engineering leader."}
              </p>
              <p className="text-muted-foreground mt-2">
                {profile?.summary ?? "Add a summary to describe your focus."}
              </p>
            </div>
            {profile?.highlights && profile.highlights.length > 0 ? (
              <ul className="text-muted-foreground space-y-2">
                {profile.highlights.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}</strong>
                    {item.value ? ` — ${item.value}` : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Add highlights to showcase outcomes.</p>
            )}
            {profile?.avatar_url ? (
              <div className="relative mt-4 h-32 w-32 overflow-hidden rounded-full border">
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Profile"}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>All fields are optional except the name and headline.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertSiteProfile} className="space-y-4">
              <input type="hidden" name="id" defaultValue={profile?.id ?? ""} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="full_name">
                  Full name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="headline">
                  Headline
                </label>
                <Input
                  id="headline"
                  name="headline"
                  defaultValue={profile?.headline ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subheadline">
                  Subheadline
                </label>
                <Input
                  id="subheadline"
                  name="subheadline"
                  defaultValue={profile?.subheadline ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="summary">
                  Summary
                </label>
                <Textarea
                  id="summary"
                  name="summary"
                  defaultValue={profile?.summary ?? ""}
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="avatar_url">
                    Avatar URL
                  </label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    defaultValue={profile?.avatar_url ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="location">
                    Location / availability
                  </label>
                  <Input id="location" name="location" defaultValue={profile?.location ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hiring_status">
                    Hiring status
                  </label>
                  <Input
                    id="hiring_status"
                    name="hiring_status"
                    defaultValue={profile?.hiring_status ?? ""}
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
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="highlights">
                  Highlights (one per line: Metric|Value)
                </label>
                <Textarea
                  id="highlights"
                  name="highlights"
                  defaultValue={serializeHighlights(profile?.highlights)}
                  rows={5}
                />
                <p className="text-muted-foreground text-xs">
                  Example: <code>7.3x tooling ROI|Fortune 100 fintech</code>
                </p>
              </div>
              {saved ? <p className="text-sm text-emerald-600">Profile saved.</p> : null}
              <div className="flex justify-end gap-3">
                <Button type="submit">Save profile</Button>
                <Button asChild variant="outline">
                  <Link href="/">View homepage</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
