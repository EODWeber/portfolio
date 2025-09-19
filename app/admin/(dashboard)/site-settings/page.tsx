import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSiteSettings } from "@/lib/supabase/queries";

import { upsertSiteSettings } from "./actions";

type SiteSettingsPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function SiteSettingsAdminPage({ searchParams }: SiteSettingsPageProps) {
  const settings = await getSiteSettings();
  const saved = searchParams?.status === "success";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Site Settings</h1>
        <p className="text-muted-foreground text-sm">
          Update global metadata, CTAs, and brand copy reflected across the public site.
        </p>
      </header>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Brand configuration</CardTitle>
          <CardDescription>Changes apply immediately across the marketing surface.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertSiteSettings} className="space-y-4">
            <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="site_title">
                Site title
              </label>
              <Input
                id="site_title"
                name="site_title"
                defaultValue={settings?.site_title ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="site_tagline">
                Site tagline
              </label>
              <Input
                id="site_tagline"
                name="site_tagline"
                defaultValue={settings?.site_tagline ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="meta_description">
                Meta description
              </label>
              <Textarea
                id="meta_description"
                name="meta_description"
                defaultValue={settings?.meta_description ?? ""}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="primary_cta_label">
                  Primary CTA label
                </label>
                <Input
                  id="primary_cta_label"
                  name="primary_cta_label"
                  defaultValue={settings?.primary_cta_label ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="primary_cta_url">
                  Primary CTA URL
                </label>
                <Input
                  id="primary_cta_url"
                  name="primary_cta_url"
                  defaultValue={settings?.primary_cta_url ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="secondary_cta_label">
                  Secondary CTA label
                </label>
                <Input
                  id="secondary_cta_label"
                  name="secondary_cta_label"
                  defaultValue={settings?.secondary_cta_label ?? ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="secondary_cta_url">
                  Secondary CTA URL
                </label>
                <Input
                  id="secondary_cta_url"
                  name="secondary_cta_url"
                  defaultValue={settings?.secondary_cta_url ?? ""}
                />
              </div>
            </div>
            {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
