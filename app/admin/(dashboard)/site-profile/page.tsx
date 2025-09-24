import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSiteProfile } from "@/lib/supabase/queries";

import { upsertSiteProfile } from "./actions";

export default async function SiteProfileAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const profile = await getSiteProfile();
  const saved = sp?.status === "success";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Site Profile</h1>
        <p className="text-muted-foreground text-sm">
          Control public profile details like name, headline, summary, avatar, and availability.
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
            {/* Highlights removed from profile; hero metrics now derive from featured case studies. */}
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="speaking">
                    Speaking (one per line)
                  </label>
                  <Textarea
                    id="speaking"
                    name="speaking"
                    defaultValue={
                      (profile as unknown as { speaking?: string[] })?.speaking?.join("\n") ?? ""
                    }
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="certifications">
                    Certifications (one per line)
                  </label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    defaultValue={
                      (profile as unknown as { certifications?: string[] })?.certifications?.join(
                        "\n",
                      ) ?? ""
                    }
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="awards">
                    Awards (one per line)
                  </label>
                  <Textarea
                    id="awards"
                    name="awards"
                    defaultValue={
                      (profile as unknown as { awards?: string[] })?.awards?.join("\n") ?? ""
                    }
                    rows={5}
                  />
                </div>
              </div>
              {/* Highlights removed; managed via featured case studies. */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hobbies">
                    Hobbies (one per line)
                  </label>
                  <Textarea
                    id="hobbies"
                    name="hobbies"
                    defaultValue={(profile?.hobbies ?? []).join("\n")}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="interests">
                    Special interests (one per line)
                  </label>
                  <Textarea
                    id="interests"
                    name="interests"
                    defaultValue={(profile?.interests ?? []).join("\n")}
                    rows={5}
                  />
                </div>
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
